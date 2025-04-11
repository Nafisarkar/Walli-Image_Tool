import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "../ui/switch"; // Make sure path is correct
import ShadowControl from "./ShadowControl"; // Assuming ShadowControl is in the same dir or adjust path

import { Scale, Square, Wind, Droplet, Type } from "lucide-react";

// Expects WATERMARK_FONTS to be passed as a prop or defined globally/imported
// For simplicity, let's assume it's passed as a prop now.

const ImageAdjustmentControls = ({
  imageScale,
  setImageScale,
  imageBorderRadius,
  setImageBorderRadius,
  shadowSettings,
  setShadowSettings,
  imageBorderEnabled,
  setImageBorderEnabled,
  imageBorderWidth,
  setImageBorderWidth,
  imageBorderColor,
  setImageBorderColor,
  watermarkEnabled,
  setWatermarkEnabled,
  watermarkText,
  setWatermarkText,
  watermarkOpacity,
  setWatermarkOpacity,
  watermarkSizePercent,
  setWatermarkSizePercent,
  watermarkColor,
  setWatermarkColor,
  watermarkFontFamily,
  setWatermarkFontFamily,
  watermarkPosition,
  setWatermarkPosition,
  WATERMARK_FONTS, // Pass the fonts array
}) => {
  return (
    // --- NESTED ACCORDION FOR IMAGE CONTROLS ---
    <Accordion type="multiple" className="w-full space-y-4 pt-4">
      {/* Scale & Radius Item */}
      <AccordionItem value="image-scale-radius" className="border-b-0">
        <Card className="overflow-hidden border border-border/40 bg-accent/10">
          <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-2 font-medium">
              <Scale className="h-4 w-4 text-muted-foreground" /> Scale & Radius
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
                  onValueChange={(val) => setImageScale(val[0])}
                />
              </div>
              {/* Radius Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="image-border-radius" className="text-xs">
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
                  onValueChange={(val) => setImageBorderRadius(val[0])}
                />
              </div>
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Shadow Item */}
      <AccordionItem value="image-shadow" className="border-b-0">
        <Card className="overflow-hidden border border-border/40 bg-accent/10">
          <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-2 font-medium">
              <Wind className="h-4 w-4 text-muted-foreground" /> Shadow
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-0 pt-0">
            {" "}
            {/* ShadowControl has own Card+Padding */}
            <div className="pt-4 border-t border-border/20">
              {/* NOTE: Assuming ShadowControl component takes defaultValues and onChange(newSettings) */}
              <ShadowControl
                defaultValues={shadowSettings}
                onChange={setShadowSettings}
              />
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Border Item */}
      <AccordionItem value="image-border" className="border-b-0">
        <Card className="overflow-hidden border border-border/40 bg-accent/10">
          <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-2 font-medium">
              <Square className="h-4 w-4 text-muted-foreground" /> Border
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="pt-4 space-y-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Border</Label>
                <Switch // Using Switch component
                  id="border-enable-switch"
                  checked={imageBorderEnabled}
                  onCheckedChange={setImageBorderEnabled}
                  // Add appropriate styling/sizing if needed
                />
              </div>
              {imageBorderEnabled && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="image-border-width" className="text-xs">
                      Width ({imageBorderWidth}px)
                    </Label>
                    <Slider
                      id="image-border-width"
                      min={0}
                      max={30}
                      step={1}
                      value={[imageBorderWidth]}
                      onValueChange={(val) => setImageBorderWidth(val[0])}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-8 h-8 border-none cursor-pointer p-0 rounded bg-transparent"
                        value={imageBorderColor}
                        onChange={(e) => setImageBorderColor(e.target.value)}
                        style={{
                          backgroundColor: imageBorderColor,
                          border:
                            imageBorderColor.toLowerCase() > "#eeeeee"
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
                        onChange={(e) => setImageBorderColor(e.target.value)}
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
      <AccordionItem value="image-watermark" className="border-b-0">
        <Card className="overflow-hidden border border-border/40 bg-accent/10">
          <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-2 font-medium">
              <Droplet className="h-4 w-4 text-muted-foreground" /> Watermark
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="pt-4 space-y-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Watermark</Label>
                <Switch // Using Switch component
                  id="watermark-enable-switch"
                  checked={watermarkEnabled}
                  onCheckedChange={setWatermarkEnabled}
                />
              </div>
              {watermarkEnabled && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="watermark-text" className="text-xs">
                      Text
                    </Label>
                    <Input
                      id="watermark-text"
                      type="text"
                      placeholder="Your watermark"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="watermark-opacity" className="text-xs">
                        Opacity ({watermarkOpacity}%)
                      </Label>
                      <Slider
                        id="watermark-opacity"
                        min={0}
                        max={100}
                        step={1}
                        value={[watermarkOpacity]}
                        onValueChange={(val) => setWatermarkOpacity(val[0])}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="watermark-size" className="text-xs">
                        Size ({watermarkSizePercent}%)
                      </Label>
                      <Slider
                        id="watermark-size"
                        min={1}
                        max={15}
                        step={0.5}
                        value={[watermarkSizePercent]}
                        onValueChange={(val) => setWatermarkSizePercent(val[0])}
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
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        style={{
                          backgroundColor: watermarkColor,
                          border:
                            watermarkColor.toLowerCase() > "#eeeeee"
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
                        onChange={(e) => setWatermarkColor(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="watermark-font"
                      className="text-xs flex items-center gap-1"
                    >
                      {" "}
                      <Type className="h-3 w-3" /> Font Family{" "}
                    </Label>
                    <select
                      id="watermark-font"
                      value={watermarkFontFamily}
                      onChange={(e) => setWatermarkFontFamily(e.target.value)}
                      className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {WATERMARK_FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {" "}
                          {font.name}{" "}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Position</Label>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map((pos) => (
                        <Button
                          key={pos}
                          size="xs"
                          variant={
                            watermarkPosition === pos ? "default" : "outline"
                          }
                          onClick={() => setWatermarkPosition(pos)}
                          className="capitalize flex-1 h-8 text-xs"
                        >
                          {pos}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion> // --- END NESTED ACCORDION ---
  );
};

export default ImageAdjustmentControls;
