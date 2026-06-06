package repository

import (
	"context"

	"github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
)

// ParkingRepository veritabanı işlemlerinin interface tanımıdır.
// Implementation internal/infrastructure/postgres/parking/ altındadır.
type ParkingRepository interface {
	SaveSpot(ctx context.Context, spot *model.ParkingSpot) error
	UpdateSpotIndex(ctx context.Context, spotID string, index int) error
	SaveAnalysis(ctx context.Context, analysis *model.ParkingAnalysis) error
	GetSpotByID(ctx context.Context, id string) (*model.ParkingSpot, error)
	GetSpotByCoords(ctx context.Context, lat, lng float64, radiusMeters int) ([]*model.ParkingSpot, error)
	GetLatestAnalysisBySpotID(ctx context.Context, spotID string) (*model.ParkingAnalysis, error)
	ListSpotsByOrg(ctx context.Context, orgID string) ([]*model.ParkingSpot, error)
	DeleteExpiredImages(ctx context.Context) (int, error) // KVKK: delete_after geçmiş kayıtları sil
}
