import useAuthStore from "../../store/authStore";
import { getJobSkillMatch } from "../../utils/jobSkills";

const SkillGapBar = ({ job }) => {
  const { user } = useAuthStore();
  const { requiredSkills, profileTerms, matchedSkills, missingSkills, matchPercent } =
    getJobSkillMatch(job, user);
  if (!user || !requiredSkills.length) return null;

  return (
    <div className="skill-gap-section mt-4 rounded-xl border border-base-300/60 bg-base-200/50 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Job skill match: {matchedSkills.length}/{requiredSkills.length} ({matchPercent}%)
        </p>
        <span className="text-[11px] text-base-content/45">Based on your profile</span>
      </div>
      <progress
        className="progress progress-success w-full"
        value={matchedSkills.length}
        max={requiredSkills.length}
        aria-label={`${matchPercent}% job skill match`}
      />
      <p className="mt-2 text-xs text-base-content/55">
        Compared with your skills, interests, qualifications, focus area, profession, and current position.
      </p>
      {!profileTerms.length && (
        <p className="mt-2 text-xs text-warning">
          Add skills or interests to your profile to calculate an accurate match.
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        {matchedSkills.map((s) => (
          <span key={s} className="badge badge-success badge-sm">
            ✓ {s}
          </span>
        ))}
        {missingSkills.map((s) => (
          <span key={s} className="badge badge-warning badge-outline badge-sm">
            Missing: {s}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillGapBar;
