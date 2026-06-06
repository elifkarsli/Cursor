package model

import "time"

// ParkingAnalysis bir park noktasına ait tek bir AI analiz sonucunu tutar.
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
	DeleteAfter        time.Time // KVKK: 24 saat sonra otomatik silinir
	Source             AnalysisSource
	KVKKBlurApplied    bool
	CreatedAt          time.Time
}

type AnalysisSource string

const (
	SourceUserPhoto  AnalysisSource = "user_photo"
	SourceStreetView AnalysisSource = "streetview"
)

// TotalSpaces toplam park sayısını döndürür.
func (a *ParkingAnalysis) TotalSpaces() int {
	return a.EmptySpaces + a.OccupiedSpaces
}
