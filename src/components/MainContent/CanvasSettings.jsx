import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

// Presets need to be accessible here too
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

const CanvasSettings = ({ form, applyPreset }) => {
  const handleAspectRatioClick = (ratio) => {
    const currentWidthStr = form.getValues().backgroundWidth;
    const currentWidth = Number(currentWidthStr);
    if (currentWidth > 0 && !form.getFieldState("backgroundWidth").error) {
      const newHeight = Math.max(10, Math.round(currentWidth / ratio));
      const clampedHeight = Math.min(8000, newHeight);
      form.setValue("backgroundHeight", clampedHeight, {
        shouldValidate: true,
        shouldDirty: true,
      });
      // Note: setDimensions is handled by the effect in MainContent watching the form
    } else {
      form.trigger("backgroundWidth");
      console.warn("Cannot set aspect ratio: Current width is invalid.");
    }
  };

  return (
    <Form {...form}>
      {" "}
      {/* Pass the form instance */}
      <div className="space-y-6 pt-4">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom Size</TabsTrigger>
          </TabsList>
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 gap-1 md:grid-cols-1 xl:grid-cols-1">
              {Object.entries(GROUPED_PRESETS).map(([category, presets]) => (
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
                        onClick={() => applyPreset(preset.name)}
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
              ))}
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
                    Number.isInteger(Number(value)) || "Integer required",
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
                            e.target.value === "" ? "" : e.target.value
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
                    Number.isInteger(Number(value)) || "Integer required",
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
                            e.target.value === "" ? "" : e.target.value
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
                      <Palette className="h-4 w-4" /> Background Color
                    </FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <input
                          type="color"
                          className="w-10 h-10 border-none cursor-pointer p-0 rounded bg-transparent"
                          value={field.value || "#ffffff"}
                          onChange={field.onChange}
                          style={{
                            backgroundColor: field.value || "#ffffff",
                            border:
                              field.value &&
                              field.value.toLowerCase() > "#eeeeee"
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
                  onClick={() => handleAspectRatioClick(item.ratio)}
                >
                  {" "}
                  {item.label}{" "}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Form>
  );
};

export default CanvasSettings;
