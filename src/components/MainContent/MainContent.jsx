import React, { useState, useEffect, useRef } from "react";
import wallilogo from "@/assets/wallilogo.png";

// UI Components
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Ensure all Accordion parts are imported
import { Label } from "@/components/ui/label";

// Icons
import {
  X,
  Upload,
  Scale,
  Palette,
  Download,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Wand2,
  Square, // Used for Corner Radius & Border
  Droplet, // Used for Watermark
  Type, // Used for Font Family
  Wind, // Icon for Shadow
} from "lucide-react";

// React Hook Form
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";

// --- ShadowControl Component (Unchanged) ---
const ShadowControl = ({ defaultValues, onChange }) => {
  const [settings, setSettings] = useState(defaultValues);
  useEffect(() => {
    setSettings(defaultValues);
  }, [defaultValues]);
  const handleChange = (key, value) => {
    const newValue =
      typeof value === "number" ? value : parseInt(value, 10) || 0;
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    onChange(newSettings);
  };
  const getId = (key) => `shadow-control-${key}-${React.useId()}`;
  const minMaxOffset = 50;
  return (
    <Card className="border border-border/40 p-4 space-y-4 bg-accent/10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <div className="space-y-2">
          <label
            htmlFor={getId("offsetX")}
            className="text-xs font-medium text-muted-foreground"
          >
            Offset X ({settings.offsetX}px)
          </label>
          <Slider
            id={getId("offsetX")}
            min={-minMaxOffset}
            max={minMaxOffset}
            step={1}
            value={[settings.offsetX]}
            onValueChange={(val) => handleChange("offsetX", val[0])}
            aria-label="Shadow Offset X"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={getId("offsetY")}
            className="text-xs font-medium text-muted-foreground"
          >
            Offset Y ({settings.offsetY}px)
          </label>
          <Slider
            id={getId("offsetY")}
            min={-minMaxOffset}
            max={minMaxOffset}
            step={1}
            value={[settings.offsetY]}
            onValueChange={(val) => handleChange("offsetY", val[0])}
            aria-label="Shadow Offset Y"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={getId("blur")}
            className="text-xs font-medium text-muted-foreground"
          >
            Blur ({settings.blur}px)
          </label>
          <Slider
            id={getId("blur")}
            min={0}
            max={50}
            step={1}
            value={[settings.blur]}
            onValueChange={(val) => handleChange("blur", val[0])}
            aria-label="Shadow Blur"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={getId("opacity")}
            className="text-xs font-medium text-muted-foreground"
          >
            Opacity ({settings.opacity}%)
          </label>
          <Slider
            id={getId("opacity")}
            min={0}
            max={100}
            step={1}
            value={[settings.opacity]}
            onValueChange={(val) => handleChange("opacity", val[0])}
            aria-label="Shadow Opacity"
          />
        </div>
      </div>
    </Card>
  );
};

// --- Presets Data (Unchanged) ---
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
const GROUPED_PRESETS = DIMENSION_PRESETS.reduce((acc, preset) => {
  const category = preset.category || "Other";
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(preset);
  return acc;
}, {});

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
    return `rgba(255, 255, 255, ${alpha})`; // Default to white if hex is invalid
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
  // Add more fonts here if desired (ensure they are loaded via CSS/HTML if not web-safe)
];

