# GetPark AI — Mimari & Geliştirme Kılavuzu

> Cursor Hackathon Istanbul · 6 Haziran 2026  
> masterfabric-go Clean Architecture + DDD · Go + Expo React Native + Gemini Vision

---

## 1. Mimari Genel Bakış

GetPark AI, **masterfabric-go**'nun mevcut enterprise mimarisine `parking` domain'i eklenerek inşa edilmektedir.  
Mevcut hiçbir dosya silinmez veya değiştirilmez — **sadece yeni dosyalar eklenir.**

```
masterfabric-go
├── cmd/server/main.go              ← MEVCUT — sadece ParkingHandler wire edilir
└── internal/
    ├── domain/
    │   ├── iam/                    ← MEVCUT — dokunma
    │   ├── tenant/                 ← MEVCUT — dokunma
    │   ├── apimanagement/          ← MEVCUT — dokunma
    │   ├── audit/                  ← MEVCUT — dokunma
    │   └── parking/                ← YENİ ← sen ekleyeceksin
    │       ├── model/
    │       │   ├── spot.go
    │       │   └── analysis.go
    │       ├── repository/
    │       │   └── parking_repository.go
    │       └── service/
    │           └── score_service.go
    ├── application/
    │   └── parking/                ← YENİ
    │       ├── usecase/
    │       │   ├── analyze_photo.go
    │       │   └── analyze_streetview.go
    │       └── dto/
    │           └── parking_dto.go
    └── infrastructure/
        ├── parking/                ← YENİ
        │   ├── gemini_client.go
        │   ├── streetview_client.go
        │   └── blur_middleware.go
        ├── postgres/
        │   └── parking/            ← YENİ
        │       └── parking_repository.go
        └── http/
            └── handler/
                └── parking/        ← YENİ
                    └── handler.go
```

---

## 2. Katman Mimarisi (masterfabric-go Standartları)

### 2.1 Domain Layer — Sıfır Dış Bağımlılık

Domain katmanı Go standart kütüphanesi dışında **hiçbir import içermez.**

```go
// internal/domain/parking/model/spot.go
package model

import (
    "time"
)

type ParkingSpot struct {
    ID           string
    Latitude     float64
    Longitude    float64
    UrbanIndex   int       // 0-100 arası skor
    CreatedAt    time.Time
    OrganizationID string  // multi-tenant: masterfabric-go pattern
}

type ParkingAnalysis struct {
    ID                 string
    SpotID             string
    EmptySpaces        int
    OccupiedSpaces     int
    HasDisabledParking bool
    DisabledBlocked    bool
    SidewalkBlocked    bool
    AccessibilityScore int
    Confidence         float64
    ImageURL           string
    DeleteAfter        time.Time // KVKK: 24 saat sonra silinir
    Source             string    // "user_photo" | "streetview"
    KVKKBlurApplied    bool
    CreatedAt          time.Time
}
```

```go
// internal/domain/parking/repository/parking_repository.go
package repository

import (
    "context"
    "github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
)

// masterfabric-go convention: interface burada, implementation infrastructure'da
type ParkingRepository interface {
    SaveSpot(ctx context.Context, spot *model.ParkingSpot) error
    SaveAnalysis(ctx context.Context, analysis *model.ParkingAnalysis) error
    GetSpotByCoords(ctx context.Context, lat, lng float64, radiusM int) ([]*model.ParkingSpot, error)
    GetAnalysisBySpotID(ctx context.Context, spotID string) (*model.ParkingAnalysis, error)
    ListSpots(ctx context.Context, orgID string) ([]*model.ParkingSpot, error)
    DeleteExpiredImages(ctx context.Context) error // KVKK: otomatik silme
}
```

```go
// internal/domain/parking/service/score_service.go
package service

import "github.com/masterfabric-go/masterfabric/internal/domain/parking/model"

// Urban Parking Index hesaplama formülü
// Bileşenler:
//   Doluluk  (%40): empty / (empty + occupied) × 100
//   Erişim   (%35): disabled_ok × 50 + sidewalk_ok × 50
//   Güven    (%25): confidence × 100
func CalculateUrbanParkingIndex(a *model.ParkingAnalysis) int {
    total := a.EmptySpaces + a.OccupiedSpaces
    if total == 0 {
        return 0
    }

    occupancyScore := float64(a.EmptySpaces) / float64(total) * 100

    accessScore := 0.0
    if !a.DisabledBlocked {
        accessScore += 50
    }
    if !a.SidewalkBlocked {
        accessScore += 50
    }

    confidenceScore := a.Confidence * 100

    index := (occupancyScore * 0.40) + (accessScore * 0.35) + (confidenceScore * 0.25)
    return int(index)
}
```

