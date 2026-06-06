package service

import "github.com/masterfabric-go/masterfabric/internal/domain/parking/model"

// CalculateUrbanParkingIndex Gemini sonuçlarından 0-100 arası bir skor üretir.
//
// Formül:
//
//	Doluluk Skoru  (%40): empty / (empty + occupied) × 100
//	Erişim Skoru   (%35): disabled_ok × 50 + sidewalk_ok × 50
//	Güven Skoru    (%25): confidence × 100
//
// Urban Parking Index = (D × 0.40) + (E × 0.35) + (G × 0.25)
func CalculateUrbanParkingIndex(a *model.ParkingAnalysis) int {
	total := a.TotalSpaces()

	var occupancyScore float64
	if total > 0 {
		occupancyScore = float64(a.EmptySpaces) / float64(total) * 100
	}

	accessScore := 0.0
	if !a.DisabledBlocked {
		accessScore += 50
	}
	if !a.SidewalkBlocked {
		accessScore += 50
	}

	confidenceScore := a.Confidence * 100

	index := (occupancyScore * 0.40) + (accessScore * 0.35) + (confidenceScore * 0.25)

	result := int(index)
	if result > 100 {
		return 100
	}
	if result < 0 {
		return 0
	}
	return result
}

// ClassifyRisk skoru "low" / "medium" / "high" olarak sınıflandırır.
func ClassifyRisk(index int) string {
	switch {
	case index >= 70:
		return "low"
	case index >= 45:
		return "medium"
	default:
		return "high"
	}
}