// --- Main Component ---
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
  const [shadowSettings, setShadowSettings] = useState({
    offsetX: 0,
    offsetY: 4,
    blur: 8,
    opacity: 20,
  });
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] =
    useState("canvas-settings"); // Controls outer accordion
  const [imageBorderRadius, setImageBorderRadius] = useState(0);

  // == Image Border State ==
  const [imageBorderEnabled, setImageBorderEnabled] = useState(false);
  const [imageBorderWidth, setImageBorderWidth] = useState(4);
  const [imageBorderColor, setImageBorderColor] = useState("#000000");

  // == Watermark State ==
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
  }, [form.watch, form.getFieldState, dimensions.width, dimensions.height]);

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
      console.error("Error loading image source");
      if (!isCancelled) {
        setLoadedImgElement(null);
        setIsLoadingImage(false);
        setUploadedImage(null);
        setActiveAccordionItem("canvas-settings");
        alert("Error loading image. Please try a different file.");
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

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, effectiveCanvasWidth, effectiveCanvasHeight);

    if (
      !loadedImgElement ||
      effectiveCanvasWidth <= 0 ||
      effectiveCanvasHeight <= 0
    ) {
      return;
    }

    // --- Calculations ---
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

    const imageX = outerX + effectiveBorderWidth;
    const imageY = outerY + effectiveBorderWidth;

    const shorterSideInner = Math.min(scaledImgW, scaledImgH);
    const innerRadius =
      shorterSideInner > 0 ? (shorterSideInner * imageBorderRadius) / 100 : 0;
    const outerRadius = innerRadius + effectiveBorderWidth;

    // --- Drawing ---
    ctx.save(); // Save initial state

    // 1. Draw Shadow (based on outer bounds including border)
    ctx.shadowOffsetX = shadowSettings.offsetX * scaleFactor;
    ctx.shadowOffsetY = shadowSettings.offsetY * scaleFactor;
    ctx.shadowBlur = shadowSettings.blur * scaleFactor;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowSettings.opacity / 100})`;
    createRoundedRectPath(
      ctx,
      outerX,
      outerY,
      totalWidth,
      totalHeight,
      outerRadius
    );
    ctx.fillStyle = backgroundColor; // Fill to render shadow
    ctx.fill();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)"; // Reset shadow

    // 2. Draw Border Fill (if enabled)
    if (imageBorderEnabled && effectiveBorderWidth > 0) {
      ctx.fillStyle = imageBorderColor;
      // Use the same outer path
      createRoundedRectPath(
        ctx,
        outerX,
        outerY,
        totalWidth,
        totalHeight,
        outerRadius
      );
      ctx.fill();
    }

    // 3. Clip to Inner Area and Draw Image
    ctx.save(); // Save state before clipping for image
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
      if (scaledImgW > 0 && scaledImgH > 0) {
        ctx.drawImage(loadedImgElement, imageX, imageY, scaledImgW, scaledImgH);
      }
    } catch (e) {
      console.error("Error drawing preview image:", e);
    }
    ctx.restore(); // Restore state after clipping image (removes clip)

    // 4. Draw Watermark (if enabled)
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
      const wmY = outerY + totalHeight - padding;

      switch (watermarkPosition) {
        case "left":
          wmX = outerX + padding + effectiveBorderWidth;
          break;
        case "right":
          wmX = outerX + totalWidth - padding - effectiveBorderWidth;
          break;
        case "center":
        default:
          wmX = outerX + totalWidth / 2;
          break;
      }

      if (wmY > 0 && wmY < effectiveCanvasHeight + fontSize) {
        ctx.fillText(watermarkText, wmX, wmY);
      }

      ctx.restore();
    }

    // Final restore from initial save
    ctx.restore();
  }, [
    // Added all relevant states
    loadedImgElement,
    imageScale,
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
        setImageBorderRadius(0);
        setImageBorderEnabled(false); // Reset border
        setWatermarkEnabled(false);
        setWatermarkText("");
        setWatermarkFontFamily(WATERMARK_FONTS[0].value); // Reset font
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
    setImageBorderRadius(0);
    setImageBorderEnabled(false); // Reset border
    setWatermarkEnabled(false);
    setWatermarkText("");
    setWatermarkFontFamily(WATERMARK_FONTS[0].value); // Reset font
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
      setDimensions({ width: preset.width, height: preset.height });
    }
  };

  const handleScaleChange = (value) => {
    setImageScale(value?.[0] ?? 1);
  };

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
        `Error: Canvas dimensions (${targetWidth}x${targetHeight}) are too large to download reliably. Please reduce the size.`
      );
      return;
    }

    const canvas = document.createElement("canvas");
    try {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    } catch (e) {
      console.error("Error setting canvas dimensions:", e);
      alert(
        `Error: Could not create canvas of size ${targetWidth}x${targetHeight}. Please try smaller dimensions.`
      );
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context for download canvas");
      alert("Error: Could not create the download image.");
      return;
    }

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Calculations ---
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

    const imageX = outerX + effectiveBorderWidth;
    const imageY = outerY + effectiveBorderWidth;

    const shorterSideInner = Math.min(scaledImgW, scaledImgH);
    const innerRadius =
      shorterSideInner > 0 ? (shorterSideInner * imageBorderRadius) / 100 : 0;
    const outerRadius = innerRadius + effectiveBorderWidth;

    // --- Drawing ---
    ctx.save(); // Save initial state

    // 1. Draw Shadow
    ctx.shadowOffsetX = shadowSettings.offsetX;
    ctx.shadowOffsetY = shadowSettings.offsetY;
    ctx.shadowBlur = shadowSettings.blur;
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowSettings.opacity / 100})`;
    createRoundedRectPath(
      ctx,
      outerX,
      outerY,
      totalWidth,
      totalHeight,
      outerRadius
    );
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";

    // 2. Draw Border Fill
    if (imageBorderEnabled && effectiveBorderWidth > 0) {
      ctx.fillStyle = imageBorderColor;
      createRoundedRectPath(
        ctx,
        outerX,
        outerY,
        totalWidth,
        totalHeight,
        outerRadius
      );
      ctx.fill();
    }

    // 3. Clip and Draw Image
    ctx.save(); // Save before image clip
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
      if (scaledImgW > 0 && scaledImgH > 0) {
        ctx.drawImage(loadedImgElement, imageX, imageY, scaledImgW, scaledImgH);
      }
    } catch (e) {
      console.error("Error drawing image onto download canvas:", e);
      alert("Error: Failed to draw the image for download.");
      ctx.restore(); // Restore from image clip save
      ctx.restore(); // Restore from initial save
      return;
    }
    ctx.restore(); // Restore from image clip save

    // 4. Draw Watermark
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
      const wmY = outerY + totalHeight - padding;

      switch (watermarkPosition) {
        case "left":
          wmX = outerX + padding + effectiveBorderWidth;
          break;
        case "right":
          wmX = outerX + totalWidth - padding - effectiveBorderWidth;
          break;
        case "center":
        default:
          wmX = outerX + totalWidth / 2;
          break;
      }

      if (wmY > 0 && wmY < targetHeight + fontSize) {
        ctx.fillText(watermarkText, wmX, wmY);
      }

      ctx.restore();
    }

    // Final restore
    ctx.restore();

    // --- Generate and trigger download link ---
    try {
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl.length < 10) {
        throw new Error("Generated Data URL is too short or invalid.");
      }
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
      console.error("Error generating or triggering download link:", error);
      if (
        error.name === "SecurityError" ||
        error.message.includes("Data URL") ||
        error.message.includes("too large")
      ) {
        alert(
          "Error: The generated image is too large to download directly. Please try smaller dimensions or use a different browser."
        );
      } else {
        alert(
          "Error: Could not generate the download file. The canvas size might be too large."
        );
      }
    }
  };

  // == JSX Structure ==
  return (
    <main className="flex-1 w-full bg-background font-Funnel">
      <div className="container max-w-7xl mx-auto p-4 lg:p-8 h-full">
        {/* Header */}
        <div className="flex items-center justify-start mb-6 mt-12 lg:mt-0">
          <img src={wallilogo} alt="Walli" className="h-12 pr-2" />
          <h2 className="text-3xl font-bold tracking-tight font-Almendra ">
            Walli
          </h2>
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
          <div className="flex-1 w-full space-y-6 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="border border-border/40 overflow-hidden">
                  <CardContent
                    className="p-4 sm:p-6 flex items-center justify-center bg-muted/20"
                    style={{ minHeight: "250px" }}
                  >
                    <div
                      className={`relative border border-dashed border-border/50 rounded-md transition-colors duration-200 ease-in-out flex items-center justify-center overflow-hidden shadow-inner w-full ${
                        !uploadedImage && !isLoadingImage
                          ? "cursor-pointer hover:bg-accent/50"
                          : ""
                      }`}
                      style={{
                        aspectRatio: `${targetAspectRatio}`,
                        backgroundColor: !uploadedImage
                          ? backgroundColor
                          : "transparent",
                        maxWidth: `${maxVisualWidth}px`,
                        margin: "0 auto",
                      }}
                      onClick={
                        !uploadedImage && !isLoadingImage
                          ? triggerFileInput
                          : undefined
                      }
                      title={
                        !uploadedImage && !isLoadingImage
                          ? "Click to upload image"
                          : "Image Preview"
                      }
                    >
                      {isLoadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
                          <p className="text-white text-sm animate-pulse">
                            Loading...
                          </p>
                        </div>
                      )}
                      {uploadedImage ? (
                        <canvas
                          ref={previewCanvasRef}
                          className={isLoadingImage ? "opacity-50" : ""}
                          style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            transition: "opacity 0.2s ease-in-out",
                          }}
                        />
                      ) : (
                        !isLoadingImage && (
                          <div className="flex flex-col items-center text-center text-muted-foreground p-4">
                            {" "}
                            <Upload className="h-10 w-10 mb-2 opacity-50" />{" "}
                            <span className="text-sm font-medium">
                              Click to Upload Image
                            </span>{" "}
                          </div>
                        )
                      )}
                      {uploadedImage && !isLoadingImage && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-7 w-7 z-10 opacity-60 hover:opacity-100 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          title="Remove image"
                        >
                          {" "}
                          <X className="h-4 w-4" />{" "}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-between items-center flex-wrap gap-2 pt-2">
                  <p className="text-xs text-muted-foreground flex-1 basis-full md:basis-auto">
                    {uploadedImage
                      ? `Target: ${dimensions.width}x${dimensions.height}px`
                      : "Upload an image to start."}
                  </p>
                  {uploadedImage ? (
                    <Button
                      variant="default"
                      onClick={handleDownload}
                      disabled={
                        !loadedImgElement ||
                        isLoadingImage ||
                        !dimensions.width ||
                        !dimensions.height ||
                        form.formState.errors.backgroundWidth ||
                        form.formState.errors.backgroundHeight
                      }
                      className="flex items-center gap-2"
                    >
                      {" "}
                      <Download className="h-4 w-4" /> Download PNG{" "}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={triggerFileInput}
                      disabled={isLoadingImage}
                      className="flex items-center gap-2"
                    >
                      {" "}
                      <Upload className="h-4 w-4" /> Upload Image{" "}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column: Settings */}
          <div className="lg:w-[400px] xl:w-[450px] space-y-0 flex-shrink-0">
            {/* Outer Accordion Wrapper */}
            <Accordion
              type="single"
              collapsible
              value={activeAccordionItem}
              onValueChange={setActiveAccordionItem}
              className="w-full space-y-6" // Spacing between Canvas/Image sections
            >
              {/* == Canvas Settings Accordion Item == */}
              <AccordionItem value="canvas-settings" className="border-b-0">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg [&[data-state=open]>div>svg.lucide-chevron-down]:rotate-180">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 font-semibold">
                        <SettingsIcon className="h-5 w-5" /> Canvas Settings
                      </div>
                      {/* <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 lucide lucide-chevron-down" /> */}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-0 pb-6">
                    <Form {...form}>
                      <div className="space-y-6 pt-4">
                        {/* --- Canvas Settings Inner Content --- */}
                        <Tabs defaultValue="presets" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="presets">Presets</TabsTrigger>
                            <TabsTrigger value="custom">
                              Custom Size
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="presets" className="space-y-4">
                            <div className="grid grid-cols-1 gap-1 md:grid-cols-1 xl:grid-cols-1">
                              {Object.entries(GROUPED_PRESETS).map(
                                ([category, presets]) => (
                                  <div key={category} className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground px-1">
                                      {category}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {presets.map((preset) => (
                                        <Button
                                          key={preset.name}
                                          type="button"
                                          variant="outline"
                                          className="w-full h-auto p-2 text-left flex flex-row items-center justify-between gap-2 hover:bg-accent/50"
                                          onClick={() =>
                                            applyPreset(preset.name)
                                          }
                                          title={preset.name}
                                        >
                                          <span className="text-sm font-medium leading-snug flex-grow mr-2">
                                            {preset.name}
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className="whitespace-nowrap text-xs font-normal flex-shrink-0"
                                          >
                                            {" "}
                                            {preset.width}×{preset.height}{" "}
                                          </Badge>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value="custom" className="space-y-6">
                            <div className="flex flex-wrap items-start gap-4 bg-muted/40 p-4 rounded-md border border-border/30">
                              <FormField
                                control={form.control}
                                name="backgroundWidth"
                                rules={{
                                  required: "Width required",
                                  valueAsNumber: true,
                                  min: { value: 10, message: "Min 10px" },
                                  max: { value: 8000, message: "Max 8000px" },
                                  validate: (value) =>
                                    Number.isInteger(Number(value)) ||
                                    "Integer required",
                                }}
                                render={({ field }) => (
                                  <FormItem className="flex-1 min-w-[100px]">
                                    <FormLabel>Width (px)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="10"
                                        max="8000"
                                        step="1"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value === ""
                                              ? ""
                                              : e.target.value
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span className="text-muted-foreground font-medium text-lg pt-8">
                                ×
                              </span>
                              <FormField
                                control={form.control}
                                name="backgroundHeight"
                                rules={{
                                  required: "Height required",
                                  valueAsNumber: true,
                                  min: { value: 10, message: "Min 10px" },
                                  max: { value: 8000, message: "Max 8000px" },
                                  validate: (value) =>
                                    Number.isInteger(Number(value)) ||
                                    "Integer required",
                                }}
                                render={({ field }) => (
                                  <FormItem className="flex-1 min-w-[100px]">
                                    <FormLabel>Height (px)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="10"
                                        max="8000"
                                        step="1"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value === ""
                                              ? ""
                                              : e.target.value
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-4 rounded-md border border-border/30">
                              <FormField
                                control={form.control}
                                name="backgroundColor"
                                rules={{
                                  required: "Color required",
                                  pattern: {
                                    value: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
                                    message: "Invalid hex (#xxx or #xxxxxx)",
                                  },
                                }}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="flex items-center gap-2">
                                      <Palette className="h-4 w-4" /> Background
                                      Color
                                    </FormLabel>
                                    <div className="flex items-center gap-3">
                                      <FormControl>
                                        <input
                                          type="color"
                                          className="w-10 h-10 border-none cursor-pointer p-0 rounded bg-transparent"
                                          value={field.value || "#ffffff"}
                                          onChange={field.onChange}
                                          style={{
                                            backgroundColor:
                                              field.value || "#ffffff",
                                            border:
                                              field.value &&
                                              field.value.toLowerCase() >
                                                "#eeeeee"
                                                ? "1px solid #ccc"
                                                : "none",
                                          }}
                                        />
                                      </FormControl>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          className="w-24 font-mono text-sm h-10"
                                          placeholder="#ffffff"
                                          {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <h4 className="text-sm font-medium text-muted-foreground w-full mb-1">
                                Set Aspect Ratio (based on current width)
                              </h4>
                              {[
                                { label: "1:1", ratio: 1 },
                                { label: "16:9", ratio: 16 / 9 },
                                { label: "4:3", ratio: 4 / 3 },
                                { label: "9:16", ratio: 9 / 16 },
                                { label: "3:4", ratio: 3 / 4 },
                              ].map((item) => (
                                <Button
                                  key={item.label}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentWidthStr =
                                      form.getValues().backgroundWidth;
                                    const currentWidth =
                                      Number(currentWidthStr);
                                    if (
                                      currentWidth > 0 &&
                                      !form.getFieldState("backgroundWidth")
                                        .error
                                    ) {
                                      const newHeight = Math.max(
                                        10,
                                        Math.round(currentWidth / item.ratio)
                                      );
                                      const clampedHeight = Math.min(
                                        8000,
                                        newHeight
                                      );
                                      form.setValue(
                                        "backgroundHeight",
                                        clampedHeight,
                                        {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        }
                                      );
                                      setDimensions({
                                        width: currentWidth,
                                        height: clampedHeight,
                                      });
                                    } else {
                                      form.trigger("backgroundWidth");
                                      console.warn(
                                        "Cannot set aspect ratio: Current width is invalid."
                                      );
                                    }
                                  }}
                                >
                                  {" "}
                                  {item.label}{" "}
                                </Button>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                        {/* --- End Canvas Settings Inner Content --- */}
                      </div>
                    </Form>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* == Image Controls Accordion Item == */}
              {uploadedImage && (
                <AccordionItem value="image-controls" className="border-b-0">
                  <Card className="overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline text-lg [&[data-state=open]>div>svg.lucide-chevron-down]:rotate-180">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 font-semibold">
                          <Wand2 className="h-5 w-5" /> Image Controls
                        </div>
                        {/* <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 lucide lucide-chevron-down" /> */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-0 pb-6">
                      {loadedImgElement ? (
                        // --- NESTED ACCORDION FOR IMAGE CONTROLS ---
                        <Accordion
                          type="multiple"
                          className="w-full space-y-4 pt-4"
                        >
                          {/* Scale & Radius Item */}
                          <AccordionItem
                            value="image-scale-radius"
                            className="border-b-0"
                          >
                            <Card className="overflow-hidden border border-border/40 bg-accent/10">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-2 font-medium">
                                  <Scale className="h-4 w-4 text-muted-foreground" />{" "}
                                  Scale & Radius
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-0">
                                <div className="pt-4 space-y-4 border-t border-border/20">
                                  {/* Scale Slider */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <Label className="text-xs">Scale</Label>
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {" "}
                                        {imageScale.toFixed(2)}x{" "}
                                      </span>
                                    </div>
                                    <Slider
                                      aria-label="Image Scale"
                                      value={[imageScale]}
                                      min={0.1}
                                      max={5}
                                      step={0.05}
                                      onValueChange={handleScaleChange}
                                    />
                                  </div>
                                  {/* Radius Slider */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <Label
                                        htmlFor="image-border-radius"
                                        className="text-xs"
                                      >
                                        Corner Radius
                                      </Label>
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {" "}
                                        {imageBorderRadius}%{" "}
                                      </span>
                                    </div>
                                    <Slider
                                      id="image-border-radius"
                                      aria-label="Image Corner Radius"
                                      value={[imageBorderRadius]}
                                      min={0}
                                      max={50}
                                      step={1}
                                      onValueChange={(value) =>
                                        setImageBorderRadius(value[0])
                                      }
                                    />
                                  </div>
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>

                          {/* Shadow Item */}
                          <AccordionItem
                            value="image-shadow"
                            className="border-b-0"
                          >
                            <Card className="overflow-hidden border border-border/40 bg-accent/10">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-2 font-medium">
                                  <Wind className="h-4 w-4 text-muted-foreground" />{" "}
                                  Shadow
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-0 pt-0">
                                {" "}
                                {/* ShadowControl has own Card+Padding */}
                                <div className="pt-4 border-t border-border/20">
                                  <ShadowControl
                                    defaultValues={shadowSettings}
                                    onChange={setShadowSettings}
                                  />
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>

                          {/* Border Item */}
                          <AccordionItem
                            value="image-border"
                            className="border-b-0"
                          >
                            <Card className="overflow-hidden border border-border/40 bg-accent/10">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-2 font-medium">
                                  <Square className="h-4 w-4 text-muted-foreground" />{" "}
                                  Border
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-0">
                                <div className="pt-4 space-y-4 border-t border-border/20">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">
                                      Enable Border
                                    </Label>
                                    <Switch
                                      size="xs"
                                      variant={
                                        imageBorderEnabled
                                          ? "secondary"
                                          : "outline"
                                      }
                                      onClick={() =>
                                        setImageBorderEnabled(
                                          !imageBorderEnabled
                                        )
                                      }
                                    >
                                      {" "}
                                      {imageBorderEnabled ? "On" : "Off"}{" "}
                                    </Switch>
                                  </div>
                                  {imageBorderEnabled && (
                                    <div className="space-y-4">
                                      <div className="space-y-1.5">
                                        <Label
                                          htmlFor="image-border-width"
                                          className="text-xs"
                                        >
                                          Width ({imageBorderWidth}px)
                                        </Label>
                                        <Slider
                                          id="image-border-width"
                                          min={0}
                                          max={30}
                                          step={1}
                                          value={[imageBorderWidth]}
                                          onValueChange={(val) =>
                                            setImageBorderWidth(val[0])
                                          }
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">Color</Label>
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="color"
                                            className="w-8 h-8 border-none cursor-pointer p-0 rounded bg-transparent"
                                            value={imageBorderColor}
                                            onChange={(e) =>
                                              setImageBorderColor(
                                                e.target.value
                                              )
                                            }
                                            style={{
                                              backgroundColor: imageBorderColor,
                                              border:
                                                imageBorderColor.toLowerCase() >
                                                "#eeeeee"
                                                  ? "1px solid #ccc"
                                                  : "none",
                                            }}
                                            title="Border Color"
                                          />
                                          <Input
                                            type="text"
                                            className="w-20 font-mono text-xs h-8"
                                            placeholder="#000000"
                                            value={imageBorderColor}
                                            onChange={(e) =>
                                              setImageBorderColor(
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>

                          {/* Watermark Item */}
                          <AccordionItem
                            value="image-watermark"
                            className="border-b-0"
                          >
                            <Card className="overflow-hidden border border-border/40 bg-accent/10">
                              <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-2 font-medium">
                                  <Droplet className="h-4 w-4 text-muted-foreground" />{" "}
                                  Watermark
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-0">
                                <div className="pt-4 space-y-4 border-t border-border/20">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">
                                      Enable Watermark
                                    </Label>
                                    <Switch
                                      size="xs text-xs"
                                      variant={
                                        watermarkEnabled
                                          ? "secondary"
                                          : "outline"
                                      }
                                      onClick={() =>
                                        setWatermarkEnabled(!watermarkEnabled)
                                      }
                                    >
                                      {" "}
                                      {watermarkEnabled ? "On" : "Off"}{" "}
                                    </Switch>
                                  </div>
                                  {watermarkEnabled && (
                                    <div className="space-y-4">
                                      <div className="space-y-1.5">
                                        <Label
                                          htmlFor="watermark-text"
                                          className="text-xs"
                                        >
                                          Text
                                        </Label>
                                        <Input
                                          id="watermark-text"
                                          type="text"
                                          placeholder="Your watermark"
                                          value={watermarkText}
                                          onChange={(e) =>
                                            setWatermarkText(e.target.value)
                                          }
                                          className="h-8 text-xs"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                          <Label
                                            htmlFor="watermark-opacity"
                                            className="text-xs"
                                          >
                                            Opacity ({watermarkOpacity}%)
                                          </Label>
                                          <Slider
                                            id="watermark-opacity"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={[watermarkOpacity]}
                                            onValueChange={(val) =>
                                              setWatermarkOpacity(val[0])
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <Label
                                            htmlFor="watermark-size"
                                            className="text-xs"
                                          >
                                            Size ({watermarkSizePercent}%)
                                          </Label>
                                          <Slider
                                            id="watermark-size"
                                            min={1}
                                            max={15}
                                            step={0.5}
                                            value={[watermarkSizePercent]}
                                            onValueChange={(val) =>
                                              setWatermarkSizePercent(val[0])
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">Color</Label>
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="color"
                                            className="w-8 h-8 border-none cursor-pointer p-0 rounded bg-transparent"
                                            value={watermarkColor}
                                            onChange={(e) =>
                                              setWatermarkColor(e.target.value)
                                            }
                                            style={{
                                              backgroundColor: watermarkColor,
                                              border:
                                                watermarkColor.toLowerCase() >
                                                "#eeeeee"
                                                  ? "1px solid #ccc"
                                                  : "none",
                                            }}
                                            title="Watermark Color"
                                          />
                                          <Input
                                            type="text"
                                            className="w-20 font-mono text-xs h-8"
                                            placeholder="#ffffff"
                                            value={watermarkColor}
                                            onChange={(e) =>
                                              setWatermarkColor(e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label
                                          htmlFor="watermark-font"
                                          className="text-xs flex items-center gap-1"
                                        >
                                          {" "}
                                          <Type className="h-3 w-3" /> Font
                                          Family{" "}
                                        </Label>
                                        <select
                                          id="watermark-font"
                                          value={watermarkFontFamily}
                                          onChange={(e) =>
                                            setWatermarkFontFamily(
                                              e.target.value
                                            )
                                          }
                                          className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {WATERMARK_FONTS.map((font) => (
                                            <option
                                              key={font.value}
                                              value={font.value}
                                            >
                                              {" "}
                                              {font.name}{" "}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          Position
                                        </Label>
                                        <div className="flex gap-2">
                                          {["left", "center", "right"].map(
                                            (pos) => (
                                              <Button
                                                key={pos}
                                                size="xs"
                                                variant={
                                                  watermarkPosition === pos
                                                    ? "default"
                                                    : "outline"
                                                }
                                                onClick={() =>
                                                  setWatermarkPosition(pos)
                                                }
                                                className="capitalize flex-1 h-8 text-xs"
                                              >
                                                {pos}
                                              </Button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>
                        </Accordion> // --- END NESTED ACCORDION ---
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
            {/* End Outer Accordion Wrapper */}
          </div>{" "}
          {/* End Right Column */}
        </div>{" "}
        {/* End Layout */}
      </div>{" "}
      {/* End Container */}
    </main>
  );
};

export default MainContent;