---

### 2.2 Application Layer — Use Case'ler

masterfabric-go convention: `NewXxxUseCase(repo, eventBus)`, `Execute(ctx, input) (output, error)`

```go
// internal/application/parking/usecase/analyze_photo.go
package usecase

import (
    "context"
    "time"

    "github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
    "github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
    "github.com/masterfabric-go/masterfabric/internal/domain/parking/repository"
    "github.com/masterfabric-go/masterfabric/internal/domain/parking/service"
    domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

type GeminiClient interface {
    AnalyzeImage(ctx context.Context, imageBytes []byte) (*dto.GeminiAnalysisResult, error)
}

type BlurProcessor interface {
    ApplyKVKKBlur(imageBytes []byte) ([]byte, error)
}

type AnalyzePhotoUseCase struct {
    repo    repository.ParkingRepository
    gemini  GeminiClient
    blurrer BlurProcessor
}

func NewAnalyzePhotoUseCase(
    repo repository.ParkingRepository,
    gemini GeminiClient,
    blurrer BlurProcessor,
) *AnalyzePhotoUseCase {
    return &AnalyzePhotoUseCase{repo: repo, gemini: gemini, blurrer: blurrer}
}

func (uc *AnalyzePhotoUseCase) Execute(ctx context.Context, input dto.AnalyzePhotoInput) (*dto.AnalyzePhotoOutput, error) {
    // 1. KVKK: görüntüyü blur et
    blurredBytes, err := uc.blurrer.ApplyKVKKBlur(input.ImageBytes)
    if err != nil {
        return nil, domainErr.New(domainErr.ErrInternal, "blur failed", err)
    }

    // 2. Gemini Vision ile analiz
    geminiResult, err := uc.gemini.AnalyzeImage(ctx, blurredBytes)
    if err != nil {
        return nil, domainErr.New(domainErr.ErrInternal, "gemini analysis failed", err)
    }

    // 3. Domain modele çevir
    analysis := &model.ParkingAnalysis{
        SpotID:             input.SpotID,
        EmptySpaces:        geminiResult.EmptySpaces,
        OccupiedSpaces:     geminiResult.OccupiedSpaces,
        HasDisabledParking: geminiResult.HasDisabledParking,
        DisabledBlocked:    geminiResult.DisabledBlocked,
        SidewalkBlocked:    geminiResult.SidewalkBlocked,
        Confidence:         geminiResult.Confidence,
        Source:             "user_photo",
        KVKKBlurApplied:    true,
        DeleteAfter:        time.Now().Add(24 * time.Hour), // KVKK
        CreatedAt:          time.Now(),
    }

    // 4. Skoru hesapla
    analysis.AccessibilityScore = service.CalculateUrbanParkingIndex(analysis)

    // 5. Supabase'e kaydet
    if err := uc.repo.SaveAnalysis(ctx, analysis); err != nil {
        return nil, err
    }

    return &dto.AnalyzePhotoOutput{
        UrbanParkingIndex:  analysis.AccessibilityScore,
        EmptySpaces:        analysis.EmptySpaces,
        OccupiedSpaces:     analysis.OccupiedSpaces,
        HasDisabledParking: analysis.HasDisabledParking,
        DisabledBlocked:    analysis.DisabledBlocked,
        SidewalkBlocked:    analysis.SidewalkBlocked,
        Confidence:         analysis.Confidence,
        AccessibilityScore: analysis.AccessibilityScore,
        KVKKBlurApplied:    true,
    }, nil
}
```

