import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

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
  const minMaxOffset = 500;
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

// Use default export for simplicity unless you have multiple exports
export default ShadowControl;
