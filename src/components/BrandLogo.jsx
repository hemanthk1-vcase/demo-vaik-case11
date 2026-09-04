import React from "react";
import { Image } from "@/components/ui/image";

export const VAKIL_LOGO_URL =
  "https://media.base44.com/images/public/6a95d675a12ae82453682890/cfe9f50b1_generated_image.png";

/**
 * The official Vakil Case logo (scales + sword, no letter) in its dark charcoal
 * color. Rendered via the Image component so media.base44.com serves an
 * optimized, responsive copy. `fittingType="fit"` preserves the mark without
 * cropping. Size with `className` (e.g. "h-16 w-16").
 */
export default function BrandLogo({ className = "h-10 w-10" }) {
  return (
    <Image
      src={VAKIL_LOGO_URL}
      fittingType="fit"
      className={className}
      alt="Vakil Case logo"
    />
  );
}