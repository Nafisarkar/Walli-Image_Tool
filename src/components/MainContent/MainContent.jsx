import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Upload, Scale, Palette } from "lucide-react";
import { ShadowControl } from "@/components/ui/shadow-control";

// Preset dimensions for common formats
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

// Group presets by category
const GROUPED_PRESETS = DIMENSION_PRESETS.reduce((acc, preset) => {
  if (!acc[preset.category]) {
    acc[preset.category] = [];
  }
  acc[preset.category].push(preset);
  return acc;
}, {});

const MainContent = () => {
  const form = useForm({
    defaultValues: {
      backgroundWidth: 1080,
      backgroundHeight: 1350,
      backgroundColor: "#ffffff",
    },
  });

  const [dimensions, setDimensions] = useState({
    width: form.getValues().backgroundWidth,
    height: form.getValues().backgroundHeight,
  });

  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState(null);

  // State for image scale
  const [imageScale, setImageScale] = useState(1);

  // State for background color
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  // State for shadow settings
  const [shadowSettings, setShadowSettings] = useState({
    offsetX: 0,
    offsetY: 4,
    blur: 8,
    opacity: 20,
  });

  // Update dimensions and background color when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setDimensions({
        width: value.backgroundWidth,
        height: value.backgroundHeight,
      });
      if (value.backgroundColor) {
        setBackgroundColor(value.backgroundColor);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setImageScale(1); // Reset scale when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear uploaded image
  const clearImage = () => {
    setUploadedImage(null);
    setImageScale(1); // Reset scale when image is cleared
  };

  // Reference to the file input
  const fileInputRef = React.useRef(null);

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Apply preset dimensions
  const applyPreset = (presetName) => {
    const preset = DIMENSION_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      form.setValue("backgroundWidth", preset.width);
      form.setValue("backgroundHeight", preset.height);
    }
  };

  // Handle image scale change
  const handleScaleChange = (value) => {
    setImageScale(value[0]);
  };

  return (
    <main className="flex-1 overflow-auto w-full bg-background">
      <div className="container max-w-5xl mx-auto p-4 lg:p-8 mt-12 lg:mt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Size Settings</h2>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="custom">Custom Size</TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(GROUPED_PRESETS).map(
                    ([category, presets]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {presets.map((preset) => (
                            <Button
                              key={preset.name}
                              variant="outline"
                              className="justify-between w-full"
                              onClick={() => applyPreset(preset.name)}
                            >
                              <span>{preset.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                {preset.width}×{preset.height}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 bg-accent/20 p-4 rounded-md border border-border mb-4">
                      <FormField
                        control={form.control}
                        name="backgroundWidth"
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel className="text-foreground font-medium">
                              Width
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="100"
                                max="4000"
                                className="bg-background border-input text-foreground"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 100
                                  );
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-foreground font-medium text-lg pb-0">
                        ×
                      </span>
                      <FormField
                        control={form.control}
                        name="backgroundHeight"
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel className="text-foreground font-medium">
                              Height
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="100"
                                max="4000"
                                className="bg-background border-input text-foreground"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 100
                                  );
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Background Color Picker */}
                    <div className="flex flex-wrap items-center gap-4 bg-accent/20 p-4 rounded-md border border-border mb-4">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2">
                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              Background Color
                            </FormLabel>
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <Input
                                  type="color"
                                  className="w-12 h-10"
                                  {...field}
                                />
                              </FormControl>
                              <div className="text-sm font-mono">
                                {field.value}
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const height = form.getValues().backgroundHeight;
                          form.setValue("backgroundWidth", height);
                        }}
                      >
                        1:1 Square
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const width = form.getValues().backgroundWidth;
                          form.setValue(
                            "backgroundHeight",
                            Math.round((width * 9) / 16)
                          );
                        }}
                      >
                        16:9 Landscape
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const width = form.getValues().backgroundWidth;
                          form.setValue(
                            "backgroundHeight",
                            Math.round((width * 4) / 3)
                          );
                        }}
                      >
                        4:3 Standard
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />

            {/* Shape Preview Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Preview</h3>
                <div className="text-sm text-muted-foreground">
                  {dimensions.width}px × {dimensions.height}px
                </div>
              </div>

              <Card className="border border-border/40">
                <CardContent
                  className="p-6 flex items-center justify-center"
                  style={{ minHeight: "400px" }}
                >
                  <div
                    className={`border border-border rounded-md transition-all duration-300 flex items-center justify-center overflow-hidden shadow-sm ${
                      !uploadedImage
                        ? "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        : ""
                    }`}
                    style={{
                      width: `${Math.min(dimensions.width / 4, 350)}px`,
                      height: `${Math.min(dimensions.height / 4, 350)}px`,
                      maxWidth: "100%",
                      maxHeight: "350px",
                      backgroundColor: backgroundColor,
                    }}
                    onClick={!uploadedImage ? triggerFileInput : undefined}
                  >
                    {uploadedImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={uploadedImage}
                          alt="Uploaded preview"
                          className="object-contain w-full h-full"
                          style={{
                            transform: `scale(${imageScale})`,
                            transition: "transform 0.2s ease-in-out",
                            filter: `drop-shadow(${shadowSettings.offsetX}px ${
                              shadowSettings.offsetY
                            }px ${shadowSettings.blur}px rgba(0,0,0,${
                              shadowSettings.opacity / 100
                            }))`,
                          }}
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground p-6">
                        <Upload className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">
                          Click to upload image
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground text-center">
                Preview shows a scaled version. Actual output will be{" "}
                {dimensions.width}px × {dimensions.height}px.
              </p>
            </div>

            {/* Image Scale Control - Only visible when an image is uploaded */}
            {uploadedImage && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Image Scale</h3>
                    <span className="ml-auto text-sm font-medium">
                      {imageScale.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[imageScale]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={handleScaleChange}
                    className="w-full"
                  />
                </div>

                {/* Shadow Settings Control */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Shadow Settings</h3>
                  </div>
                  <ShadowControl
                    defaultValues={shadowSettings}
                    onChange={setShadowSettings}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default MainContent;