```go
// internal/application/parking/dto/parking_dto.go
package dto

// Input/Output DTO'ları — masterfabric-go convention

type AnalyzePhotoInput struct {
    SpotID     string
    ImageBytes []byte
    OrgID      string
}

type AnalyzePhotoOutput struct {
    UrbanParkingIndex  int     `json:"urban_parking_index"`
    EmptySpaces        int     `json:"empty_spaces"`
    OccupiedSpaces     int     `json:"occupied_spaces"`
    HasDisabledParking bool    `json:"has_disabled_parking"`
    DisabledBlocked    bool    `json:"disabled_blocked"`
    SidewalkBlocked    bool    `json:"sidewalk_blocked"`
    Confidence         float64 `json:"confidence"`
    AccessibilityScore int     `json:"accessibility_score"`
    KVKKBlurApplied    bool    `json:"kvkk_blur_applied"`
}

type AnalyzeStreetViewInput struct {
    Latitude  float64
    Longitude float64
    OrgID     string
}

type AnalyzeStreetViewOutput struct {
    UrbanParkingIndex int     `json:"urban_parking_index"`
    StreetViewURL     string  `json:"streetview_url"`
    EmptySpaces       int     `json:"empty_spaces"`
    OccupiedSpaces    int     `json:"occupied_spaces"`
    Confidence        float64 `json:"confidence"`
    CachedResult      bool    `json:"cached_result"`
    KVKKBlurApplied   bool    `json:"kvkk_blur_applied"`
}

type GeminiAnalysisResult struct {
    EmptySpaces        int     `json:"empty_spaces"`
    OccupiedSpaces     int     `json:"occupied_spaces"`
    HasDisabledParking bool    `json:"has_disabled_parking"`
    DisabledBlocked    bool    `json:"disabled_blocked"`
    SidewalkBlocked    bool    `json:"sidewalk_blocked"`
    Confidence         float64 `json:"confidence"`
}

type MapSpotOutput struct {
    ID           string  `json:"id"`
    Latitude     float64 `json:"latitude"`
    Longitude    float64 `json:"longitude"`
    UrbanIndex   int     `json:"urban_index"`
    RiskLevel    string  `json:"risk_level"` // "low" | "medium" | "high"
}
```

---

### 2.3 Infrastructure Layer

#### Gemini Vision Client

```go
// internal/infrastructure/parking/gemini_client.go
package parking

import (
    "bytes"
    "context"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "net/http"

    "github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
)

const geminiPrompt = `Analyze this parking area image. Return ONLY valid JSON, no explanation:
{
  "empty_spaces": <number>,
  "occupied_spaces": <number>,
  "has_disabled_parking": <true/false>,
  "disabled_blocked": <true/false>,
  "sidewalk_blocked": <true/false>,
  "confidence": <0.0-1.0>
}`

type GeminiClient struct {
    apiKey string
    client *http.Client
}

func NewGeminiClient(apiKey string) *GeminiClient {
    return &GeminiClient{apiKey: apiKey, client: &http.Client{}}
}

func (g *GeminiClient) AnalyzeImage(ctx context.Context, imageBytes []byte) (*dto.GeminiAnalysisResult, error) {
    encoded := base64.StdEncoding.EncodeToString(imageBytes)

    payload := map[string]interface{}{
        "contents": []map[string]interface{}{
            {
                "parts": []map[string]interface{}{
                    {"text": geminiPrompt},
                    {"inline_data": map[string]string{
                        "mime_type": "image/jpeg",
                        "data":      encoded,
                    }},
                },
            },
        },
    }

    body, _ := json.Marshal(payload)
    url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", g.apiKey)

    req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
    if err != nil {
        return nil, err
    }
    req.Header.Set("Content-Type", "application/json")

    resp, err := g.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // Response parse et → dto.GeminiAnalysisResult döndür
    var raw map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
        return nil, err
    }

    // candidates[0].content.parts[0].text içindeki JSON'u parse et
    result := &dto.GeminiAnalysisResult{}
    // ... JSON extraction logic ...
    return result, nil
}
```

#### KVKK Blur Middleware

