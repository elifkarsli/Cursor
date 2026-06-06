package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/repository"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/service"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// GeminiClient Gemini Vision API arayüzü.
type GeminiClient interface {
	AnalyzeImage(ctx context.Context, imageBytes []byte) (*dto.GeminiAnalysisResult, error)
}

// BlurProcessor KVKK blur arayüzü.
type BlurProcessor interface {
	ApplyKVKKBlur(imageBytes []byte) ([]byte, error)
}

// AnalyzePhotoUseCase kullanıcı fotoğrafı alır, KVKK blur uygular, Gemini'ye gönderir ve skoru hesaplar.
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
	// 1. KVKK: fotoğrafı blur et — ham görüntü asla işlenmez
	blurredBytes, err := uc.blurrer.ApplyKVKKBlur(input.ImageBytes)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "kvkk blur failed", err)
	}

	// 2. Gemini Vision API'ye gönder
	geminiResult, err := uc.gemini.AnalyzeImage(ctx, blurredBytes)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini analysis failed", err)
	}

	// 3. SpotID yoksa yeni oluştur
	spotID := input.SpotID
	if spotID == "" {
		spotID = uuid.NewString()
	}

	// 4. Park noktasını kaydet / güncelle
	spot := &model.ParkingSpot{
		ID:             spotID,
		Latitude:       input.Latitude,
		Longitude:      input.Longitude,
		OrganizationID: input.OrgID,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// 5. Analiz domain modeli oluştur
	analysis := &model.ParkingAnalysis{
		ID:                 uuid.NewString(),
		SpotID:             spotID,
		EmptySpaces:        geminiResult.EmptySpaces,
		OccupiedSpaces:     geminiResult.OccupiedSpaces,
		HasDisabledParking: geminiResult.HasDisabledParking,
		DisabledBlocked:    geminiResult.DisabledBlocked,
		SidewalkBlocked:    geminiResult.SidewalkBlocked,
		Confidence:         geminiResult.Confidence,
		Source:             model.SourceUserPhoto,
		KVKKBlurApplied:    true,
		DeleteAfter:        time.Now().Add(24 * time.Hour), // KVKK: 24 saat sonra silinir
		CreatedAt:          time.Now(),
	}

	// 6. Urban Parking Index hesapla
	analysis.AccessibilityScore = service.CalculateUrbanParkingIndex(analysis)
	spot.UrbanIndex = analysis.AccessibilityScore

	// 7. Veritabanına kaydet
	if err := uc.repo.SaveSpot(ctx, spot); err != nil {
		return nil, err
	}
	if err := uc.repo.SaveAnalysis(ctx, analysis); err != nil {
		return nil, err
	}

	return &dto.AnalyzePhotoOutput{
		SpotID:             spotID,
		UrbanParkingIndex:  analysis.AccessibilityScore,
		EmptySpaces:        analysis.EmptySpaces,
		OccupiedSpaces:     analysis.OccupiedSpaces,
		HasDisabledParking: analysis.HasDisabledParking,
		DisabledBlocked:    analysis.DisabledBlocked,
		SidewalkBlocked:    analysis.SidewalkBlocked,
		AccessibilityScore: analysis.AccessibilityScore,
		Confidence:         analysis.Confidence,
		RiskLevel:          service.ClassifyRisk(analysis.AccessibilityScore),
		KVKKBlurApplied:    true,
	}, nil
}
