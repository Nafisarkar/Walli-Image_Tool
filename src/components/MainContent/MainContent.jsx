import React, { useState, useEffect, useRef } from "react";
import wallilogo from "@/assets/wallilogo.png";

// Child Components (Ensure these exist in the same directory or update paths)
import CanvasSettings from "./CanvasSettings";
import ImagePreview from "./ImagePreview";
import ImageAdjustmentControls from "./ImageAdjustmentControls";

// UI Components (Only those needed directly by MainContent)
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings as SettingsIcon, Wand2, Move } from "lucide-react";

// Magic UI
import { Meteors } from "@/components/magicui/meteors"; // Adjusted path assumption

// React Hook Form
import { useForm } from "react-hook-form";

// --- Helper function for Rounded Rect Path ---
const createRoundedRectPath = (ctx, x, y, width, height, radius) => {
  width = Math.max(0, width);
  height = Math.max(0, height);
  const maxRadius = Math.min(width, height) / 2;
  const r = Math.max(0, Math.min(radius, maxRadius));

  ctx.beginPath();
  if (r === 0 || width === 0 || height === 0) {
    ctx.rect(x, y, width, height);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
  }
  ctx.closePath();
};

// --- Helper function: hexToRgba ---
const hexToRgba = (hex, opacityPercent) => {
  let r = 0,
    g = 0,
    b = 0;
  const alpha = Math.max(0, Math.min(1, opacityPercent / 100));

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  } else {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- Available Watermark Fonts ---
const WATERMARK_FONTS = [
  { name: "Almendra Display", value: '"Almendra Display", serif' },
  { name: "Meow Script", value: '"Meow Script", cursive' },
  { name: "Qwitcher Grypen", value: '"Qwitcher Grypen", display' },
  { name: "Sunshiney", value: '"Sunshiney", cursive' },
  { name: "Sedgwick Ave Display", value: '"Sedgwick Ave Display", display' },
  { name: "Butterfly Kids", value: '"Butterfly Kids", cursive' },
  { name: "Yuji Boku", value: '"Yuji Boku", display' },
  { name: "Bonbon", value: '"Bonbon", cursive' },
  { name: "Ingrid Darling", value: '"Ingrid Darling", cursive' },
  { name: "Zen Loop", value: '"Zen Loop", display' },
  { name: "Festive", value: '"Festive", cursive' },
  { name: "Comforter Brush", value: '"Comforter Brush", cursive' },
];

// Presets Data
const DIMENSION_PRESETS = [
  {
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    category: "Social Media",
  },
  {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "Social Media",
  },
  { name: "Facebook Post", width: 1200, height: 630, category: "Social Media" },
  { name: "Twitter Post", width: 1200, height: 675, category: "Social Media" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "Video" },
  { name: "HD (1080p)", width: 1920, height: 1080, category: "Video" },
  { name: "4K UHD", width: 3840, height: 2160, category: "Video" },
  { name: "A4 Print", width: 2480, height: 3508, category: "Print" },
  { name: "US Letter", width: 2550, height: 3300, category: "Print" },
];

// --- Main Component (Parent) ---
const MainContent = () => {
  // == State Variables ==
  const form = useForm({
    defaultValues: {
      backgroundWidth: 1080,
      backgroundHeight: 1350,
      backgroundColor: "#ffffff",
    },
    mode: "onBlur",
  });
  const [dimensions, setDimensions] = useState({
    width: form.getValues().backgroundWidth,
    height: form.getValues().backgroundHeight,
  });
  const [backgroundColor, setBackgroundColor] = useState(
    form.getValues().backgroundColor
  );
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loadedImgElement, setLoadedImgElement] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(0); // New state for X offset
  const [imageOffsetY, setImageOffsetY] = useState(0); // New state for Y offset
  const [shadowSettings, setShadowSettings] = useState({
    offsetX: 0,
    offsetY: 4,
    blur: 8,
    opacity: 20,
  });
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] =
    useState("canvas-settings");
  const [imageBorderRadius, setImageBorderRadius] = useState(0);
  const [imageBorderEnabled, setImageBorderEnabled] = useState(false);
  const [imageBorderWidth, setImageBorderWidth] = useState(4);
  const [imageBorderColor, setImageBorderColor] = useState("#000000");
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkSizePercent, setWatermarkSizePercent] = useState(4);
  const [watermarkColor, setWatermarkColor] = useState("#ffffff");
  const [watermarkPosition, setWatermarkPosition] = useState("center");
  const [watermarkFontFamily, setWatermarkFontFamily] = useState(
    WATERMARK_FONTS[0].value
  );

  // == Refs ==
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // == Derived Values / Calculations ==
  const targetAspectRatio =
    dimensions.height > 0 ? dimensions.width / dimensions.height : 1;
  const calculatePreviewDimensions = () => {
    const targetWidth = dimensions.width || 100;
    const targetHeight = dimensions.height || 100;
    const targetAspectRatio =
      targetWidth > 0 && targetHeight > 0 ? targetWidth / targetHeight : 1;
    const maxPreviewSize = 400;
    let previewContainerWidth = maxPreviewSize;
    let previewContainerHeight = maxPreviewSize;
    if (targetAspectRatio > 1) {
      previewContainerHeight = maxPreviewSize / targetAspectRatio;
    } else {
      previewContainerWidth = maxPreviewSize * targetAspectRatio;
    }
    previewContainerWidth = Math.max(
      50,
      Math.min(previewContainerWidth, maxPreviewSize)
    );
    previewContainerHeight = Math.max(
      50,
      Math.min(previewContainerHeight, maxPreviewSize)
    );
    const scaleFactor =
      targetWidth > 0 && targetHeight > 0
        ? Math.min(
            previewContainerWidth / targetWidth,
            previewContainerHeight / targetHeight
          )
        : 1;

    return {
      canvasWidth: Math.round(targetWidth * scaleFactor),
      canvasHeight: Math.round(targetHeight * scaleFactor),
      scaleFactor: scaleFactor,
      maxVisualWidth: Math.round(previewContainerWidth),
    };
  };
  const { canvasWidth, canvasHeight, scaleFactor, maxVisualWidth } =
    calculatePreviewDimensions();

  // == Effects ==
  // Effect 1: Watch Form Changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "backgroundWidth" || name === "backgroundHeight") {
        const formWidthStr = value.backgroundWidth;
        const formHeightStr = value.backgroundHeight;
        const parsedWidth = Number(formWidthStr);
        const parsedHeight = Number(formHeightStr);
        const newWidth = parsedWidth > 0 ? parsedWidth : dimensions.width;
        const newHeight = parsedHeight > 0 ? parsedHeight : dimensions.height;

        if (newWidth !== dimensions.width || newHeight !== dimensions.height) {
          const widthError = form.getFieldState("backgroundWidth").error;
          const heightError = form.getFieldState("backgroundHeight").error;
          if (!widthError && !heightError) {
            setDimensions({ width: newWidth, height: newHeight });
          } else if (widthError && !heightError) {
            if (newHeight !== dimensions.height)
              setDimensions((d) => ({ ...d, height: newHeight }));
          } else if (!widthError && heightError) {
            if (newWidth !== dimensions.width)
              setDimensions((d) => ({ ...d, width: newWidth }));
          }
        }
      } else if (name === "backgroundColor") {
        const colorError = form.getFieldState("backgroundColor").error;
        if (!colorError && value.backgroundColor) {
          setBackgroundColor(value.backgroundColor);
        } else if (!value.backgroundColor) {
          setBackgroundColor("#ffffff");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, dimensions.width, dimensions.height]);

  // Effect 2: Load Image Element & Control Accordion State
  useEffect(() => {
    if (!uploadedImage) {
      setLoadedImgElement(null);
      setIsLoadingImage(false);
      setActiveAccordionItem("canvas-settings");
      return;
    }
    let isCancelled = false;
    setIsLoadingImage(true);
    setLoadedImgElement(null);
    const img = new Image();
    img.onload = () => {
      if (!isCancelled) {
        setLoadedImgElement(img);
        setIsLoadingImage(false);
        setActiveAccordionItem("image-controls");
      }
    };
    img.onerror = () => {
      if (!isCancelled) {
        setLoadedImgElement(null);
        setIsLoadingImage(false);
        setUploadedImage(null);
        setActiveAccordionItem("canvas-settings");
        alert("Error loading image.");
      }
    };
    img.src = uploadedImage;
    return () => {
      isCancelled = true;
    };
  }, [uploadedImage]);

  // Effect 3: Draw Preview Canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context");
      return;
    }

    const effectiveCanvasWidth = Math.max(1, canvasWidth);
    const effectiveCanvasHeight = Math.max(1, canvasHeight);
    canvas.width = effectiveCanvasWidth;
    canvas.height = effectiveCanvasHeight;
    ctx.clearRect(0, 0, effectiveCanvasWidth, effectiveCanvasHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, effectiveCanvasWidth, effectiveCanvasHeight);

    if (
      !loadedImgElement ||
      effectiveCanvasWidth <= 0 ||
      effectiveCanvasHeight <= 0
    ) {
      return;
    }

    // Calculations
    const imgW = loadedImgElement.naturalWidth;
    const imgH = loadedImgElement.naturalHeight;
    const scaledImgW = imgW * imageScale * scaleFactor;
    const scaledImgH = imgH * imageScale * scaleFactor;
    const effectiveBorderWidth = imageBorderEnabled
      ? Math.max(0, imageBorderWidth * scaleFactor)
      : 0;
    const totalWidth = scaledImgW + 2 * effectiveBorderWidth;
    const totalHeight = scaledImgH + 2 * effectiveBorderWidth;
    const outerX = (effectiveCanvasWidth - totalWidth) / 2;
    const outerY = (effectiveCanvasHeight - totalHeight) / 2;
    // Apply offsets here, scaled for preview
    const imageX = outerX + effectiveBorderWidth + imageOffsetX * scaleFactor;
    const imageY = outerY + effectiveBorderWidth + imageOffsetY * scaleFactor;
    // Calculate the offset position for the shadow/border shape
    const shapeOuterX = outerX + imageOffsetX * scaleFactor;
    const shapeOuterY = outerY + imageOffsetY * scaleFactor;
    const shorterSideInner = Math.min(scaledImgW, scaledImgH);
    const innerRadius =
      shorterSideInner > 0 ? (shorterSideInner * imageBorderRadius) / 100 : 0;
    const outerRadius = innerRadius + effectiveBorderWidth;

    // Drawing
    ctx.save();
    // 1. Shadow
    ctx.shadowOffsetX = shadowSettings.offsetX * scaleFactor;
    ctx.shadowOffsetY = shadowSettings.offsetY * scaleFactor;
    ctx.shadowBlur = shadowSettings.blur * scaleFactor;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowSettings.opacity / 100})`;
    // Draw the shadow shape at the offset position
    createRoundedRectPath(
      ctx,
      shapeOuterX, // Use offset X
      shapeOuterY, // Use offset Y
      totalWidth,
      totalHeight,
      outerRadius
    );
    ctx.fillStyle = backgroundColor; // Use background color for the shadow fill to avoid transparency issues if border exists
    ctx.fill();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";
    // 2. Border
    if (imageBorderEnabled && effectiveBorderWidth > 0) {
      ctx.fillStyle = imageBorderColor;
      // Draw the border shape at the offset position
      createRoundedRectPath(
        ctx,
        shapeOuterX, // Use offset X
        shapeOuterY, // Use offset Y
        totalWidth,
        totalHeight,
        outerRadius
      );
      ctx.fill();
    }
    // 3. Image
    ctx.save();
    // Clip using the inner shape at the final image position
    createRoundedRectPath(
      ctx,
      imageX,
      imageY,
      scaledImgW,
      scaledImgH,
      innerRadius
    );
    ctx.clip();
    try {
      if (scaledImgW > 0 && scaledImgH > 0)
        ctx.drawImage(loadedImgElement, imageX, imageY, scaledImgW, scaledImgH);
    } catch (e) {
      console.error("Error drawing preview image:", e);
    }
    ctx.restore();
    // 4. Watermark
    if (watermarkEnabled && watermarkText && totalHeight > 0) {
      ctx.save();
      const baseFontSize = scaledImgH * (watermarkSizePercent / 100);
      const fontSize = Math.max(8 * scaleFactor, baseFontSize);
      const padding = fontSize * 0.5;
      ctx.font = `bold ${fontSize}px ${watermarkFontFamily}`;
      ctx.fillStyle = hexToRgba(watermarkColor, watermarkOpacity);
      ctx.textAlign = watermarkPosition;
      ctx.textBaseline = "bottom";
      let wmX;
      // Adjust watermark Y position based on image Y offset
      const wmY = shapeOuterY + totalHeight - padding; // Use shapeOuterY
      switch (watermarkPosition) {
        case "left":
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + padding + effectiveBorderWidth; // Use shapeOuterX
          break;
        case "right":
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + totalWidth - padding - effectiveBorderWidth; // Use shapeOuterX
          break;
        case "center":
        default:
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + totalWidth / 2; // Use shapeOuterX
          break;
      }
      // Check bounds considering offsets (using imageX/Y for actual image area)
      if (wmY > imageY && wmY < imageY + scaledImgH + fontSize)
        ctx.fillText(watermarkText, wmX, wmY);
      ctx.restore();
    }
    ctx.restore(); // Final restore
  }, [
    // Dependencies
    loadedImgElement,
    imageScale,
    imageOffsetX, // Add offset X
    imageOffsetY, // Add offset Y
    shadowSettings,
    backgroundColor,
    canvasWidth,
    canvasHeight,
    scaleFactor,
    imageBorderRadius,
    watermarkEnabled,
    watermarkText,
    watermarkOpacity,
    watermarkSizePercent,
    watermarkColor,
    watermarkPosition,
    watermarkFontFamily,
    imageBorderEnabled,
    imageBorderWidth,
    imageBorderColor,
  ]);

  // == Handlers ==
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result);
        setImageScale(1);
        setImageOffsetX(0); // Reset offset X
        setImageOffsetY(0); // Reset offset Y
        setImageBorderRadius(0);
        setImageBorderEnabled(false);
        setWatermarkEnabled(false);
        setWatermarkText("");
        setWatermarkFontFamily(WATERMARK_FONTS[0].value);
      };
      reader.onerror = (err) => {
        console.error("Error reading file:", err);
        alert("Error reading file.");
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = null;
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImageScale(1);
    setImageOffsetX(0); // Reset offset X
    setImageOffsetY(0); // Reset offset Y
    setImageBorderRadius(0);
    setImageBorderEnabled(false);
    setWatermarkEnabled(false);
    setWatermarkText("");
    setWatermarkFontFamily(WATERMARK_FONTS[0].value);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const applyPreset = (presetName) => {
    const preset = DIMENSION_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      form.setValue("backgroundWidth", preset.width, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("backgroundHeight", preset.height, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // handleDownload
  const handleDownload = () => {
    if (!loadedImgElement || !dimensions.width || !dimensions.height) {
      console.warn("Download cancelled: Missing image or dimensions");
      return;
    }
    const targetWidth = Number(dimensions.width);
    const targetHeight = Number(dimensions.height);
    if (!(targetWidth > 0 && targetHeight > 0)) {
      console.error("Download cancelled: Invalid dimensions", dimensions);
      form.trigger(["backgroundWidth", "backgroundHeight"]);
      return;
    }
    if (
      targetWidth > 16384 ||
      targetHeight > 16384 ||
      targetWidth * targetHeight > 268435456
    ) {
      alert(
        `Error: Canvas dimensions (${targetWidth}x${targetHeight}) are too large...`
      );
      return;
    }

    const canvas = document.createElement("canvas");
    try {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    } catch (e) {
      console.error("Error setting canvas dimensions:", e);
      alert(`Error: Could not create canvas...`);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context for download canvas");
      alert("Error: Could not create download image.");
      return;
    }

    // Calculations (Download)
    const imgW = loadedImgElement.naturalWidth;
    const imgH = loadedImgElement.naturalHeight;
    const scaledImgW = imgW * imageScale;
    const scaledImgH = imgH * imageScale;
    const effectiveBorderWidth = imageBorderEnabled
      ? Math.max(0, imageBorderWidth)
      : 0;
    const totalWidth = scaledImgW + 2 * effectiveBorderWidth;
    const totalHeight = scaledImgH + 2 * effectiveBorderWidth;
    const outerX = (targetWidth - totalWidth) / 2;
    const outerY = (targetHeight - totalHeight) / 2;
    // Apply offsets here (not scaled for download)
    const imageX = outerX + effectiveBorderWidth + imageOffsetX;
    const imageY = outerY + effectiveBorderWidth + imageOffsetY;
    // Calculate the offset position for the shadow/border shape
    const shapeOuterX = outerX + imageOffsetX;
    const shapeOuterY = outerY + imageOffsetY;
    const shorterSideInner = Math.min(scaledImgW, scaledImgH);
    const innerRadius =
      shorterSideInner > 0 ? (shorterSideInner * imageBorderRadius) / 100 : 0;
    const outerRadius = innerRadius + effectiveBorderWidth;

    // Drawing (Download)
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // 1. Shadow
    ctx.shadowOffsetX = shadowSettings.offsetX;
    ctx.shadowOffsetY = shadowSettings.offsetY;
    ctx.shadowBlur = shadowSettings.blur;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowSettings.opacity / 100})`;
    // Draw the shadow shape at the offset position
    createRoundedRectPath(
      ctx,
      shapeOuterX, // Use offset X
      shapeOuterY, // Use offset Y
      totalWidth,
      totalHeight,
      outerRadius
    );
    ctx.fillStyle = backgroundColor; // Use background color for the shadow fill
    ctx.fill();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";
    // 2. Border
    if (imageBorderEnabled && effectiveBorderWidth > 0) {
      ctx.fillStyle = imageBorderColor;
      // Draw the border shape at the offset position
      createRoundedRectPath(
        ctx,
        shapeOuterX, // Use offset X
        shapeOuterY, // Use offset Y
        totalWidth,
        totalHeight,
        outerRadius
      );
      ctx.fill();
    }
    // 3. Image
    ctx.save();
    // Clip using the inner shape at the final image position
    createRoundedRectPath(
      ctx,
      imageX,
      imageY,
      scaledImgW,
      scaledImgH,
      innerRadius
    );
    ctx.clip();
    try {
      if (scaledImgW > 0 && scaledImgH > 0)
        ctx.drawImage(loadedImgElement, imageX, imageY, scaledImgW, scaledImgH);
    } catch (e) {
      console.error("Error drawing image:", e);
      alert("Error drawing image.");
      ctx.restore();
      ctx.restore();
      return;
    }
    ctx.restore();
    // 4. Watermark
    if (watermarkEnabled && watermarkText && totalHeight > 0) {
      ctx.save();
      const baseFontSize = scaledImgH * (watermarkSizePercent / 100);
      const fontSize = Math.max(8, baseFontSize);
      const padding = fontSize * 0.5;
      ctx.font = `bold ${fontSize}px ${watermarkFontFamily}`;
      ctx.fillStyle = hexToRgba(watermarkColor, watermarkOpacity);
      ctx.textAlign = watermarkPosition;
      ctx.textBaseline = "bottom";
      let wmX;
      // Adjust watermark Y position based on image Y offset
      const wmY = shapeOuterY + totalHeight - padding; // Use shapeOuterY
      switch (watermarkPosition) {
        case "left":
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + padding + effectiveBorderWidth; // Use shapeOuterX
          break;
        case "right":
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + totalWidth - padding - effectiveBorderWidth; // Use shapeOuterX
          break;
        case "center":
        default:
          // Adjust watermark X position based on image X offset
          wmX = shapeOuterX + totalWidth / 2; // Use shapeOuterX
          break;
      }
      // Check bounds considering offsets (using imageX/Y for actual image area)
      if (wmY > imageY && wmY < imageY + scaledImgH + fontSize)
        ctx.fillText(watermarkText, wmX, wmY);
      ctx.restore();
    }
    ctx.restore(); // Final restore

    // Generate Link
    try {
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl.length < 10)
        throw new Error("Generated Data URL is too short or invalid.");
      const link = document.createElement("a");
      const radiusString =
        imageBorderRadius > 0 ? `-r${imageBorderRadius}` : "";
      const borderString =
        imageBorderEnabled && imageBorderWidth > 0
          ? `-b${imageBorderWidth}`
          : "";
      const watermarkString =
        watermarkEnabled && watermarkText ? "-watermarked" : "";
      link.download = `Walli-image-${targetWidth}x${targetHeight}${radiusString}${borderString}${watermarkString}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating link:", error);
      if (
        error.name === "SecurityError" ||
        error.message.includes("too large")
      ) {
        alert("Error: Image too large to download directly.");
      } else {
        alert("Error: Could not generate download file.");
      }
    }
  };

  // == JSX Structure ==
  return (
    // ADD relative, overflow-hidden, and min-h-screen to main
    <main className="relative flex-1 w-full  font-Funnel overflow-hidden ">
      {/* ADD Meteors component here */}
      <Meteors number={140} />
      {/* ADD relative and z-10 to container */}
      <div className="relative z-10 container max-w-7xl mx-auto p-4 lg:p-8 ">
        {/* Header */}
        <div className="flex items-center justify-start mb-4 mt-4 lg:mt-0">
          <img src={wallilogo} alt="Walli" className="h-14 pr-2" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-Almendra ">
              Walli
            </h2>
            <h2 className="font-xs text-muted-foreground font-Yuji tracking-tight font-bold">
              <a href="https://www.shaonannafi.me/"> Shaon An Nafi</a>
            </h2>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          ref={fileInputRef}
        />
        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Preview */}
          {/* REMOVED scroll/height constraints */}
          <div className="flex-1 w-full space-y-6 lg:sticky lg:top-8">
            <ImagePreview
              uploadedImage={uploadedImage}
              isLoadingImage={isLoadingImage}
              loadedImgElement={loadedImgElement}
              previewCanvasRef={previewCanvasRef}
              targetAspectRatio={targetAspectRatio}
              backgroundColor={backgroundColor}
              maxVisualWidth={maxVisualWidth}
              dimensions={dimensions}
              formErrors={form.formState.errors}
              triggerFileInput={triggerFileInput}
              clearImage={clearImage}
              handleDownload={handleDownload}
            />
          </div>
          {/* Right Column: Settings */}
          {/* REMOVED scroll/height constraints */}
          <div className="lg:w-[400px] xl:w-[450px] space-y-0 flex-shrink-0">
            {/* Outer Accordion Wrapper */}
            <Accordion
              type="single"
              collapsible
              value={activeAccordionItem}
              onValueChange={setActiveAccordionItem}
              className="w-full space-y-6"
            >
              {/* Canvas Settings Accordion Item */}
              <AccordionItem value="canvas-settings" className="border-b-0">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg [&[data-state=open]>div>svg.lucide-chevron-down]:rotate-180">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 font-semibold">
                        <SettingsIcon className="h-5 w-5" /> Canvas Settings
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-0 pb-6">
                    {/* CanvasSettings component goes here */}
                    <CanvasSettings form={form} applyPreset={applyPreset} />
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Image Controls Accordion Item - Moved to be a sibling */}
              {uploadedImage && (
                <AccordionItem value="image-controls" className="border-b-0">
                  <Card className="overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg [&[data-state=open]>div>svg.lucide-chevron-down]:rotate-180">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 font-semibold">
                          <Wand2 className="h-5 w-5" /> Image Controls
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-0 pb-6">
                      {loadedImgElement ? (
                        <ImageAdjustmentControls
                          imageScale={imageScale}
                          setImageScale={setImageScale}
                          imageOffsetX={imageOffsetX} // Pass offset X state
                          setImageOffsetX={setImageOffsetX} // Pass offset X setter
                          imageOffsetY={imageOffsetY} // Pass offset Y state
                          setImageOffsetY={setImageOffsetY} // Pass offset Y setter
                          imageBorderRadius={imageBorderRadius}
                          setImageBorderRadius={setImageBorderRadius}
                          shadowSettings={shadowSettings}
                          setShadowSettings={setShadowSettings}
                          imageBorderEnabled={imageBorderEnabled}
                          setImageBorderEnabled={setImageBorderEnabled}
                          imageBorderWidth={imageBorderWidth}
                          setImageBorderWidth={setImageBorderWidth}
                          imageBorderColor={imageBorderColor}
                          setImageBorderColor={setImageBorderColor}
                          watermarkEnabled={watermarkEnabled}
                          setWatermarkEnabled={setWatermarkEnabled}
                          watermarkText={watermarkText}
                          setWatermarkText={setWatermarkText}
                          watermarkOpacity={watermarkOpacity}
                          setWatermarkOpacity={setWatermarkOpacity}
                          watermarkSizePercent={watermarkSizePercent}
                          setWatermarkSizePercent={setWatermarkSizePercent}
                          watermarkColor={watermarkColor}
                          setWatermarkColor={setWatermarkColor}
                          watermarkFontFamily={watermarkFontFamily}
                          setWatermarkFontFamily={setWatermarkFontFamily}
                          watermarkPosition={watermarkPosition}
                          setWatermarkPosition={setWatermarkPosition}
                          WATERMARK_FONTS={WATERMARK_FONTS}
                        />
                      ) : (
                        <div className="pt-4 text-center text-muted-foreground">
                          Loading image data...
                        </div>
                      )}
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}
            </Accordion>{" "}
            {/* End Outer Accordion */}
          </div>
          {/* End Right Column */}
        </div>{" "}
        {/* End Layout */}
      </div>{" "}
      {/* End Container */}
    </main>
  );
};

export default MainContent;