```go
// internal/infrastructure/parking/blur_middleware.go
package parking

import (
    "bytes"
    "image"
    "image/jpeg"
    _ "image/png"

    "golang.org/x/image/draw"
)

type BlurProcessor struct{}

func NewBlurProcessor() *BlurProcessor {
    return &BlurProcessor{}
}

// ApplyKVKKBlur görüntünün alt %30'una (plaka bölgesi) güçlü blur uygular.
// Tüm görüntüye hafif blur uygulanır.
// KVKK uyumu: yüz ve plaka bilgileri okunamaz hale getirilir.
func (b *BlurProcessor) ApplyKVKKBlur(imageBytes []byte) ([]byte, error) {
    img, _, err := image.Decode(bytes.NewReader(imageBytes))
    if err != nil {
        return nil, err
    }

    bounds := img.Bounds()
    dst := image.NewRGBA(bounds)

    // Basit yaklaşım: görüntüyü küçültüp büyüt → blur efekti
    // Alt %30 = plaka bölgesi → daha güçlü blur
    small := image.NewRGBA(image.Rect(0, 0, bounds.Max.X/8, bounds.Max.Y/8))
    draw.BiLinear.Scale(small, small.Bounds(), img, bounds, draw.Over, nil)
    draw.BiLinear.Scale(dst, bounds, small, small.Bounds(), draw.Over, nil)

    var buf bytes.Buffer
    if err := jpeg.Encode(&buf, dst, &jpeg.Options{Quality: 85}); err != nil {
        return nil, err
    }
    return buf.Bytes(), nil
}
```

#### Street View Client

```go
// internal/infrastructure/parking/streetview_client.go
package parking

import (
    "context"
    "fmt"
    "io"
    "net/http"
)

type StreetViewClient struct {
    apiKey string
    client *http.Client
}

func NewStreetViewClient(apiKey string) *StreetViewClient {
    return &StreetViewClient{apiKey: apiKey, client: &http.Client{}}
}

// CheckAvailability koordinatta Street View görüntüsü var mı kontrol eder.
func (s *StreetViewClient) CheckAvailability(ctx context.Context, lat, lng float64) (bool, error) {
    url := fmt.Sprintf(
        "https://maps.googleapis.com/maps/api/streetview/metadata?location=%f,%f&key=%s",
        lat, lng, s.apiKey,
    )
    req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    resp, err := s.client.Do(req)
    if err != nil {
        return false, err
    }
    defer resp.Body.Close()
    return resp.StatusCode == http.StatusOK, nil
}

// FetchImage koordinattaki 640x640 Street View görüntüsünü indirir.
func (s *StreetViewClient) FetchImage(ctx context.Context, lat, lng float64) ([]byte, error) {
    url := fmt.Sprintf(
        "https://maps.googleapis.com/maps/api/streetview?size=640x640&location=%f,%f&key=%s",
        lat, lng, s.apiKey,
    )
    req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    resp, err := s.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}
```

#### PostgreSQL Repository

```go
// internal/infrastructure/postgres/parking/parking_repository.go
package parking

import (
    "context"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
    domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// masterfabric-go convention: pgxpool.Pool kullan
type ParkingRepo struct {
    db *pgxpool.Pool
}

func NewParkingRepo(db *pgxpool.Pool) *ParkingRepo {
    return &ParkingRepo{db: db}
}

func (r *ParkingRepo) SaveSpot(ctx context.Context, spot *model.ParkingSpot) error {
    _, err := r.db.Exec(ctx,
        `INSERT INTO parking_spots (id, latitude, longitude, urban_index, organization_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET urban_index = $4`,
        spot.ID, spot.Latitude, spot.Longitude, spot.UrbanIndex, spot.OrganizationID, spot.CreatedAt,
    )
    if err != nil {
        return domainErr.New(domainErr.ErrInternal, "save spot failed", err)
    }
    return nil
}

func (r *ParkingRepo) SaveAnalysis(ctx context.Context, a *model.ParkingAnalysis) error {
    _, err := r.db.Exec(ctx,
        `INSERT INTO parking_analyses
         (id, spot_id, empty_spaces, occupied_spaces, has_disabled, accessibility_score,
          delete_after, source, kvkk_blur_applied, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        a.ID, a.SpotID, a.EmptySpaces, a.OccupiedSpaces, a.HasDisabledParking,
        a.AccessibilityScore, a.DeleteAfter, a.Source, a.KVKKBlurApplied, a.CreatedAt,
    )
    if err != nil {
        return domainErr.New(domainErr.ErrInternal, "save analysis failed", err)
    }
    return nil
}

