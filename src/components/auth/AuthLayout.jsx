import { Link } from "react-router-dom";
import { Briefcase, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";

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
    <div className="min-h-screen bg-base-100 lg:grid lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
      <aside className="hidden overflow-hidden bg-primary text-primary-content lg:flex">
        <div className="relative flex min-h-screen w-full flex-col justify-between p-10 xl:p-14">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <FontAwesomeIcon icon={faUserGraduate} className="h-6 w-6" />
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

          <div className="relative max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
              Fast, secure, professional
            </div>
            <h1 className="text-4xl font-bold leading-tight font-heading xl:text-5xl">
              Build your network and manage opportunities with confidence.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/72">
              ShortJob brings profiles, hiring posts, applications, stories, and
              messages into a focused professional workspace.
            </p>
            <div className="mt-8 space-y-3">
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
          </div>

          <div className="relative grid grid-cols-3 gap-3 border-t border-white/12 pt-6 text-center">
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

      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className={`w-full ${panelClassName}`}>
          <div className="mb-7 text-center lg:text-left">
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2.5 lg:hidden"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20">
                <FontAwesomeIcon icon={faUserGraduate} className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold font-heading text-neutral">
                ShortJob
              </span>
            </Link>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {badge}
            </div>
            <h1 className="text-3xl font-bold font-heading text-neutral">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              {subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm sm:p-6">
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
