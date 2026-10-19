/**
 * Intelligent Client-side Background Removal & Segmentation Pipeline
 * Isolates garments on varied backgrounds and supports manual mask refinement.
 */

export interface SegmentationResult {
  segmentedDataUrl: string;
  originalWidth: number;
  originalHeight: number;
  maskCanvas: HTMLCanvasElement;
}

export interface CropBoundary {
  top: number; // percentage 0-100
  bottom: number;
  left: number;
  right: number;
}

/**
 * Calculates perceptual color distance between two RGB colors
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Perceptual distance formula (approximates CIE76)
  return Math.sqrt(
    (((512 + rmean) * dr * dr) >> 8) +
    4 * dg * dg +
    (((767 - rmean) * db * db) >> 8)
  );
}

/**
 * Loads an image from a Data URL or URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for segmentation: ' + err));
    img.src = src;
  });
}

/**
 * Analyzes perimeter pixels to find primary background color clusters
 */
function sampleBackgroundColors(data: Uint8ClampedArray, width: number, height: number): Array<{ r: number; g: number; b: number }> {
  const samples: Array<{ r: number; g: number; b: number }> = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 40));

  // Sample top and bottom rows
  for (let x = 0; x < width; x += step) {
    // Top border (rows 0 to 4)
    for (let y = 0; y < Math.min(5, height); y++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 20) {
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
    // Bottom border
    for (let y = Math.max(0, height - 5); y < height; y++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 20) {
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
  }

  // Sample left and right columns
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < Math.min(5, width); x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 20) {
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
    for (let x = Math.max(0, width - 5); x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 20) {
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
  }

  if (samples.length === 0) {
    // Default to white/neutral background
    return [{ r: 255, g: 255, b: 255 }, { r: 240, g: 240, b: 240 }, { r: 200, g: 200, b: 200 }];
  }

  return samples;
}

/**
 * Runs automated background removal on an image
 * @param imageSource Data URL or Image Element
 * @param sensitivity 50 - 100 (higher = removes more background / tighter cut)
 */
export async function removeBackground(
  imageSource: string | HTMLImageElement,
  sensitivity: number = 80
): Promise<SegmentationResult> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  // Scale down for processing if too large to ensure snappy real-time responsiveness
  const maxDim = 800;
  let procWidth = img.naturalWidth || img.width || 400;
  let procHeight = img.naturalHeight || img.height || 400;

  if (procWidth > maxDim || procHeight > maxDim) {
    const scale = maxDim / Math.max(procWidth, procHeight);
    procWidth = Math.round(procWidth * scale);
    procHeight = Math.round(procHeight * scale);
  }

  const workCanvas = document.createElement('canvas');
  workCanvas.width = procWidth;
  workCanvas.height = procHeight;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not initialize canvas 2D context');

  ctx.drawImage(img, 0, 0, procWidth, procHeight);
  const imgData = ctx.getImageData(0, 0, procWidth, procHeight);
  const pixels = imgData.data;

  // Sample background colors along perimeter
  const bgColors = sampleBackgroundColors(pixels, procWidth, procHeight);

  // Compute background distance threshold based on sensitivity
  // sensitivity is 50-100; map to threshold distance 25 - 90
  const threshold = 25 + ((sensitivity - 50) / 50) * 65;

  // Create mask canvas:
  // Foreground (garment): R=255, G=255, B=255, A=255
  // Background (removed): R=0, G=0, B=0, A=0 (transparent)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = procWidth;
  maskCanvas.height = procHeight;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
  const maskData = maskCtx.createImageData(procWidth, procHeight);
  const maskPixels = maskData.data;

  // Center coordinate for saliency weighting
  const centerX = procWidth / 2;
  const centerY = procHeight / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < procHeight; y++) {
    for (let x = 0; x < procWidth; x++) {
      const idx = (y * procWidth + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      // If already transparent in source, keep it transparent
      if (a < 15) {
        maskPixels[idx] = 0;
        maskPixels[idx + 1] = 0;
        maskPixels[idx + 2] = 0;
        maskPixels[idx + 3] = 0;
        continue;
      }

      // Check minimum distance to any background sample
      let minBgDist = 999999;
      // Test against a subset of samples for speed
      const sampleStep = Math.max(1, Math.floor(bgColors.length / 25));
      for (let i = 0; i < bgColors.length; i += sampleStep) {
        const bg = bgColors[i];
        const dist = colorDistance(r, g, b, bg.r, bg.g, bg.b);
        if (dist < minBgDist) minBgDist = dist;
      }

      // Proximity to center gives higher likelihood of garment
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxRadius;
      const adjustedThreshold = threshold * (1 - distFromCenter * 0.25);

      const isForeground = minBgDist > adjustedThreshold;

      if (isForeground) {
        maskPixels[idx] = 255;
        maskPixels[idx + 1] = 255;
        maskPixels[idx + 2] = 255;
        maskPixels[idx + 3] = 255;
      } else {
        maskPixels[idx] = 0;
        maskPixels[idx + 1] = 0;
        maskPixels[idx + 2] = 0;
        maskPixels[idx + 3] = 0; // Transparent background
      }
    }
  }

  maskCtx.putImageData(maskData, 0, 0);

  // Generate the composite segmented image (original * mask)
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = procWidth;
  outputCanvas.height = procHeight;
  const outCtx = outputCanvas.getContext('2d')!;

  // Draw original image
  outCtx.drawImage(workCanvas, 0, 0);
  // Composite mask as destination-in (multiplies by alpha of maskCanvas)
  outCtx.globalCompositeOperation = 'destination-in';
  outCtx.drawImage(maskCanvas, 0, 0);

  return {
    segmentedDataUrl: outputCanvas.toDataURL('image/png'),
    originalWidth: procWidth,
    originalHeight: procHeight,
    maskCanvas,
  };
}