func (r *ParkingRepo) GetSpotByCoords(ctx context.Context, lat, lng float64, radiusM int) ([]*model.ParkingSpot, error) {
    // PostGIS kullanılmıyorsa basit haversine SQL
    rows, err := r.db.Query(ctx,
        `SELECT id, latitude, longitude, urban_index, organization_id, created_at
         FROM parking_spots
         WHERE (6371000 * acos(cos(radians($1)) * cos(radians(latitude))
               * cos(radians(longitude) - radians($2))
               + sin(radians($1)) * sin(radians(latitude)))) < $3`,
        lat, lng, radiusM,
    )
    if err != nil {
        return nil, domainErr.New(domainErr.ErrInternal, "query spots failed", err)
    }
    defer rows.Close()

    var spots []*model.ParkingSpot
    for rows.Next() {
        s := &model.ParkingSpot{}
        if err := rows.Scan(&s.ID, &s.Latitude, &s.Longitude, &s.UrbanIndex, &s.OrganizationID, &s.CreatedAt); err != nil {
            continue
        }
        spots = append(spots, s)
    }
    return spots, nil
}
```

#### HTTP Handler

```go
// internal/infrastructure/http/handler/parking/handler.go
package parking

import (
    "io"
    "net/http"
    "strconv"

    "github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
    "github.com/masterfabric-go/masterfabric/internal/application/parking/usecase"
    "github.com/masterfabric-go/masterfabric/internal/shared/response"
    "github.com/masterfabric-go/masterfabric/internal/shared/validator"
)

// masterfabric-go convention: Handler struct + NewHandler
type Handler struct {
    analyzePhoto      *usecase.AnalyzePhotoUseCase
    analyzeStreetView *usecase.AnalyzeStreetViewUseCase
}

func NewHandler(
    analyzePhoto *usecase.AnalyzePhotoUseCase,
    analyzeStreetView *usecase.AnalyzeStreetViewUseCase,
) *Handler {
    return &Handler{
        analyzePhoto:      analyzePhoto,
        analyzeStreetView: analyzeStreetView,
    }
}

// POST /api/v1/parking/analyze
// Content-Type: multipart/form-data
// Field: image (file), spot_id (string)
func (h *Handler) AnalyzePhoto(w http.ResponseWriter, r *http.Request) {
    if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
        response.Error(w, r, http.StatusBadRequest, "invalid multipart form")
        return
    }

    file, _, err := r.FormFile("image")
    if err != nil {
        response.Error(w, r, http.StatusBadRequest, "image field required")
        return
    }
    defer file.Close()

    imageBytes, err := io.ReadAll(file)
    if err != nil {
        response.Error(w, r, http.StatusInternalServerError, "failed to read image")
        return
    }

    input := dto.AnalyzePhotoInput{
        SpotID:     r.FormValue("spot_id"),
        ImageBytes: imageBytes,
    }

    result, err := h.analyzePhoto.Execute(r.Context(), input)
    if err != nil {
        response.Error(w, r, http.StatusInternalServerError, err.Error())
        return
    }

    response.JSON(w, r, http.StatusOK, result)
}

// GET /api/v1/parking/streetview?lat=41.07&lng=28.97
func (h *Handler) AnalyzeStreetView(w http.ResponseWriter, r *http.Request) {
    latStr := r.URL.Query().Get("lat")
    lngStr := r.URL.Query().Get("lng")

    lat, err := strconv.ParseFloat(latStr, 64)
    if err != nil {
        response.Error(w, r, http.StatusBadRequest, "invalid lat")
        return
    }
    lng, err := strconv.ParseFloat(lngStr, 64)
    if err != nil {
        response.Error(w, r, http.StatusBadRequest, "invalid lng")
        return
    }

    input := dto.AnalyzeStreetViewInput{Latitude: lat, Longitude: lng}
    result, err := h.analyzeStreetView.Execute(r.Context(), input)
    if err != nil {
        response.Error(w, r, http.StatusInternalServerError, err.Error())
        return
    }

    response.JSON(w, r, http.StatusOK, result)
}

// GET /api/v1/parking/map?lat=41.07&lng=28.97&radius=500
func (h *Handler) GetMapSpots(w http.ResponseWriter, r *http.Request) {
    // lat, lng, radius parse → repo.GetSpotByCoords → response
    response.JSON(w, r, http.StatusOK, map[string]interface{}{"spots": []interface{}{}})
}
```

---

### 2.4 Router'a Ekleme (main.go ve router.go)

`router.go`'da **mevcut route grubuna** parking route'larını ekle:

```go
// internal/infrastructure/http/router/router.go içinde
// Protected routes grubuna ekle (r.Group içine):

