import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, X, Image as ImageIcon } from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

const ImagePreview = ({
  uploadedImage,
  isLoadingImage,
  loadedImgElement,
  previewCanvasRef,
  targetAspectRatio,
  backgroundColor,
  maxVisualWidth,
  dimensions,
  formErrors,
  triggerFileInput,
  clearImage,
  handleDownload,
}) => {
  const hasDimensionErrors =
    formErrors?.backgroundWidth || formErrors?.backgroundHeight;

  return (
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
            // canvas bg element
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
                !uploadedImage && !isLoadingImage ? triggerFileInput : undefined
              }
              title={
                !uploadedImage && !isLoadingImage
                  ? "Click to upload image"
                  : "Image Preview"
              }
            >
              {isLoadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
                  <p className="text-white text-sm animate-pulse">Loading...</p>
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
            <InteractiveHoverButton
              variant="default"
              onClick={handleDownload}
              disabled={
                !loadedImgElement ||
                isLoadingImage ||
                hasDimensionErrors ||
                !dimensions.width ||
                !dimensions.height
              }
              className="flex items-center gap-2"
            >
              Download PNG
            </InteractiveHoverButton>
          ) : (
            <InteractiveHoverButton
              variant="outline"
              onClick={triggerFileInput}
              disabled={isLoadingImage}
              className="flex items-center gap-2"
            >
              Upload Image
            </InteractiveHoverButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagePreview;