/**
 * Applies manual brush stroke to a mask canvas
 */
export function applyBrushToMask(
  maskCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  mode: 'keep' | 'remove'
) {
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  if (mode === 'keep') {
    // Fill mask with white opaque foreground
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  } else {
    // Erase mask to transparent (destination-out zeros out alpha)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Finds the tight bounding box around foreground pixels (alpha > threshold)
 */
export function findGarmentBoundingBox(
  maskCanvas: HTMLCanvasElement,
  alphaThreshold: number = 25
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const w = maskCanvas.width;
  const h = maskCanvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Exports final transparent PNG applying mask and crop boundaries (tight-cropping to garment)
 */
export function exportRefinedImage(
  originalImage: HTMLImageElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  crop: CropBoundary = { top: 0, bottom: 0, left: 0, right: 0 }
): string {
  const w = maskCanvas.width;
  const h = maskCanvas.height;

  // 1. Render full composite masked image at maskCanvas resolution
  const fullCutout = document.createElement('canvas');
  fullCutout.width = w;
  fullCutout.height = h;
  const fullCtx = fullCutout.getContext('2d', { willReadFrequently: true })!;

  // Draw original image scaled to exact mask dimensions
  fullCtx.drawImage(originalImage, 0, 0, w, h);

  // Apply mask: keep only foreground, remove background
  fullCtx.globalCompositeOperation = 'destination-in';
  fullCtx.drawImage(maskCanvas, 0, 0);

  // 2. Compute crop coordinates
  const hasManualCrop = crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0;
  let cropX = 0;
  let cropY = 0;
  let cropW = w;
  let cropH = h;

  if (hasManualCrop) {
    cropX = Math.round((crop.left / 100) * w);
    cropY = Math.round((crop.top / 100) * h);
    cropW = Math.max(10, Math.round(w - cropX - (crop.right / 100) * w));
    cropH = Math.max(10, Math.round(h - cropY - (crop.bottom / 100) * h));
  } else {
    // Automatically tight-crop to the garment silhouette with comfortable padding
    const bbox = findGarmentBoundingBox(maskCanvas, 25);
    if (bbox) {
      const paddingX = Math.max(12, Math.round((bbox.maxX - bbox.minX) * 0.05));
      const paddingY = Math.max(12, Math.round((bbox.maxY - bbox.minY) * 0.05));
      cropX = Math.max(0, bbox.minX - paddingX);
      cropY = Math.max(0, bbox.minY - paddingY);
      const rightX = Math.min(w, bbox.maxX + paddingX);
      const bottomY = Math.min(h, bbox.maxY + paddingY);
      cropW = Math.max(10, rightX - cropX);
      cropH = Math.max(10, bottomY - cropY);
    }
  }

  // Ensure minimum valid bounds
  cropW = Math.max(10, Math.min(w - cropX, cropW));
  cropH = Math.max(10, Math.min(h - cropY, cropH));

  // 3. Draw cropped transparent PNG onto output canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d')!;

  outCtx.drawImage(fullCutout, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return outCanvas.toDataURL('image/png');
}
