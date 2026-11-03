import { createCn } from "cn/config";

// The class merger, taught the theme's own type sizes (globals.css). Without them `text-caption`
// reads as a color, and a later `text-navy` silently drops the size.
const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "hero",
            "page-title",
            "page-title-phone",
            "title",
            "status",
            "name",
            "headline",
            "card-title",
            "tile",
            "row-title",
            "wordmark",
            "lead",
            "body",
            "caption",
            "label",
          ],
        },
      ],
      halo: ["text-halo"],
    },
  },
});

export { cn };
