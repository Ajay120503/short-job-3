import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";

const sizes = {
  sm: { mark: "h-8 w-8 rounded-[10px]", iconShell: "h-5 w-5 rounded-md", icon: "h-3.5 w-3.5", word: "text-[1.05rem]", tagline: "text-[9px]" },
  md: { mark: "h-10 w-10 rounded-xl", iconShell: "h-6 w-6 rounded-lg", icon: "h-4 w-4", word: "text-xl", tagline: "text-[10px]" },
  lg: { mark: "h-12 w-12 rounded-[15px]", iconShell: "h-8 w-8 rounded-[10px]", icon: "h-5 w-5", word: "text-2xl", tagline: "text-[11px]" },
  xl: { mark: "h-16 w-16 rounded-[20px]", iconShell: "h-10 w-10 rounded-xl", icon: "h-7 w-7", word: "text-3xl", tagline: "text-xs" },
};

const Brand = ({
  size = "md",
  inverse = false,
  iconOnly = false,
  showTagline = false,
  className = "",
}) => {
  const style = sizes[size] || sizes.md;
  return (
    <span className={`shortjob-brand inline-flex min-w-0 items-center gap-2.5 ${className}`} aria-label="ShortJob">
      <span className={`shortjob-brand-emblem relative flex shrink-0 items-center justify-center ${style.mark} ${inverse ? "shortjob-brand-emblem-inverse" : "shortjob-brand-mark"}`}>
        <span className={`shortjob-brand-icon-shell flex items-center justify-center ${style.iconShell}`}>
          <FontAwesomeIcon icon={faUserGraduate} className={style.icon} aria-hidden="true" />
        </span>
      </span>
      {!iconOnly && (
        <span className="min-w-0">
          <span className={`shortjob-brand-name block whitespace-nowrap font-heading leading-none ${style.word} ${inverse ? "text-white" : "shortjob-brand-wordmark"}`}>
            <span className="shortjob-brand-name-short">Short</span><span className="shortjob-brand-name-job">Job</span>
          </span>
          {showTagline && (
            <span className={`shortjob-brand-tagline mt-1 block whitespace-nowrap leading-none ${style.tagline} ${inverse ? "text-white/75" : "text-base-content/60"}`}>
              Where careers begin
            </span>
          )}
        </span>
      )}
    </span>
  );
};

export default Brand;
