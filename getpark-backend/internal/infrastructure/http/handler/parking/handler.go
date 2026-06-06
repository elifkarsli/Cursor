package parking

import (
	"io"
	"net/http"
	"strconv"

	"github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
	"github.com/masterfabric-go/masterfabric/internal/application/parking/usecase"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
	"github.com/masterfabric-go/masterfabric/internal/shared/response"
)

// Handler parking endpoint'leri için HTTP handler'ı.
// masterfabric-go convention: struct + NewHandler constructor.
type Handler struct {
	analyzePhoto      *usecase.AnalyzePhotoUseCase
	analyzeStreetView *usecase.AnalyzeStreetViewUseCase
	getMapSpots       *usecase.GetMapSpotsUseCase
}

func NewHandler(
	analyzePhoto *usecase.AnalyzePhotoUseCase,
	analyzeStreetView *usecase.AnalyzeStreetViewUseCase,
	getMapSpots *usecase.GetMapSpotsUseCase,
) *Handler {
	return &Handler{
		analyzePhoto:      analyzePhoto,
		analyzeStreetView: analyzeStreetView,
		getMapSpots:       getMapSpots,
	}
}

// AnalyzePhoto POST /api/v1/parking/analyze
//
// Content-Type: multipart/form-data
// Fields:
//
//	image    — görüntü dosyası (JPEG/PNG, max 10MB)
//	spot_id  — (opsiyonel) mevcut park noktası ID
//	lat      — enlem (float)
//	lng      — boylam (float)
func (h *Handler) AnalyzePhoto(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "invalid multipart form: max 10MB", err))
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "image field required", err))
		return
	}
	defer file.Close()

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrInternal, "failed to read image", err))
		return
	}

	lat, _ := strconv.ParseFloat(r.FormValue("lat"), 64)
	lng, _ := strconv.ParseFloat(r.FormValue("lng"), 64)

	input := dto.AnalyzePhotoInput{
		SpotID:     r.FormValue("spot_id"),
		Latitude:   lat,
		Longitude:  lng,
		ImageBytes: imageBytes,
	}

	result, err := h.analyzePhoto.Execute(r.Context(), input)
	if err != nil {
		response.Error(w, err)
		return
	}

	response.JSON(w, http.StatusOK, result)
}

// AnalyzeStreetView GET /api/v1/parking/streetview?lat=41.07&lng=28.97
func (h *Handler) AnalyzeStreetView(w http.ResponseWriter, r *http.Request) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "lat query param required (float)", err))
		return
	}
	lng, err := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "lng query param required (float)", err))
		return
	}

	input := dto.AnalyzeStreetViewInput{
		Latitude:  lat,
		Longitude: lng,
	}

	result, err := h.analyzeStreetView.Execute(r.Context(), input)
	if err != nil {
		response.Error(w, err)
		return
	}

	response.JSON(w, http.StatusOK, result)
}

// GetMapSpots GET /api/v1/parking/map?lat=41.07&lng=28.97&radius=500
func (h *Handler) GetMapSpots(w http.ResponseWriter, r *http.Request) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "lat query param required", err))
		return
	}
	lng, err := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if err != nil {
		response.Error(w, domainErr.New(domainErr.ErrBadRequest, "lng query param required", err))
		return
	}
	radius := 500
	if rs := r.URL.Query().Get("radius"); rs != "" {
		if rv, err := strconv.Atoi(rs); err == nil {
			radius = rv
		}
	}

	spots, err := h.getMapSpots.Execute(r.Context(), lat, lng, radius)
	if err != nil {
		response.Error(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"spots": spots,
		"count": len(spots),
	})
}
