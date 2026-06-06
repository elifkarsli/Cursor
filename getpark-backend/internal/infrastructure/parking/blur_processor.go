package parking

import (
	"bytes"
	"image"
	"image/jpeg"
	_ "image/png" // PNG decode desteği

	"golang.org/x/image/draw"

	domainErr "github.com/masterfabric-go/masterfabric/internal/shared/errors"
)

// BlurProcessor KVKK uyumlu görüntü bulanıklaştırıcısı.
// Yüz ve plaka bilgilerini okunamaz hale getirir.
type BlurProcessor struct{}

func NewBlurProcessor() *BlurProcessor {
	return &BlurProcessor{}
}

// ApplyKVKKBlur görüntüye iki aşamalı blur uygular:
//  1. Tüm görüntü: hafif blur (1/8 küçültüp büyüt)
//  2. Alt %30 (plaka bölgesi): güçlü blur (1/16 küçültüp büyüt)
//
// KVKK: yüz tanıma ve plaka okuma bu işlemden sonra mümkün değildir.
func (b *BlurProcessor) ApplyKVKKBlur(imageBytes []byte) ([]byte, error) {
	img, _, err := image.Decode(bytes.NewReader(imageBytes))
	if err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "image decode failed", err)
	}

	bounds := img.Bounds()
	w, h := bounds.Max.X, bounds.Max.Y

	// --- Aşama 1: Tüm görüntüye hafif blur ---
	dst := applyDownscaleBlur(img, bounds, 8)

	// --- Aşama 2: Alt %30'a (plaka bölgesi) güçlü blur ---
	plateRegion := image.Rect(0, int(float64(h)*0.70), w, h)
	plateSrc := dst.(*image.RGBA).SubImage(plateRegion)
	plateBlurred := applyDownscaleBlur(plateSrc, plateRegion, 16)

	// Plate blur'ü ana görüntü üzerine çiz
	draw.BiLinear.Scale(dst.(*image.RGBA), plateRegion, plateBlurred, plateBlurred.Bounds(), draw.Over, nil)

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, dst, &jpeg.Options{Quality: 82}); err != nil {
		return nil, domainErr.New(domainErr.ErrInternal, "jpeg encode failed", err)
	}
	return buf.Bytes(), nil
}

// applyDownscaleBlur görüntüyü factor kadar küçültüp orijinal boyutuna büyütür (blur efekti).
func applyDownscaleBlur(src image.Image, bounds image.Rectangle, factor int) image.Image {
	smallW := (bounds.Max.X - bounds.Min.X) / factor
	smallH := (bounds.Max.Y - bounds.Min.Y) / factor
	if smallW < 1 {
		smallW = 1
	}
	if smallH < 1 {
		smallH = 1
	}

	small := image.NewRGBA(image.Rect(0, 0, smallW, smallH))
	draw.BiLinear.Scale(small, small.Bounds(), src, bounds, draw.Over, nil)

	dst := image.NewRGBA(bounds)
	draw.BiLinear.Scale(dst, bounds, small, small.Bounds(), draw.Over, nil)
	return dst
}
