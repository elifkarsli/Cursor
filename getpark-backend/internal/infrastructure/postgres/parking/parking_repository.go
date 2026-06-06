package parking

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/masterfabric-go/masterfabric/internal/domain/parking/model"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// ParkingRepo Supabase (PostgreSQL) üzerinde parking tabloları için repository implementasyonu.
// masterfabric-go convention: pgxpool.Pool kullan, pgx.ErrNoRows ile not-found kontrol et.
type ParkingRepo struct {
	db *pgxpool.Pool
}

func NewParkingRepo(db *pgxpool.Pool) *ParkingRepo {
	return &ParkingRepo{db: db}
}

func nullableOrgID(orgID string) any {
	if orgID == "" {
		return nil
	}
	return orgID
}

// SaveSpot park noktasını ekler; zaten varsa urban_index günceller.
func (r *ParkingRepo) SaveSpot(ctx context.Context, spot *model.ParkingSpot) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO parking_spots (id, latitude, longitude, urban_index, organization_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO UPDATE
		  SET urban_index = EXCLUDED.urban_index,
		      updated_at  = EXCLUDED.updated_at
	`, spot.ID, spot.Latitude, spot.Longitude, spot.UrbanIndex,
		nullableOrgID(spot.OrganizationID), spot.CreatedAt, time.Now())
	if err != nil {
		return domainErr.New(domainErr.ErrInternal, "save parking spot failed", err)
	}
	return nil
}

// UpdateSpotIndex mevcut bir park noktasının urban_index değerini günceller.
func (r *ParkingRepo) UpdateSpotIndex(ctx context.Context, spotID string, index int) error {
	_, err := r.db.Exec(ctx, `
		UPDATE parking_spots SET urban_index = $1, updated_at = $2 WHERE id = $3
	`, index, time.Now(), spotID)
	if err != nil {
		return domainErr.New(domainErr.ErrInternal, "update spot index failed", err)
	}
	return nil
}

// SaveAnalysis analiz sonucunu kaydeder.
func (r *ParkingRepo) SaveAnalysis(ctx context.Context, a *model.ParkingAnalysis) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO parking_analyses
		  (id, spot_id, empty_spaces, occupied_spaces, has_disabled,
		   disabled_blocked, sidewalk_blocked, accessibility_score, confidence,
		   image_url, delete_after, source, kvkk_blur_applied, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
	`, a.ID, a.SpotID, a.EmptySpaces, a.OccupiedSpaces, a.HasDisabledParking,
		a.DisabledBlocked, a.SidewalkBlocked, a.AccessibilityScore, a.Confidence,
		a.ImageURL, a.DeleteAfter, string(a.Source), a.KVKKBlurApplied, a.CreatedAt)
	if err != nil {
		return domainErr.New(domainErr.ErrInternal, "save parking analysis failed", err)
	}
	return nil
}

// GetSpotByID ID'ye göre park noktası getirir.
func (r *ParkingRepo) GetSpotByID(ctx context.Context, id string) (*model.ParkingSpot, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, latitude, longitude, urban_index, COALESCE(organization_id::text,''), created_at, updated_at
		FROM parking_spots WHERE id = $1
	`, id)

	s := &model.ParkingSpot{}
	err := row.Scan(&s.ID, &s.Latitude, &s.Longitude, &s.UrbanIndex, &s.OrganizationID, &s.CreatedAt, &s.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, domainErr.New(domainErr.ErrNotFound, "parking spot not found", nil)
	}
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "get spot failed", err)
	}
	return s, nil
}

// GetSpotByCoords belirtilen koordinata yakın park noktalarını döndürür (Haversine formülü).
func (r *ParkingRepo) GetSpotByCoords(ctx context.Context, lat, lng float64, radiusMeters int) ([]*model.ParkingSpot, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, latitude, longitude, urban_index, COALESCE(organization_id::text,''), created_at, updated_at
		FROM parking_spots
		WHERE (
		  6371000 * acos(
		    cos(radians($1)) * cos(radians(latitude))
		    * cos(radians(longitude) - radians($2))
		    + sin(radians($1)) * sin(radians(latitude))
		  )
		) <= $3
		ORDER BY urban_index DESC
		LIMIT 50
	`, lat, lng, radiusMeters)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "get spots by coords failed", err)
	}
	defer rows.Close()

	var spots []*model.ParkingSpot
	for rows.Next() {
		s := &model.ParkingSpot{}
		if err := rows.Scan(&s.ID, &s.Latitude, &s.Longitude, &s.UrbanIndex, &s.OrganizationID, &s.CreatedAt, &s.UpdatedAt); err != nil {
			continue
		}
		spots = append(spots, s)
	}
	return spots, nil
}

// GetLatestAnalysisBySpotID bir park noktasının en son analizini döndürür.
func (r *ParkingRepo) GetLatestAnalysisBySpotID(ctx context.Context, spotID string) (*model.ParkingAnalysis, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, spot_id, empty_spaces, occupied_spaces, has_disabled,
		       disabled_blocked, sidewalk_blocked, accessibility_score, confidence,
		       COALESCE(image_url,''), delete_after, source, kvkk_blur_applied, created_at
		FROM parking_analyses
		WHERE spot_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`, spotID)

	a := &model.ParkingAnalysis{}
	var src string
	err := row.Scan(&a.ID, &a.SpotID, &a.EmptySpaces, &a.OccupiedSpaces, &a.HasDisabledParking,
		&a.DisabledBlocked, &a.SidewalkBlocked, &a.AccessibilityScore, &a.Confidence,
		&a.ImageURL, &a.DeleteAfter, &src, &a.KVKKBlurApplied, &a.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, domainErr.New(domainErr.ErrNotFound, "analysis not found", nil)
	}
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "get analysis failed", err)
	}
	a.Source = model.AnalysisSource(src)
	return a, nil
}

// ListSpotsByOrg organizasyona ait tüm park noktalarını listeler.
func (r *ParkingRepo) ListSpotsByOrg(ctx context.Context, orgID string) ([]*model.ParkingSpot, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, latitude, longitude, urban_index, COALESCE(organization_id::text,''), created_at, updated_at
		FROM parking_spots
		WHERE organization_id = $1
		ORDER BY created_at DESC
	`, orgID)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "list spots failed", err)
	}
	defer rows.Close()

	var spots []*model.ParkingSpot
	for rows.Next() {
		s := &model.ParkingSpot{}
		if err := rows.Scan(&s.ID, &s.Latitude, &s.Longitude, &s.UrbanIndex, &s.OrganizationID, &s.CreatedAt, &s.UpdatedAt); err != nil {
			continue
		}
		spots = append(spots, s)
	}
	return spots, nil
}

// DeleteExpiredImages KVKK: delete_after tarihi geçmiş analiz görüntülerini temizler.
func (r *ParkingRepo) DeleteExpiredImages(ctx context.Context) (int, error) {
	tag, err := r.db.Exec(ctx, `
		UPDATE parking_analyses
		SET image_url = ''
		WHERE delete_after < $1 AND image_url != ''
	`, time.Now())
	if err != nil {
		return 0, domainErr.New(domainErr.ErrInternal, "delete expired images failed", err)
	}
	return int(tag.RowsAffected()), nil
}