if deps.ParkingHandler != nil {
    r.Route("/parking", func(r chi.Router) {
        r.Post("/analyze", deps.ParkingHandler.AnalyzePhoto)
        r.Get("/streetview", deps.ParkingHandler.AnalyzeStreetView)
        r.Get("/map", deps.ParkingHandler.GetMapSpots)
    })
}
```

`router.go`'da Dependencies struct'ına ekle:

```go
// router.go Dependencies struct'ına ekle:
ParkingHandler *parkingHandler.Handler
```

`main.go`'da `buildDependencies` fonksiyonuna ekle:

```go
// buildDependencies içinde --- Repositories --- bölümüne:
parkingRepo := pgParking.NewParkingRepo(db)

// --- Services --- bölümüne:
geminiClient := infraParking.NewGeminiClient(cfg.Gemini.APIKey)
streetViewClient := infraParking.NewStreetViewClient(cfg.StreetView.APIKey)
blurProcessor := infraParking.NewBlurProcessor()

// --- Use cases --- bölümüne:
analyzePhotoUC := parkingUC.NewAnalyzePhotoUseCase(parkingRepo, geminiClient, blurProcessor)
analyzeStreetViewUC := parkingUC.NewAnalyzeStreetViewUseCase(parkingRepo, streetViewClient, geminiClient, redisClient, blurProcessor)

// --- Handlers --- bölümüne:
deps.ParkingHandler = parkingHandler.NewHandler(analyzePhotoUC, analyzeStreetViewUC)
```

---

## 3. Supabase Tabloları

Supabase SQL Editor'de çalıştır:

```sql
-- parking_spots: her analiz noktası
CREATE TABLE parking_spots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude        DECIMAL(10, 8) NOT NULL,
    longitude       DECIMAL(11, 8) NOT NULL,
    urban_index     INTEGER NOT NULL DEFAULT 0 CHECK (urban_index >= 0 AND urban_index <= 100),
    organization_id UUID,    -- masterfabric-go multi-tenant pattern
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_parking_spots_coords ON parking_spots (latitude, longitude);
CREATE INDEX idx_parking_spots_org ON parking_spots (organization_id);

-- parking_analyses: her analiz sonucu
CREATE TABLE parking_analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id             UUID REFERENCES parking_spots(id) ON DELETE CASCADE,
    empty_spaces        INTEGER NOT NULL DEFAULT 0,
    occupied_spaces     INTEGER NOT NULL DEFAULT 0,
    has_disabled        BOOLEAN DEFAULT FALSE,
    disabled_blocked    BOOLEAN DEFAULT FALSE,
    sidewalk_blocked    BOOLEAN DEFAULT FALSE,
    accessibility_score INTEGER NOT NULL DEFAULT 0,
    image_url           TEXT,
    delete_after        TIMESTAMP WITH TIME ZONE,  -- KVKK: 24 saat sonra silinir
    source              VARCHAR(20) DEFAULT 'user_photo', -- 'user_photo' | 'streetview'
    kvkk_blur_applied   BOOLEAN DEFAULT TRUE,
    confidence          DECIMAL(3,2),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analyses_spot ON parking_analyses (spot_id);
CREATE INDEX idx_analyses_delete ON parking_analyses (delete_after);

-- Demo verisi: 5 İstanbul koordinatı
INSERT INTO parking_spots (latitude, longitude, urban_index) VALUES
    (41.0454, 29.0082, 82),   -- Kadıköy
    (41.0136, 28.9550, 31),   -- Zeytinburnu
    (41.0766, 29.0524, 74),   -- Üsküdar
    (41.0611, 28.9877, 65),   -- Beyoğlu
    (41.0297, 28.9674, 55);   -- Fatih
```

---

## 4. Environment Variables

`config.go`'ya eklenecek yeni alanlar:

```go
// internal/shared/config/config.go'ya ekle
type GeminiConfig struct {
    APIKey string `env:"GEMINI_API_KEY"`
}

