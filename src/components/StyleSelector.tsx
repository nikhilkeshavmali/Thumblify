import {
  ChevronDownIcon,
  ImageIcon,
  PenToolIcon,
  SparkleIcon,
  SquareIcon,
} from "lucide-react";
import { thumbnailStyles, type ThumbnailStyle } from "../assets/assets";

const StyleSelector = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
}: {
  value: ThumbnailStyle;
  onChange: (style: ThumbnailStyle) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const styleDescriptions: Record<ThumbnailStyle, string> = {
    "Bold & Graphic": "High contrast, bold typography, striking visuals",
    "Minimalist": "Clean ,simple, lots of white space",
    "Photorealistic": "Photo-based, natural looking",
    "Illustrated": "Hand-drawn,artistic,creative",

    "Tech/Futuristic": "Modern, sleek, tech-inspired",
  };

  const styleIcons: Record<ThumbnailStyle, React.ReactNode> = {
    "Bold & Graphic": <SparkleIcon className="h-4 w-4" />,
    "Minimalist": <SquareIcon className="h-4 w-4" />,
    "Illustrated": <PenToolIcon className="h-4 w-4" />,
    "Photorealistic": <ImageIcon className="h-4 w-4" />,
    "Tech/Futuristic": <SparkleIcon className="h-4 w-4" />,
  };

  return (
    <div className="relative space-y-3 dark">
      <label className="block text-sm font-medium text-zinc-200">
        Thumbnail Style
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition bg-white/8 border-white/10 text-zinc-200 hover:bg-white/12"
      >
        <div className="flex items-center gap-2">
          {styleIcons[value]}
          <div className="text-left">
            <div className="font-medium">{value}</div>
            <div className="text-xs text-zinc-400">
              {styleDescriptions[value]}
            </div>
          </div>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-md bg-zinc-900 border border-white/20 shadow-xl">
          {thumbnailStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => {
                onChange(style);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition ${
                value === style ? "bg-white/10" : "hover:bg-white/6"
              } ${style === thumbnailStyles[0] ? "rounded-t-md" : ""} ${
                style === thumbnailStyles[thumbnailStyles.length - 1]
                  ? "rounded-b-md"
                  : ""
              }`}
            >
              <div className="flex-shrink-0">{styleIcons[style]}</div>
              <div className="flex-1 text-left">
                <div className="font-medium text-zinc-100 text-sm">{style}</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {styleDescriptions[style]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
