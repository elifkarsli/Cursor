package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/repository"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/service"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// StreetViewClient Google Street View API arayüzü.
type StreetViewClient interface {
	CheckAvailability(ctx context.Context, lat, lng float64) (bool, error)
	FetchImage(ctx context.Context, lat, lng float64) ([]byte, string, error) // bytes, url, error
}

// AnalyzeStreetViewUseCase koordinat alır, Street View görüntüsü indirir, analiz yapar.
type AnalyzeStreetViewUseCase struct {
	repo        repository.ParkingRepository
	streetView  StreetViewClient
	gemini      GeminiClient
	redis       *redis.Client
	blurrer     BlurProcessor
}

func NewAnalyzeStreetViewUseCase(
	repo repository.ParkingRepository,
	streetView StreetViewClient,
	gemini GeminiClient,
	redis *redis.Client,
	blurrer BlurProcessor,
) *AnalyzeStreetViewUseCase {
	return &AnalyzeStreetViewUseCase{
		repo:       repo,
		streetView: streetView,
		gemini:     gemini,
		redis:      redis,
		blurrer:    blurrer,
	}
}

func (uc *AnalyzeStreetViewUseCase) Execute(ctx context.Context, input dto.AnalyzeStreetViewInput) (*dto.AnalyzeStreetViewOutput, error) {
	cacheKey := fmt.Sprintf("streetview:%f:%f", input.Latitude, input.Longitude)

	// 1. Redis cache kontrolü
	if uc.redis != nil {
		cached, err := uc.redis.Get(ctx, cacheKey).Bytes()
		if err == nil && len(cached) > 0 {
			// Cache hit: Gemini'ye tekrar gitme
			geminiResult, err := uc.gemini.AnalyzeImage(ctx, cached)
			if err == nil {
				analysis := buildAnalysis("", geminiResult, model.SourceStreetView)
				index := service.CalculateUrbanParkingIndex(analysis)
				return &dto.AnalyzeStreetViewOutput{
					UrbanParkingIndex: index,
					EmptySpaces:       geminiResult.EmptySpaces,
					OccupiedSpaces:    geminiResult.OccupiedSpaces,
					Confidence:        geminiResult.Confidence,
					RiskLevel:         service.ClassifyRisk(index),
					CachedResult:      true,
					KVKKBlurApplied:   true,
				}, nil
			}
		}
	}

	// 2. Street View görüntüsü var mı?
	available, err := uc.streetView.CheckAvailability(ctx, input.Latitude, input.Longitude)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "streetview check failed", err)
	}
	if !available {
		return nil, domainErr.New(domainErr.ErrNotFound, "no street view image at this location", nil)
	}

	// 3. Görüntüyü indir
	imageBytes, imageURL, err := uc.streetView.FetchImage(ctx, input.Latitude, input.Longitude)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "streetview fetch failed", err)
	}

	// 4. KVKK blur uygula (Street View'da Google zaten blur uyguluyor ama biz de uyguluyoruz)
	blurredBytes, err := uc.blurrer.ApplyKVKKBlur(imageBytes)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "kvkk blur failed", err)
	}

	// 5. Redis'e cache'le (1 saat)
	if uc.redis != nil {
		uc.redis.Set(ctx, cacheKey, blurredBytes, time.Hour)
	}

	// 6. Gemini analizi
	geminiResult, err := uc.gemini.AnalyzeImage(ctx, blurredBytes)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini analysis failed", err)
	}

	// 7. SpotID oluştur, skoru hesapla
	spotID := uuid.NewString()
	spot := &model.ParkingSpot{
		ID:             spotID,
		Latitude:       input.Latitude,
		Longitude:      input.Longitude,
		OrganizationID: input.OrgID,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	analysis := buildAnalysis(spotID, geminiResult, model.SourceStreetView)
	analysis.ImageURL = imageURL
	index := service.CalculateUrbanParkingIndex(analysis)
	analysis.AccessibilityScore = index
	spot.UrbanIndex = index

	// 8. Kaydet
	if err := uc.repo.SaveSpot(ctx, spot); err != nil {
		return nil, err
	}
	if err := uc.repo.SaveAnalysis(ctx, analysis); err != nil {
		return nil, err
	}

	return &dto.AnalyzeStreetViewOutput{
		SpotID:            spotID,
		UrbanParkingIndex: index,
		StreetViewURL:     imageURL,
		EmptySpaces:       geminiResult.EmptySpaces,
		OccupiedSpaces:    geminiResult.OccupiedSpaces,
		Confidence:        geminiResult.Confidence,
		RiskLevel:         service.ClassifyRisk(index),
		CachedResult:      false,
		KVKKBlurApplied:   true,
	}, nil
}

func buildAnalysis(spotID string, g *dto.GeminiAnalysisResult, src model.AnalysisSource) *model.ParkingAnalysis {
	return &model.ParkingAnalysis{
		ID:                 uuid.NewString(),
		SpotID:             spotID,
		EmptySpaces:        g.EmptySpaces,
		OccupiedSpaces:     g.OccupiedSpaces,
		HasDisabledParking: g.HasDisabledParking,
		DisabledBlocked:    g.DisabledBlocked,
		SidewalkBlocked:    g.SidewalkBlocked,
		Confidence:         g.Confidence,
		Source:             src,
		KVKKBlurApplied:    true,
		DeleteAfter:        time.Now().Add(24 * time.Hour),
		CreatedAt:          time.Now(),
	}
}
