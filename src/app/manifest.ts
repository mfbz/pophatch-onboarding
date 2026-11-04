import type { MetadataRoute } from "next";

// What a phone uses when the artist adds PopHatch to the home screen: the name, the Klein bar and
// the Night behind the first paint, and the pearl logo (app/icon.png).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PopHatch",
    short_name: "PopHatch",
    description: "Your manager, from one link.",
    start_url: "/",
    display: "standalone",
    background_color: "#060C2A",
    theme_color: "#0A2EB0",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