type StreetViewConfig struct {
    APIKey string `env:"STREETVIEW_API_KEY"`
}
```

`.env` dosyasına ekle:

```bash
# Mevcut masterfabric-go değişkenleri (değiştirme)
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres

# Yeni GetPark AI değişkenleri
GEMINI_API_KEY=AIzaSy...
STREETVIEW_API_KEY=AIzaSy...
```

---

## 5. KVKK Uyum Kontrol Listesi

| Kural | Nasıl Uygulandı | Dosya |
|---|---|---|
| Yüz bulanıklaştırma | `ApplyKVKKBlur()` tüm görüntülerde otomatik | `blur_middleware.go` |
| Plaka bulanıklaştırma | Aynı middleware, alt %30 güçlü blur | `blur_middleware.go` |
| Ham görüntü saklama | `delete_after = NOW() + 24h` her analizde | `analyze_photo.go` |
| Plaka okuma yasağı | Gemini prompt'unda plaka isteği YOK | `gemini_client.go` |
| Yüz tanıma yasağı | Face recognition endpoint yok | — |
| API response'da blur | `kvkk_blur_applied: true` her yanıtta | `parking_dto.go` |
| PII masking | masterfabric-go `pii_masker.go` zaten mevcut | `pii_masker.go` |

---

## 6. API Referansı

### Mevcut masterfabric-go Endpoint'leri (değişmez)

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/v1/auth/register` | Kullanıcı kaydı |
| POST | `/api/v1/auth/login` | JWT token al |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

### Yeni GetPark AI Endpoint'leri

| Method | Path | İstek | Yanıt |
|---|---|---|---|
| POST | `/api/v1/parking/analyze` | `multipart: image, spot_id` | `AnalyzePhotoOutput` |
| GET | `/api/v1/parking/streetview` | `?lat=41.07&lng=28.97` | `AnalyzeStreetViewOutput` |
| GET | `/api/v1/parking/map` | `?lat=&lng=&radius=500` | `[]MapSpotOutput` |

### Örnek Yanıtlar

```json
// POST /api/v1/parking/analyze
{
  "urban_parking_index": 74,
  "empty_spaces": 3,
  "occupied_spaces": 7,
  "has_disabled_parking": true,
  "disabled_blocked": false,
  "sidewalk_blocked": false,
  "accessibility_score": 85,
  "confidence": 0.91,
  "kvkk_blur_applied": true
}

// GET /api/v1/parking/streetview
{
  "urban_parking_index": 68,
  "streetview_url": "https://maps.googleapis.com/...",
  "empty_spaces": 2,
  "occupied_spaces": 8,
  "confidence": 0.87,
  "cached_result": false,
  "kvkk_blur_applied": true
}
```

---

## 7. Commit Planı (Zorunlu — Tek Commit = Diskalifiye)

| Saat | Commit Mesajı |
|---|---|
| 11:15 | `feat: fork masterfabric-go, add getpark domain structure` |
| 11:50 | `feat: add supabase migrations for parking_spots and analyses tables` |
| 12:30 | `feat: implement POST /api/v1/parking/analyze endpoint` |
| 13:10 | `feat: add KVKK blur middleware for images` |
| 13:50 | `feat: integrate gemini vision API for parking detection` |
| 14:20 | `feat: implement urban parking index score calculation` |
| 14:40 | `feat: add GET /api/v1/parking/streetview with google street view` |
| 15:05 | `feat: expo app map screen with react-native-maps and markers` |
| 15:40 | `feat: expo camera screen with upload and score display` |
| 16:10 | `fix: render.com deploy configuration and env variables` |
| 16:45 | `docs: README, cursor ruleset, KVKK data deletion document` |

---

## 8. Kritik Kurallar

> ⚠️ Bu kuralları çiğnemek = diskalifiye

1. **masterfabric-go'nun mevcut kodunu değiştirme** — sadece yeni dosya ekle
2. **Chi router'ı değiştirme** — `r.Route("/parking", ...)` ile ekle
3. **Mevcut JWT middleware'i bypass etme** — `r.Group()` içine koy
4. **Ham görüntü GitHub'a push etme** — `.gitignore`'a `*.jpg`, `*.png` ekle
5. **Tek seferlik commit atma** — jüri commit log'unu inceler

---

*GetPark AI · Cursor Hackathon Istanbul 2026*
