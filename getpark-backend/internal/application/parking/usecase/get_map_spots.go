package usecase

import (
	"context"

	"github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/repository"
	"github.com/masterfabric-go/masterfabric/internal/domain/parking/service"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// GetMapSpotsUseCase harita için yakın park noktalarını getirir.
type GetMapSpotsUseCase struct {
	repo repository.ParkingRepository
}

func NewGetMapSpotsUseCase(repo repository.ParkingRepository) *GetMapSpotsUseCase {
	return &GetMapSpotsUseCase{repo: repo}
}

func (uc *GetMapSpotsUseCase) Execute(ctx context.Context, lat, lng float64, radiusM int) ([]*dto.MapSpotOutput, error) {
	if radiusM <= 0 {
		radiusM = 500
	}
	if radiusM > 5000 {
		radiusM = 5000
	}

	spots, err := uc.repo.GetSpotByCoords(ctx, lat, lng, radiusM)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "list spots failed", err)
	}

	out := make([]*dto.MapSpotOutput, 0, len(spots))
	for _, s := range spots {
		out = append(out, &dto.MapSpotOutput{
			ID:        s.ID,
			Latitude:  s.Latitude,
			Longitude: s.Longitude,
			Index:     s.UrbanIndex,
			RiskLevel: service.ClassifyRisk(s.UrbanIndex),
		})
	}
	return out, nil
}
