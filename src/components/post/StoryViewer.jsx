import { useState, useEffect, useCallback } from "react";
import { X, Eye } from "lucide-react";
import API from "../../utils/axios";
import UserAvatar from "../common/UserAvatar";

const StoryViewer = ({ group, currentUserId, onClose, onViewed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const stories = group.stories || [];
  const currentStory = stories[currentIndex];

  const markAsViewed = useCallback(
    async (storyId) => {
      try {
        await API.post(`/stories/${storyId}/view`);
        if (onViewed) onViewed();
      } catch {
        /* silently fail */
      }
    },
    [onViewed]
  );

  useEffect(() => {
    if (currentStory) {
      markAsViewed(currentStory._id);
    }
  }, [currentStory, markAsViewed]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!currentStory) return;
    if (currentStory.mediaType === "video") return undefined;
    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, stories.length, onClose, currentStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0)
        setCurrentIndex((prev) => prev - 1);
      if (e.key === "ArrowRight" && currentIndex < stories.length - 1)
        setCurrentIndex((prev) => prev + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;
  const storyText = String(currentStory.text || "").trim();
  const hasMedia = Boolean(currentStory.image?.url);

  return (
    <div
      className="z-app-immersive fixed inset-0 flex items-center justify-center bg-base-200 text-base-content"
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStart == null) return;
        const delta = event.changedTouches[0].clientX - touchStart;
        if (delta > 50) handlePrev();
        if (delta < -50) handleNext();
        setTouchStart(null);
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="btn btn-circle btn-sm absolute right-3 top-7 z-30 border border-base-300 bg-base-100/90 text-base-content shadow-lg backdrop-blur-md hover:bg-base-100 sm:right-4 sm:top-8"
        aria-label="Close story"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Progress bars */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-base-content/20"
          >
            <div
              className={`h-full bg-primary transition-all duration-100 ${
                idx < currentIndex
                  ? "w-full"
                  : idx === currentIndex
                    ? "animate-[storyProgress_5s_linear]"
                    : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Author info */}
      <div className="absolute left-3 top-7 z-20 flex max-w-[calc(100%_-_4.75rem)] items-center gap-2 rounded-xl border border-base-300 bg-base-100/90 px-2.5 py-2 shadow-lg backdrop-blur-md sm:left-4 sm:top-8">
        <UserAvatar
          user={group.author}
          size={32}
          showPresence={false}
          showAdminBadge={false}
        />
        <div>
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-base-content">
              {group.author?.name}
            </p>
            {currentStory.status && currentStory.status !== "approved" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  currentStory.status === "pending_review"
                    ? "bg-warning text-warning-content"
                    : "bg-error text-error-content"
                }`}
              >
                {currentStory.status === "pending_review"
                  ? "Under Review"
                  : "Not Approved"}
              </span>
            )}
          </div>
          {group.author?._id === currentUserId && (
            <p className="flex items-center gap-1 text-xs text-base-content/60">
              <Eye className="w-3 h-3" /> {currentStory.viewers?.length || 0}{" "}
              views
            </p>
          )}
        </div>
      </div>

      {/* Navigation areas */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
      />
      <button
        onClick={handleNext}
        className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
      />

      {/* Story content */}
      <div className="flex h-full w-full items-center justify-center bg-base-300/25 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-20 sm:p-4">
        {currentStory.image?.url && currentStory.mediaType === "video" ? (
          <video
            src={currentStory.image.url}
            controls
            autoPlay
            playsInline
            onEnded={handleNext}
            className="max-h-[calc(100dvh-7rem)] max-w-full rounded-xl bg-black shadow-2xl sm:max-h-[80vh]"
          />
        ) : currentStory.image?.url ? (
          <img
            src={currentStory.image.url}
            alt=""
            className="max-h-[calc(100dvh-7rem)] max-w-full rounded-xl bg-base-300 object-contain shadow-2xl sm:max-h-[80vh]"
          />
        ) : storyText ? (
          <div className="z-20 max-h-[70dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-300 bg-base-100 px-6 py-8 text-center text-base-content shadow-2xl sm:px-10">
            <p className="whitespace-pre-wrap break-words text-xl font-medium leading-relaxed sm:text-2xl">
              {storyText}
            </p>
          </div>
        ) : null}
      </div>

      {/* Text overlay at bottom */}
      {hasMedia && storyText && (
        <div className="pointer-events-none absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 px-4 sm:px-8">
          <div className="pointer-events-auto mx-auto max-h-[30vh] w-fit max-w-2xl overflow-y-auto rounded-2xl border border-base-300 bg-base-100/95 px-4 py-3 text-center shadow-2xl backdrop-blur-md sm:px-6">
            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-base-content sm:text-base">
              {storyText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
