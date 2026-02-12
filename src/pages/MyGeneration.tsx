import { useEffect, useState } from "react";
import { dummyThumbnails, type IThumbnail } from "../assets/assets";
import SoftBackDrop from "../components/SoftBackDrop";
import { div } from "motion/react-client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from "lucide-react";

const MyGeneration = () => {
  const navigate = useNavigate();

  const aspectRatioClassMap: Record<string, string> = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  };

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThumbnails = async () => {
    setThumbnails(dummyThumbnails as unknown as IThumbnail[]);
    setLoading(false);
  };

  const handleDownload = (image_url: string) => {
    window.open(image_url, "_blank");
  };

  const handleDelete = (id: string) => {
    console.log(id);
  };

  useEffect(() => {
    fetchThumbnails();
  }, []);

  return (
    <>
      <SoftBackDrop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-200">My Generation</h1>
          <p className="text-sm text-zinc-400 mt-1">
            View and manage all your AI-generated Thumbnail
          </p>
        </div>
        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/6 border border-white/10 animate-pulse h-[260px]"
              />
            ))}
          </div>
        )}
        {/* EMPTY STATE */}
        {!loading && thumbnails.length === 0 && (
          <div className="text-center py-24">
            <h3 className="text-lg font-semibold text-zinc-200">
              No thumbnails yet
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Generate you first thumbnail to see it here
            </p>
          </div>
        )}
        {/* GRID */}
        {!loading && thumbnails.length > 0 && (
          <div className="columns-1 sm:column-2 lg:columns-3 2xl:columns-4 gap-8">
            {thumbnails.map((thumb: IThumbnail) => {
              const aspectClass =
                aspectRatioClassMap[thumb.aspect_ratio || "16:9"];
              return (
                <div
                  key={thumb._id}
                  onClick={() => navigate(`/generate/${thumb._id}`)}
                  className="mb-8 group relative cursor-pointer rounded-2xl bg-white/6 border border-white/10 transition shadow-xl break-inside-avoid"
                >
                  {/* IMAGE */}
                  <div
                    className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-black`}
                  >
                    {thumb.image_url ? (
                      <img
                        src={thumb.image_url}
                        alt={thumb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">
                        {thumb.isGenerating ? "Generating..." : "No image"}
                      </div>
                    )}
                    {thumb.isGenerating && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm font-medium text-white">
                        Generating...
                      </div>
                    )}
                  </div>
                  {/* CONTENT */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2">
                      {thumb.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/8">
                        {thumb.style}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/8">
                        {thumb.color_scheme}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/8">
                        {thumb.aspect_ratio}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {new Date(thumb.createdAt!).toDateString()}
                    </p>
                  </div>
                  {/* ACTION ICONS - FIXED */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon
                      onClick={() => handleDelete(thumb._id)}
                      className="size-7 bg-black/60 p-1.5 rounded-md hover:bg-pink-600 cursor-pointer transition-colors"
                    />
                    <DownloadIcon
                      onClick={() => handleDownload(thumb.image_url!)}
                      className="size-7 bg-black/60 p-1.5 rounded-md hover:bg-pink-600 cursor-pointer transition-colors"
                    />
                    <Link
                      target="_blank"
                      to={`/preview?thumbnail_url=${encodeURIComponent(thumb.image_url!)}&title=${encodeURIComponent(thumb.title)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowUpRightIcon className="size-7 bg-black/60 p-1.5 rounded-md hover:bg-pink-600 cursor-pointer transition-colors" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
export default MyGeneration;
