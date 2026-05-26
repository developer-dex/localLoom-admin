/**
 * `ImageLightbox`: a full-screen overlay that shows a clicked image at
 * large size with a close button in the top-right corner. Uses the
 * existing shadcn Dialog primitive.
 */

import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({
  src,
  alt = "Preview",
  open,
  onOpenChange,
}: ImageLightboxProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] max-w-[90vw] items-center justify-center",
          "border-none bg-transparent p-0 shadow-none",
        )}
      >
        <DialogClose className="absolute right-3 top-3 z-50 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm hover:bg-background">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-full rounded-md object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
