import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ShadowControl = React.forwardRef(
  ({ className, onChange, defaultValues = {}, ...props }, ref) => {
    const [values, setValues] = React.useState({
      offsetX: defaultValues.offsetX || 0,
      offsetY: defaultValues.offsetY || 4,
      blur: defaultValues.blur || 8,
      opacity: defaultValues.opacity || 20,
    });

    const handleChange = (key, value) => {
      const newValues = { ...values, [key]: value };
      setValues(newValues);
      onChange?.(newValues);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-sm">
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-muted-foreground">
                {`${values.offsetX}px ${values.offsetY}px ${values.blur}px ${values.opacity}%`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label>Offset X</Label>
                    <span className="text-sm text-muted-foreground">
                      {values.offsetX}px
                    </span>
                  </div>
                  <Slider
                    min={-50}
                    max={50}
                    step={1}
                    value={[values.offsetX]}
                    onValueChange={([value]) => handleChange("offsetX", value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label>Offset Y</Label>
                    <span className="text-sm text-muted-foreground">
                      {values.offsetY}px
                    </span>
                  </div>
                  <Slider
                    min={-50}
                    max={50}
                    step={1}
                    value={[values.offsetY]}
                    onValueChange={([value]) => handleChange("offsetY", value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label>Blur</Label>
                    <span className="text-sm text-muted-foreground">
                      {values.blur}px
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[values.blur]}
                    onValueChange={([value]) => handleChange("blur", value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">
                      {values.opacity}%
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[values.opacity]}
                    onValueChange={([value]) => handleChange("opacity", value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

ShadowControl.displayName = "ShadowControl";

export { ShadowControl };
