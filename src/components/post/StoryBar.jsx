import { useState, useEffect, useCallback } from "react";
import { Clock3, Plus } from "lucide-react";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import StoryViewer from "./StoryViewer";
import UserAvatar from "../common/UserAvatar";
import { canCreateStories } from "../../utils/badgeUtils";
import UserSignalBadge from "../common/UserSignalBadge";
import { getUserSignal } from "../../utils/userSignals";

const StoryBar = ({ onAddStory }) => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState(null);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await API.get("/stories");
      setStories(data.stories || []);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadStories = async () => {
      try {
        const { data } = await API.get("/stories");
        if (isMounted) setStories(data.stories || []);
      } catch {
        /* silently fail */
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStories();
    return () => {
      isMounted = false;
    };
  }, []);

  const canPost = canCreateStories(user);

  if (loading) {
    return (
      <div className="flex gap-3 mb-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-full skeleton flex-shrink-0"
          ></div>
        ))}
      </div>
    );
  }

  if (!canPost && stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4">
        {/* Add story button */}
        {canPost && (
          <button
            onClick={onAddStory}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-base-200 border-2 border-dashed border-base-300 flex items-center justify-center hover:border-primary transition-colors">
              <Plus className="w-5 h-5 text-base-content/40" />
            </div>
            <span className="text-[10px] text-base-content/50">Your Story</span>
          </button>
        )}

        {stories.map((group) => {
          const unseenStories = group.stories.filter(
            (s) => !s.viewers?.includes(user?._id)
          );
          const hasUnseen = unseenStories.length > 0;
          const ownGroup = group.author?._id === user?._id;
          const hasPending =
            ownGroup &&
            group.stories.some((story) => story.status === "pending_review");
          const hasRejected =
            ownGroup &&
            group.stories.some((story) => story.status === "rejected");
          const signal = getUserSignal(group.author);
          const isAdmin = signal?.key === "admin";

          return (
            <button
              key={group.author._id}
              onClick={() => setViewingStory(group)}
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 ${
                  isAdmin
                    ? "bg-neutral"
                    : hasUnseen
                      ? "bg-primary"
                      : "bg-base-300"
                }`}
              >
                <div className="w-full h-full rounded-full bg-base-100 overflow-hidden border-2 border-base-100 flex items-center justify-center">
                  {group.author?.institutionPic?.url ? (
                    <img
                      src={group.author.institutionPic.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserAvatar
                      user={group.author}
                      size={60}
                      showPresence={false}
                    />
                  )}
                </div>
                {(hasPending || hasRejected) && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full shadow-sm ring-2 ring-base-100 ${
                      hasPending
                        ? "bg-warning text-warning-content"
                        : "bg-error text-error-content"
                    }`}
                    style={{ width: 18, height: 18 }}
                    title={hasPending ? "Under review" : "Not approved"}
                  >
                    <Clock3 className="w-3 h-3" />
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] line-clamp-1 max-w-[64px] ${
                  isAdmin
                    ? "font-semibold text-neutral"
                    : "text-base-content/50"
                }`}
              >
                {group.author?.institutionName || group.author?.name}
              </span>
              <UserSignalBadge
                user={group.author}
                className="max-w-[64px] line-clamp-1"
              />
            </button>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <StoryViewer
          group={viewingStory}
          onClose={() => setViewingStory(null)}
          onViewed={fetchStories}
        />
      )}
    </>
  );
};

export default StoryBar;
