import { useState } from "react";
import { Zap } from "lucide-react";
import API from "../../utils/axios";
import useAuthStore from "../../store/authStore";
import { canApplyToJobs } from "../../utils/badgeUtils";
import toast from "../../utils/toast";
import { getProfileCompletionStatus } from "../../utils/profileCompletion";

const QuickApplyBtn = ({ jobId, alreadyApplied, onApplied }) => {
  const { user } = useAuthStore();
  const [localApply, setLocalApply] = useState({ jobId: null, applied: false });
  const [loading, setLoading] = useState(false);
  const applied =
    Boolean(alreadyApplied) ||
    (localApply.jobId === jobId && localApply.applied);

  if (!canApplyToJobs(user) || applied) return null;

  const handleQuickApply = async () => {
    if (user?.age == null) return toast.error("Please add your age to continue — you must be 18+ to apply.");
    if (Number(user.age) < 18) return toast.error("You must be 18 or older to apply on ShorJob.");
    const completion = getProfileCompletionStatus(user);
    if (!completion.isComplete) return toast.error(`Complete your profile: ${completion.missingMandatory.join(", ")}`);
    setLoading(true);
    try {
      await API.post(`/jobs/${jobId}/quick-apply`);
      setLocalApply({ jobId, applied: true });
      onApplied?.();
      toast.success("Applied successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Quick apply failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-primary btn-sm gap-1.5"
      onClick={handleQuickApply}
      disabled={loading}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <Zap size={14} />
      )}
      Quick Apply
    </button>
  );
};

export default QuickApplyBtn;
