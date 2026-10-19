import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  FolderOpen, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Crop, 
  RotateCcw,
  CheckCircle2,
  Wand2,
  Paintbrush,
  Eraser,
  Sliders,
  Layers,
  Eye,
  Check
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { ALL_CATEGORIES, Category } from '../../types/wardrobe';
import { createGarmentSvg } from '../../data/mockWardrobe';
import { 
  removeBackground, 
  applyBrushToMask, 
  exportRefinedImage,
  findGarmentBoundingBox,
  loadImage,
  CropBoundary 
} from '../../utils/backgroundRemoval';

export const UploadItemModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addItem } = useWardrobe();

  // Acquisition mode: file explorer, gallery, camera
  const [method, setMethod] = useState<'explorer' | 'gallery' | 'camera'>('explorer');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Garment metadata
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Tops');
  const [color, setColor] = useState('Charcoal');
  const [brand, setBrand] = useState('Studio Atelier');
  const [season, setSeason] = useState<'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season'>('All-Season');
  const [material, setMaterial] = useState('Cotton Blend');
  const [notes, setNotes] = useState('');

  // AI Segmentation pipeline states
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [originalImgElement, setOriginalImgElement] = useState<HTMLImageElement | null>(null);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationDone, setSegmentationDone] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Mask & Canvas Refinement
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushMode, setBrushMode] = useState<'keep' | 'remove'>('remove');
  const [brushSize, setBrushSize] = useState(18); // px
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Interactive Crop & Sensitivity adjustments
  const [cropTop, setCropTop] = useState(0); // 0 to 30 %
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [aiSensitivity, setAiSensitivity] = useState(80);
  const [previewMode, setPreviewMode] = useState<'segmented' | 'mask-tint' | 'crop-box' | 'original'>('segmented');

  const [error, setError] = useState('');

  // Renders the interactive display canvas whenever mask, crop, or preview mode changes
  const renderDisplayCanvas = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const originalImg = originalImgElement;

    if (!displayCanvas || !maskCanvas || !originalImg) return;

    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    const width = maskCanvas.width;
    const height = maskCanvas.height;
    displayCanvas.width = width;
    displayCanvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (previewMode === 'original') {
      // Draw pristine source photo
      ctx.drawImage(originalImg, 0, 0, width, height);
    } else if (previewMode === 'mask-tint') {
      // Photoshop Quick Mask style: Image with green kept tint & red removed tint
      ctx.drawImage(originalImg, 0, 0, width, height);

      // Create overlay
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        const maskData = maskCtx.getImageData(0, 0, width, height).data;
        const overlayData = ctx.createImageData(width, height);
        const out = overlayData.data;

        for (let i = 0; i < maskData.length; i += 4) {
          const isKept = maskData[i + 3] > 128;
          if (isKept) {
            // Slight emerald tint over kept garment
            out[i] = 16;
            out[i + 1] = 185;
            out[i + 2] = 129;
            out[i + 3] = 40; // Semi-transparent
          } else {
            // Ruby tint over removed background
            out[i] = 239;
            out[i + 1] = 68;
            out[i + 2] = 68;
            out[i + 3] = 140; // Clearly marks deleted background
          }
        }

        // Create temporary canvas to blend tint
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCanvas.getContext('2d')?.putImageData(overlayData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    } else {
      // 'segmented' or 'crop-box' mode: Render checkerboard background first
      const tileSize = 16;
      for (let cy = 0; cy < height; cy += tileSize) {
        for (let cx = 0; cx < width; cx += tileSize) {
          const isDark = (Math.floor(cx / tileSize) + Math.floor(cy / tileSize)) % 2 === 0;
          ctx.fillStyle = isDark ? '#1e293b' : '#0f172a';
          ctx.fillRect(cx, cy, tileSize, tileSize);
        }
      }

      // Draw transparent cutout onto intermediate canvas to isolate mask compositing
      const compCanvas = document.createElement('canvas');
      compCanvas.width = width;
      compCanvas.height = height;
      const compCtx = compCanvas.getContext('2d')!;
      compCtx.drawImage(originalImg, 0, 0, width, height);
      compCtx.globalCompositeOperation = 'destination-in';
      compCtx.drawImage(maskCanvas, 0, 0);

      // Render cutout over checkerboard
      ctx.drawImage(compCanvas, 0, 0);
    }

    // Draw active crop guidelines if in crop-box mode or user adjusted crops
    if (previewMode === 'crop-box' || cropTop > 0 || cropBottom > 0 || cropLeft > 0 || cropRight > 0) {
      const cropX = (cropLeft / 100) * width;
      const cropY = (cropTop / 100) * height;
      const cropW = width - cropX - (cropRight / 100) * width;
      const cropH = height - cropY - (cropBottom / 100) * height;

      // Darken outside cropped area
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      // Top rect
      ctx.fillRect(0, 0, width, cropY);
      // Bottom rect
      ctx.fillRect(0, cropY + cropH, width, height - (cropY + cropH));
      // Left rect
      ctx.fillRect(0, cropY, cropX, cropH);
      // Right rect
      ctx.fillRect(cropX + cropW, cropY, width - (cropX + cropW), cropH);

      // Crop box border
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(cropX, cropY, cropW, cropH);
      ctx.restore();
    }
  }, [originalImgElement, previewMode, cropTop, cropBottom, cropLeft, cropRight]);

  useEffect(() => {
    if (segmentationDone) {
      renderDisplayCanvas();
    }
  }, [segmentationDone, renderDisplayCanvas]);

  if (!isUploadModalOpen) return null;

  // Run automated AI background removal
  const runRealSegmentation = async (imgSource: string, sensitivity: number) => {
    setIsSegmenting(true);
    setSegmentationDone(false);
    setError('');

    try {
      const loadedImg = await loadImage(imgSource);
      setOriginalImgElement(loadedImg);

      // Process automatic background isolation
      const result = await removeBackground(loadedImg, sensitivity);

      // Save mask canvas into ref for interactive canvas brush editing
      maskCanvasRef.current = result.maskCanvas;
      setProcessedImageUrl(result.segmentedDataUrl);
      setIsSegmenting(false);
      setSegmentationDone(true);
    } catch (err: any) {
      console.error('Background removal error:', err);
      setIsSegmenting(false);
      setError('AI background segmentation failed. You can still save the original garment.');
    }
  };

  // Handle native file explorer upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        setSourceImage(rawUrl);
        runRealSegmentation(rawUrl, aiSensitivity);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select preset archetype from Gallery
  const handleSelectGalleryPreset = (presetName: string, presetColor: string, presetCategory: Category, presetMat: string) => {
    setName(presetName);
    setColor(presetColor);
    setCategory(presetCategory);
    setMaterial(presetMat);

    const typeKey = presetCategory === 'Tops' ? 'top-sweater'
      : presetCategory === 'Bottoms' ? 'bottom-trousers'
      : presetCategory === 'Full-Body' ? 'fullbody-dress'
      : presetCategory === 'Outerwear' ? 'outerwear-coat'
      : presetCategory === 'Shoes' ? 'shoes-loafers'
      : 'accessories-bag';

    const sampleSvg = createGarmentSvg(typeKey, '#4f46e5', '#312e81', `${presetColor} ${presetName}`);
    setSourceImage(sampleSvg);
    runRealSegmentation(sampleSvg, aiSensitivity);
  };

  // Camera snapshot
  const handleCameraCapture = () => {
    const typeKey = category === 'Tops' ? 'top-shirt'
      : category === 'Bottoms' ? 'bottom-jeans'
      : category === 'Full-Body' ? 'fullbody-dress'
      : category === 'Outerwear' ? 'outerwear-coat'
      : category === 'Shoes' ? 'shoes-loafers'
      : 'accessories-bag';

    const snapSvg = createGarmentSvg(typeKey, '#6366f1', '#4338ca', `Snapshot ${category}`);
    if (!name) setName(`${color} ${category}`);
    setSourceImage(snapSvg);
    runRealSegmentation(snapSvg, aiSensitivity);
  };

  // Interactive Canvas Drawing / Mask Refinement Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number; screenX: number; screenY: number } => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0, screenX: 0, screenY: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      screenX: clientX - rect.left,
      screenY: clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    applyBrushToMask(maskCanvasRef.current, x, y, brushSize, brushMode);
    renderDisplayCanvas();
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y, screenX, screenY } = getCanvasCoords(e);
    setCursorPos({ x: screenX, y: screenY });

    if (!isDrawing || !maskCanvasRef.current) return;
    applyBrushToMask(maskCanvasRef.current, x, y, brushSize, brushMode);
    renderDisplayCanvas();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
    setCursorPos(null);
  };

  const handleResetCrop = () => {
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
  };

  const handleAutoFitCrop = () => {
    if (!maskCanvasRef.current) return;
    const bbox = findGarmentBoundingBox(maskCanvasRef.current, 25);
    if (!bbox) return;
    const w = maskCanvasRef.current.width;
    const h = maskCanvasRef.current.height;
    const paddingX = Math.max(12, Math.round((bbox.maxX - bbox.minX) * 0.05));
    const paddingY = Math.max(12, Math.round((bbox.maxY - bbox.minY) * 0.05));
    const cropX = Math.max(0, bbox.minX - paddingX);
    const cropY = Math.max(0, bbox.minY - paddingY);
    const rightX = Math.min(w, bbox.maxX + paddingX);
    const bottomY = Math.min(h, bbox.maxY + paddingY);

    setCropLeft(Math.max(0, Math.min(30, Math.round((cropX / w) * 100))));
    setCropTop(Math.max(0, Math.min(30, Math.round((cropY / h) * 100))));
    setCropRight(Math.max(0, Math.min(30, Math.round(((w - rightX) / w) * 100))));
    setCropBottom(Math.max(0, Math.min(30, Math.round(((h - bottomY) / h) * 100))));
    setPreviewMode('crop-box');
  };

  const handleRerunAi = () => {
    if (sourceImage) {
      runRealSegmentation(sourceImage, aiSensitivity);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this garment.');
      return;
    }

    let finalImage = '';

    // If mask canvas exists, export high-fidelity transparent PNG with all manual brush edits & crops applied
    if (maskCanvasRef.current && originalImgElement) {
      const crop: CropBoundary = {
        top: cropTop,
        bottom: cropBottom,
        left: cropLeft,
        right: cropRight
      };
      finalImage = exportRefinedImage(originalImgElement, maskCanvasRef.current, crop);
    } else if (processedImageUrl) {
      finalImage = processedImageUrl;
    } else if (sourceImage) {
      finalImage = sourceImage;
    } else {
      const typeKey = category === 'Tops' ? 'top-shirt'
        : category === 'Bottoms' ? 'bottom-trousers'
        : category === 'Full-Body' ? 'fullbody-dress'
        : category === 'Outerwear' ? 'outerwear-coat'
        : category === 'Shoes' ? 'shoes-loafers'
        : 'accessories-bag';
      finalImage = createGarmentSvg(typeKey, '#4f46e5', '#312e81', `${color} ${name}`);
    }

    addItem({
      name: name.trim(),
      category,
      color: color.trim() || 'Custom Hue',
      brand: brand.trim() || 'Studio Archive',
      season,
      material: material.trim(),
      notes: notes.trim(),
      image: finalImage,
      tags: [category.toLowerCase(), season.toLowerCase()],
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setColor('Charcoal');
    setCategory('Tops');
    setBrand('Studio Atelier');
    setMaterial('Cotton Blend');
    setNotes('');
    setSourceImage(null);
    setOriginalImgElement(null);
    maskCanvasRef.current = null;
    setIsSegmenting(false);
    setSegmentationDone(false);
    setProcessedImageUrl(null);
    handleResetCrop();
    setError('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[94vh] overflow-y-auto space-y-5"
      >
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <span>Automatic Background Removal & Mask Editor</span>
            </div>
            <h3 id="upload-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Digitize & Segment Wardrobe Piece
            </h3>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 font-mono">
              AI Segmentation Guide
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              Place item on a plain background for AI segmentation. The engine deletes the background automatically, then lets you manually refine the mask.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Taxonomy Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Acquisition Method: File Explorer vs Gallery vs Camera */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Select Acquisition Source
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('explorer')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-semibold ${
                  method === 'explorer'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FolderOpen size={16} className={method === 'explorer' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>File Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('gallery')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-semibold ${
                  method === 'gallery'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <ImageIcon size={16} className={method === 'gallery' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Gallery Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('camera')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-semibold ${
                  method === 'camera'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Camera size={16} className={method === 'camera' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Camera</span>
              </button>
            </div>
          </div>

          {/* Method 1: File Explorer Native Upload */}
          {method === 'explorer' && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-explorer-input"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-white/20 hover:border-indigo-400/60 rounded-2xl p-6 text-center space-y-2 hover:bg-white/[0.02] transition-colors"
              >
                <FolderOpen className="w-8 h-8 text-indigo-400 mx-auto" />
                <div className="text-xs font-semibold text-white">
                  Click to Browse Local File Explorer
                </div>
                <p className="text-[11px] text-slate-400">
                  Select JPG, PNG, or WEBP photo. AI will delete out the background automatically.
                </p>
              </div>
            </div>
          )}

          {/* Method 2: Gallery Archetype Presets */}
          {method === 'gallery' && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="text-xs font-medium text-slate-300">
                Pick a garment from your curated gallery presets:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Oversized Cashmere Knit', color: 'Cream Sand', cat: 'Tops', mat: '100% Cashmere' },
                  { name: 'Tailored Wide-Leg Flannel', color: 'Charcoal Grey', cat: 'Bottoms', mat: 'Virgin Wool' },
                  { name: 'Fluid Satin Slip Gown', color: 'Champagne Taupe', cat: 'Full-Body', mat: 'Mulberry Silk' },
                  { name: 'Double-Breasted Overcoat', color: 'Camel Brown', cat: 'Outerwear', mat: 'Heavy Melange' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectGalleryPreset(preset.name, preset.color, preset.cat as any, preset.mat)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
                  >
                    <div className="font-semibold text-white text-xs">{preset.name}</div>
                    <div className="text-[10px] text-slate-400">{preset.cat} · {preset.color}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Method 3: Camera */}
          {method === 'camera' && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />
                <Camera className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-2" />
                <p className="text-xs text-slate-300 font-mono">Frame garment against plain background</p>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  Capture & Run AI Segmentation
                </button>
              </div>
            </div>
          )}

          {/* AI Segmentation Scanning Progress */}
          {isSegmenting && (
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-center space-y-2.5 animate-pulse">
              <Wand2 className="w-7 h-7 text-indigo-400 mx-auto animate-spin" />
              <div className="text-xs font-semibold text-indigo-200">
                Automated Background Removal Pipeline Active...
              </div>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Sampling background color clusters, calculating edge contrast, and isolating clothing silhouette.
              </p>
            </div>
          )}

          {/* CRITICAL STEP: Interactive Canvas Overlay & Mask Refinement */}
          {segmentationDone && sourceImage && (
            <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/15 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Background Removed & Isolated
                  </span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('segmented')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      previewMode === 'segmented' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cutout (PNG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mask-tint')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      previewMode === 'mask-tint' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mask Tint
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('crop-box')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      previewMode === 'crop-box' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Crop Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('original')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      previewMode === 'original' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Interactive Canvas Overlay Container with Checkerboard */}
              <div 
                className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center p-2 shadow-inner select-none cursor-crosshair"
                style={{
                  backgroundColor: '#0c0e18',
                  backgroundImage: `
                    linear-gradient(45deg, #181b29 25%, transparent 25%), 
                    linear-gradient(-45deg, #181b29 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #181b29 75%), 
                    linear-gradient(-45deg, transparent 75%, #181b29 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
              >
                <canvas
                  ref={displayCanvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerLeave}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                  style={{ touchAction: 'none' }}
                />

                {/* Floating Brush Cursor Indicator */}
                {cursorPos && (
                  <div
                    className="pointer-events-none absolute rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: cursorPos.x,
                      top: cursorPos.y,
                      width: brushSize * 2,
                      height: brushSize * 2,
                      borderColor: brushMode === 'keep' ? '#34d399' : '#f87171',
                      backgroundColor: brushMode === 'keep' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'
                    }}
                  />
                )}
              </div>

              {/* Canvas Overlay Refinement Controls Toolbar */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBrushMode('remove')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        brushMode === 'remove'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                      }`}
                      title="Paint over leftover background or hangers to erase them"
                    >
                      <Eraser size={14} />
                      <span>Erase Background</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBrushMode('keep')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        brushMode === 'keep'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                      }`}
                      title="Paint over clothing areas that were accidentally removed to restore them"
                    >
                      <Paintbrush size={14} />
                      <span>Restore Garment</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400 font-mono">Brush: {brushSize}px</span>
                    <input
                      type="range"
                      min="6"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-24 accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>💡 Tip: Click and drag on the garment canvas above to manually paint the segmentation mask.</span>
                  <button
                    type="button"
                    onClick={handleRerunAi}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <RotateCcw size={11} />
                    <span>Reset AI Mask</span>
                  </button>
                </div>
              </div>

              {/* Interactive Cropping Boundaries & AI Sensitivity Sliders */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Crop size={14} className="text-indigo-400" />
                    <span>Crop Boundaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFitCrop}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-[11px] text-indigo-300 transition-colors font-medium shadow-sm"
                      title="Automatically tight-fit crop box around isolated garment silhouette"
                    >
                      <Sparkles size={11} />
                      <span>Auto Fit Garment</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCrop}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      <RotateCcw size={11} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Top Crop ({cropTop}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={cropTop}
                      onChange={(e) => setCropTop(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bottom Crop ({cropBottom}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={cropBottom}
                      onChange={(e) => setCropBottom(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Left Crop ({cropLeft}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={cropLeft}
                      onChange={(e) => setCropLeft(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Right Crop ({cropRight}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={cropRight}
                      onChange={(e) => setCropRight(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {/* AI Edge Sensitivity */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Sliders size={13} className="text-amber-400" />
                    <span>Background Cut Sensitivity ({aiSensitivity}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={aiSensitivity}
                      onChange={(e) => setAiSensitivity(Number(e.target.value))}
                      className="w-28 accent-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleRerunAi}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-200 transition-colors"
                    >
                      Re-cut
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Garment Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Item Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chunky Knit Turtleneck"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Color Tone
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Midnight Navy"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Brand / Atelier
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Maison Margiela"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              >
                <option value="All-Season">All-Season</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus size={14} />
              <span>Save Segmented Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
