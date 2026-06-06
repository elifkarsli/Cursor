package parking

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

const (
	streetViewMetadataURL = "https://maps.googleapis.com/maps/api/streetview/metadata"
	streetViewStaticURL   = "https://maps.googleapis.com/maps/api/streetview"
	streetViewStaticSize  = "640x640"
)

// StreetViewClient Google Street View Static API ile iletişim kurar.
type StreetViewClient struct {
	apiKey     string
	httpClient *http.Client
}

func NewStreetViewClient(apiKey string) *StreetViewClient {
	return &StreetViewClient{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

// CheckAvailability koordinatta Street View görüntüsü olup olmadığını kontrol eder.
func (s *StreetViewClient) CheckAvailability(ctx context.Context, lat, lng float64) (bool, error) {
	url := fmt.Sprintf("%s?location=%f,%f&key=%s",
		streetViewMetadataURL, lat, lng, s.apiKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return false, domainErr.New(domainErr.ErrInternal, "streetview metadata request failed", err)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return false, domainErr.New(domainErr.ErrInternal, "streetview metadata fetch failed", err)
	}
	defer resp.Body.Close()

	var meta struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&meta); err != nil {
		return false, nil
	}

	return meta.Status == "OK", nil
}

// FetchImage koordinattaki Street View görüntüsünü indirir.
// Dönen değerler: görüntü byte'ları, görüntü URL'si, hata.
func (s *StreetViewClient) FetchImage(ctx context.Context, lat, lng float64) ([]byte, string, error) {
	imageURL := fmt.Sprintf("%s?size=%s&location=%f,%f&key=%s",
		streetViewStaticURL, streetViewStaticSize, lat, lng, s.apiKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, imageURL, nil)
	if err != nil {
		return nil, "", domainErr.New(domainErr.ErrInternal, "streetview image request failed", err)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, "", domainErr.New(domainErr.ErrInternal, "streetview image fetch failed", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", domainErr.New(domainErr.ErrNotFound, fmt.Sprintf("streetview image not found: %d", resp.StatusCode), nil)
	}

	imageBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", domainErr.New(domainErr.ErrInternal, "streetview image read failed", err)
	}

	// URL'den API key'i kaldır (güvenlik)
	publicURL := fmt.Sprintf("%s?size=%s&location=%f,%f",
		streetViewStaticURL, streetViewStaticSize, lat, lng)

	return imageBytes, publicURL, nil
}
