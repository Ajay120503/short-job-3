import { useRef, useState } from "react";
import API from "../../utils/axios";

const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageReaction = ({ messageId, reactions, isOwnMessage = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [openBelow, setOpenBelow] = useState(false);
  const triggerRef = useRef(null);

  const togglePicker = () => {
    if (!showPicker) {
      const bounds = triggerRef.current?.getBoundingClientRect();
      setOpenBelow(Boolean(bounds && bounds.top < 90));
    }
    setShowPicker((open) => !open);
  };

  const grouped = (reactions || []).map((r) => ({
    emoji: r.emoji,
    count: r.reactedBy?.length || 0,
  }));

  const handleReact = async (emoji) => {
    try {
      await API.post(`/chat/messages/${messageId}/react`, { emoji });
      setShowPicker(false);
    } catch {
      /* silently fail */
    }
  };

  return (
    <div className="relative max-w-[calc(100vw-6.5rem)] shrink-0 sm:max-w-full">
      {/* Reaction pills below message */}
      {grouped.length > 0 && (
        <div className="mt-1 flex max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto scrollbar-hide sm:gap-1">
          {grouped.map(({ emoji, count }) => (
            <button
              key={emoji}
              className="flex h-6 min-w-8 flex-none cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-full border border-base-300 bg-base-100 px-1.5 text-[11px] font-medium leading-none shadow-sm transition hover:border-primary/40 hover:bg-primary/10 active:scale-95 sm:h-7 sm:min-w-9 sm:gap-1 sm:px-2 sm:text-xs"
              onClick={() => handleReact(emoji)}
            >
              {emoji} {count}
            </button>
          ))}
          <button
            className="flex size-6 min-h-6 min-w-6 flex-none cursor-pointer items-center justify-center rounded-full border border-base-300 bg-base-100 p-0 text-xs leading-none shadow-sm transition hover:border-primary/40 hover:bg-primary/10 active:scale-95 sm:size-7 sm:min-h-7 sm:min-w-7 sm:text-sm"
            aria-label="Add another reaction"
            ref={triggerRef}
            onClick={togglePicker}
          >
            +
          </button>
        </div>
      )}

      {/* Show + button even without reactions */}
      {grouped.length === 0 && (
        <button
          className="flex size-6 min-h-6 min-w-6 flex-none cursor-pointer items-center justify-center rounded-full border border-base-300 bg-base-100 p-0 text-xs leading-none opacity-60 shadow-sm transition hover:border-primary/40 hover:bg-primary/10 hover:opacity-100 active:scale-95 sm:size-7 sm:min-h-7 sm:min-w-7 sm:text-sm sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Add reaction"
          ref={triggerRef}
          onClick={togglePicker}
        >
          +
        </button>
      )}

      {/* Reaction picker */}
      {showPicker && (
        <div
          className={`absolute z-50 flex w-max max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-0.5 overflow-x-auto rounded-full border border-base-300 bg-base-100 px-1.5 py-1 shadow-xl scrollbar-hide sm:max-w-[calc(100vw-2rem)] sm:px-2 ${
            isOwnMessage ? "right-0" : "left-0"
          } ${openBelow ? "top-full mt-1" : "bottom-full mb-1"}`}
        >
          {ALLOWED_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="flex size-8 min-h-8 min-w-8 flex-none items-center justify-center rounded-full p-0 text-lg leading-none transition-transform hover:scale-110 hover:bg-base-200 active:scale-95 sm:size-9 sm:min-h-9 sm:min-w-9 sm:text-xl"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReaction;
