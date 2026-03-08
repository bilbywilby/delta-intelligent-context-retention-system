import React from "react";
import { Dog } from "lucide-react";
export function TemplateDemo() {
  return (
    <div className="p-12 text-center space-y-4">
      <div className="mx-auto w-20 h-20 border-4 border-primary bg-secondary shadow-hard flex items-center justify-center">
        <Dog className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-display font-black">System Terminal</h2>
      <p className="italic font-medium text-muted-foreground">Delta is monitoring all active workspace nodes.</p>
    </div>
  );
}