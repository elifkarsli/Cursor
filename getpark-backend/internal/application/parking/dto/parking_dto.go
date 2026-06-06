package dto

// AnalyzePhotoInput fotoğraf analizi için girdi DTO'su.
type AnalyzePhotoInput struct {
	SpotID     string // Boşsa backend otomatik UUID üretir
	Latitude   float64
	Longitude  float64
	ImageBytes []byte
	OrgID      string
}

// AnalyzePhotoOutput fotoğraf analizi sonuç DTO'su.
type AnalyzePhotoOutput struct {
	SpotID             string  `json:"spot_id"`
	UrbanParkingIndex  int     `json:"urban_parking_index"`
	EmptySpaces        int     `json:"empty_spaces"`
	OccupiedSpaces     int     `json:"occupied_spaces"`
	HasDisabledParking bool    `json:"has_disabled_parking"`
	DisabledBlocked    bool    `json:"disabled_blocked"`
	SidewalkBlocked    bool    `json:"sidewalk_blocked"`
	AccessibilityScore int     `json:"accessibility_score"`
	Confidence         float64 `json:"confidence"`
	RiskLevel          string  `json:"risk_level"` // "low" | "medium" | "high"
	KVKKBlurApplied    bool    `json:"kvkk_blur_applied"`
}

// AnalyzeStreetViewInput Street View analizi için girdi DTO'su.
type AnalyzeStreetViewInput struct {
	Latitude  float64
	Longitude float64
	OrgID     string
}

// AnalyzeStreetViewOutput Street View analizi sonuç DTO'su.
type AnalyzeStreetViewOutput struct {
	SpotID            string  `json:"spot_id"`
	UrbanParkingIndex int     `json:"urban_parking_index"`
	StreetViewURL     string  `json:"streetview_url"`
	EmptySpaces       int     `json:"empty_spaces"`
	OccupiedSpaces    int     `json:"occupied_spaces"`
	Confidence        float64 `json:"confidence"`
	RiskLevel         string  `json:"risk_level"`
	CachedResult      bool    `json:"cached_result"`
	KVKKBlurApplied   bool    `json:"kvkk_blur_applied"`
}

// MapSpotOutput harita ekranı için park noktası DTO'su.
type MapSpotOutput struct {
	ID        string  `json:"id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Index     int     `json:"urban_index"`
	RiskLevel string  `json:"risk_level"`
}

// GeminiAnalysisResult Gemini Vision API'den dönen JSON sonuç.
type GeminiAnalysisResult struct {
	EmptySpaces        int     `json:"empty_spaces"`
	OccupiedSpaces     int     `json:"occupied_spaces"`
	HasDisabledParking bool    `json:"has_disabled_parking"`
	DisabledBlocked    bool    `json:"disabled_blocked"`
	SidewalkBlocked    bool    `json:"sidewalk_blocked"`
	Confidence         float64 `json:"confidence"`
}
