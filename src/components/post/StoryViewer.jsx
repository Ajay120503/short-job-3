import { useState, useEffect, useCallback, useRef } from "react";
import { X, Eye, Pause, Play, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import API from "../../utils/axios";
import UserAvatar from "../common/UserAvatar";

const StoryViewer = ({ group, currentUserId, onClose, onViewed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [paused, setPaused] = useState(false);
  const [failedMedia, setFailedMedia] = useState(null);
  const closeRef = useRef(null);
  const videoRef = useRef(null);
  const timerState = useRef({ storyId: null, remaining: 5000 });
  const stories = group.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [paused, currentStory]);

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
    if (timerState.current.storyId !== currentStory._id) {
      timerState.current = { storyId: currentStory._id, remaining: 5000 };
    }
    if (paused || failedMedia === currentStory._id) return;
    if (currentStory.mediaType === "video") return undefined;
    const started = performance.now();
    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, timerState.current.remaining);
    return () => {
      clearTimeout(timer);
      timerState.current.remaining = Math.max(0, timerState.current.remaining - (performance.now() - started));
    };
  }, [currentIndex, stories.length, onClose, currentStory, paused, failedMedia]);

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
      role="dialog"
      aria-modal="true"
      aria-label={`Stories by ${group.author?.name || "user"}`}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = [...event.currentTarget.querySelectorAll('button:not(:disabled), video[controls], [tabindex="0"]')];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
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
        ref={closeRef}
        onClick={onClose}
        className="btn btn-circle btn-sm absolute right-3 top-7 z-30 border border-base-300 bg-base-100/90 text-base-content shadow-lg backdrop-blur-md hover:bg-base-100 sm:right-4 sm:top-8"
        aria-label="Close story"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        onClick={() => setPaused((value) => !value)}
        className="btn btn-circle btn-sm absolute right-14 top-7 z-30 border-base-300 bg-base-100 text-base-content sm:right-16 sm:top-8"
        aria-label={paused ? "Resume story" : "Pause story"}
        aria-pressed={paused}
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>

      {/* Progress bars */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-base-content/20"
          >
            <div
              key={`${currentStory._id}:${idx}`}
              style={{ animationPlayState: paused || failedMedia === currentStory._id ? "paused" : "running" }}
              className={`h-full bg-primary transition-all duration-100 ${
                idx < currentIndex
                  ? "w-full"
                  : idx === currentIndex && currentStory.mediaType !== "video"
                    ? "animate-[storyProgress_5s_linear_forwards]"
                    : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Author info */}
      <div className="absolute left-3 top-7 z-20 flex max-w-[calc(100%_-_7rem)] items-center gap-2 rounded-xl border border-base-300 bg-base-100/90 px-2.5 py-2 shadow-lg backdrop-blur-md sm:left-4 sm:top-8">
        <UserAvatar
          user={group.author}
          size={32}
          showPresence={false}
          showAdminBadge={false}
        />
        <div className="min-w-0">
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
        disabled={currentIndex === 0}
        aria-label="Previous story"
        className="btn btn-circle absolute left-2 top-1/2 z-30 border-base-300 bg-base-100/90 text-base-content disabled:opacity-30"
      ><ChevronLeft className="h-5 w-5" /></button>
      <button
        onClick={handleNext}
        aria-label={currentIndex === stories.length - 1 ? "Finish stories" : "Next story"}
        className="btn btn-circle absolute right-2 top-1/2 z-30 border-base-300 bg-base-100/90 text-base-content"
      ><ChevronRight className="h-5 w-5" /></button>

      {/* Story content */}
      <div className="flex h-full w-full items-center justify-center bg-base-300/25 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-20 sm:p-4">
        {failedMedia === currentStory._id ? (
          <div role="status" className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center">
            <ImageOff className="mx-auto mb-3 h-8 w-8 text-base-content/60" />
            <p>This story’s media could not be loaded.</p>
            <button className="btn btn-sm btn-outline mt-4" onClick={() => setFailedMedia(null)}>Try again</button>
          </div>
        ) : currentStory.image?.url && currentStory.mediaType === "video" ? (
          <video
            ref={videoRef}
            key={currentStory._id}
            onError={() => setFailedMedia(currentStory._id)}
            src={currentStory.image.url}
            controls
            autoPlay
            playsInline
            onEnded={handleNext}
            className="max-h-[calc(100dvh-7rem)] max-w-full rounded-xl bg-black shadow-2xl sm:max-h-[80vh]"
          />
        ) : currentStory.image?.url ? (
          <img
            key={currentStory._id}
            onError={() => setFailedMedia(currentStory._id)}
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
