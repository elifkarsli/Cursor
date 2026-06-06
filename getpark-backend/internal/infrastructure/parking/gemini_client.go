package parking

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/masterfabric-go/masterfabric/internal/application/parking/dto"
	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

const (
	geminiBaseURL      = "https://generativelanguage.googleapis.com/v1beta/models"
	geminiDefaultModel = "gemini-2.5-flash"
)

// geminiPrompt Gemini'ye gönderilen prompt. Plaka/yüz okuma isteği yoktur (KVKK).
const geminiPrompt = `Analyze this parking area image. Return ONLY valid JSON with no explanation or markdown:
{
  "empty_spaces": <integer>,
  "occupied_spaces": <integer>,
  "has_disabled_parking": <true|false>,
  "disabled_blocked": <true|false>,
  "sidewalk_blocked": <true|false>,
  "confidence": <float 0.0-1.0>
}`

// GeminiClient Gemini Vision API ile iletişim kurar.
type GeminiClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiClient(apiKey, model string) *GeminiClient {
	if model == "" {
		model = geminiDefaultModel
	}
	return &GeminiClient{
		apiKey:     apiKey,
		model:      model,
		httpClient: &http.Client{},
	}
}

// AnalyzeImage görüntüyü Gemini Vision'a gönderir ve park analiz sonucunu döndürür.
func (g *GeminiClient) AnalyzeImage(ctx context.Context, imageBytes []byte) (*dto.GeminiAnalysisResult, error) {
	encoded := base64.StdEncoding.EncodeToString(imageBytes)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": geminiPrompt},
					{
						"inline_data": map[string]string{
							"mime_type": "image/jpeg",
							"data":      encoded,
						},
					},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.1,
			"maxOutputTokens": 256,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini payload marshal failed", err)
	}

	url := fmt.Sprintf("%s/%s:generateContent?key=%s", geminiBaseURL, g.model, g.apiKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini request create failed", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini request failed", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		return nil, domainErr.New(domainErr.ErrInternal, fmt.Sprintf("gemini error %d: %s", resp.StatusCode, string(raw)), nil)
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini response decode failed", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, domainErr.New(domainErr.ErrInternal, "gemini returned empty response", nil)
	}

	rawText := geminiResp.Candidates[0].Content.Parts[0].Text

	// Gemini bazen ```json ... ``` içinde döndürür, temizle
	rawText = strings.TrimSpace(rawText)
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	result := &dto.GeminiAnalysisResult{}
	if err := json.Unmarshal([]byte(rawText), result); err != nil {
		// Parse başarısız olursa varsayılan değerler döndür
		return &dto.GeminiAnalysisResult{
			EmptySpaces:    0,
			OccupiedSpaces: 5,
			Confidence:     0.5,
		}, nil
	}

	return result, nil
}
