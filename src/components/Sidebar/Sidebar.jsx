import React from "react";
import {
  Image, // Photo Frame Icon
  Contrast, // Black and White Icon
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Sidebar = ({ isSidebarOpen }) => {
  return (
    <aside
      className={`fixed lg:static w-64 bg-background p-0 flex flex-col border-r border-border h-full transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } z-40`}
    >
      <div className="flex items-center justify-between p-4 h-14">
        <h1 className="text-xl font-semibold text-foreground">Chobi</h1>
        <ThemeToggle />
      </div>

      <Separator className="mb-4" />

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 p-2">
          <Button
            variant="ghost"
            className="w-full justify-start font-medium h-10 text-foreground hover:text-foreground"
          >
            <Image className="mr-2 h-5 w-5" />
            <span>Photo Frame</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-medium h-10 text-foreground hover:text-foreground"
          >
            <Contrast className="mr-2 h-5 w-5" />
            <span>Image Black & White</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-medium h-10 text-foreground hover:text-foreground"
          >
            <span>Image Texture</span>
          </Button>
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
