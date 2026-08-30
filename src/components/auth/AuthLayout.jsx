import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "../common/ThemeToggle";

const highlights = [
  {
    icon: Users,
    text: "Connect with people, teams, and organizations in one network.",
  },
  {
    icon: Briefcase,
    text: "Find opportunities, applicants, posts, stories, and messages faster.",
  },
  {
    icon: ShieldCheck,
    text: "Protected account flows with OTP and optional login security audit.",
  },
];

const AuthLayout = ({
  title,
  subtitle,
  badge = "ShortJob account",
  children,
  footer,
  panelClassName = "max-w-md",
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 lg:grid lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
      <div className="absolute right-4 top-4 z-20 sm:right-6">
        <ThemeToggle />
      </div>
      <aside className="public-brand-panel hidden overflow-hidden lg:flex">
        <div className="relative flex min-h-screen w-full flex-col justify-between p-10 xl:p-14">
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className="h-6 w-6 text-white"
                />
              </span>
              <span>
                <span className="block text-xl font-bold font-heading">
                  ShortJob
                </span>
                <span className="block text-xs text-white/65">
                  Where careers begin
                </span>
              </span>
            </Link>
          </div>

          <div className="relative max-w-[34rem]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
              Fast, secure, professional
            </div>
            <h1 className="font-heading text-3xl font-bold leading-tight xl:text-5xl">
              Build your network and manage opportunities with confidence.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/72">
              ShortJob brings profiles, hiring posts, applications, stories, and
              messages into a focused professional workspace.
            </p>
            <div className="mt-7 space-y-3">
              {highlights.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 text-sm text-white/82"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="leading-6">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-white/12 bg-white/10 p-4 shadow-xl shadow-black/10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Live workspace
                  </p>
                  <p className="font-heading text-lg font-bold">
                    Today on ShortJob
                  </p>
                </div>
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                {[
                  [Briefcase, "4 strong job matches"],
                  [MessageCircle, "2 active conversations"],
                  [ShieldCheck, "Content review protected"],
                ].map(([Icon, text]) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/82 ring-1 ring-white/10"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3 border-t border-white/12 pt-5 text-center">
            {[
              ["Secure", "OTP"],
              ["Live", "Jobs"],
              ["Active", "Network"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
        <div className={`w-full ${panelClassName}`}>
          <div className="mb-5 text-center sm:mb-7 lg:text-left">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2.5 rounded-2xl border border-base-300 bg-base-100 px-3 py-2 shadow-sm sm:mb-5 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 sm:h-11 sm:w-11 sm:rounded-2xl">
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className="h-5 w-5 text-white"
                />
              </span>
              <span className="text-lg font-bold font-heading text-base-content">
                ShortJob
              </span>
            </Link>
            <div className="mb-3 ml-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {badge}
            </div>
            <h1 className="font-heading text-2xl font-bold text-base-content sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              {subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-base-300/70 bg-base-100 p-4 shadow-xl shadow-primary/5 sm:p-6">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-base-content/55">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
