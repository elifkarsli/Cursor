package model

import "time"

// ParkingSpot bir park noktasını ve o noktanın en güncel Urban Parking Index skorunu tutar.
type ParkingSpot struct {
	ID             string
	Latitude       float64
	Longitude      float64
	UrbanIndex     int // 0-100
	OrganizationID string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// RiskLevel skora göre risk seviyesi döndürür.
func (s *ParkingSpot) RiskLevel() string {
	switch {
	case s.UrbanIndex >= 70:
		return "low"
	case s.UrbanIndex >= 45:
		return "medium"
	default:
		return "high"
	}
}
