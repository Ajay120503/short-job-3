import { ThumbsUp } from "lucide-react";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const EndorsementTag = ({ skill, profileId, onEndorse }) => {
  const { user } = useAuthStore();
  const isOwnProfile = user?._id === profileId;

  if (isOwnProfile) {
    return (
      <span className="badge badge-outline badge-sm gap-1">
        {skill.name || skill}
      </span>
    );
  }

  const handleEndorse = async () => {
    try {
      const skillName = skill.name || skill;
      const { data } = await API.post(
        `/users/${profileId}/skills/${encodeURIComponent(skillName)}/endorse`
      );
      if (onEndorse) onEndorse(skillName, data);
      toast.success(data.endorsed ? "Endorsed!" : "Endorsement removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to endorse");
    }
  };

  return (
    <button
      onClick={handleEndorse}
      className="badge badge-outline badge-sm gap-1 cursor-pointer hover:badge-primary transition-all"
    >
      {skill.name || skill}
      <ThumbsUp className="w-3 h-3" />
    </button>
  );
};

export default EndorsementTag;
