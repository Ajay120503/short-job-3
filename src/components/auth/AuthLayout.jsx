import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, MessageCircle, MapPin } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import Brand from "../common/Brand";

export default function AuthLayout({ title, subtitle, badge = "ShortJob account", children, footer, panelClassName = "max-w-md" }) {
  return (
    <div className="auth-layout min-h-dvh bg-base-200 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between bg-[#123a3d] p-10 text-white lg:flex xl:p-16">
        <Link to="/" className="w-fit"><Brand size="lg" inverse /></Link>
        <div className="my-16 max-w-md">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9fdfd9]">Room for your next chapter</p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">A little time.<br />A lot of possibility.</h2>
          <p className="mt-6 text-base leading-7 text-white/75">Bring your skills to the right opportunity. Find flexible work and people worth connecting with.</p>
          <div className="mt-10 space-y-5">{[
            [MapPin, "Opportunities near you", "Local jobs and remote possibilities."],
            [Briefcase, "Work around your life", "A few hours, a weekend, or a short project."],
            [MessageCircle, "A real conversation", "Connect with the people behind the opportunity."],
          ].map(([Icon, heading, text]) => <div key={heading} className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[#9fdfd9]"><Icon size={19} /></span><div><p className="text-sm font-semibold">{heading}</p><p className="mt-1 text-xs leading-5 text-white/65">{text}</p></div></div>)}</div>
        </div>
        <p className="border-t border-white/15 pt-6 text-xs text-white/60">Find work. Meet people. Move forward.</p>
      </aside>
      <main className="flex min-w-0 flex-col px-4 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-base-content/65 hover:text-primary"><ArrowLeft size={16} /> Back to home</Link><ThemeToggle compact /></div>
        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className={`w-full ${panelClassName}`}>
            <Link to="/" className="mb-7 inline-flex lg:hidden"><Brand size="md" /></Link>
            <div className="mb-7"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{badge}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-base-content/65">{subtitle}</p></div>
            <div className="auth-form-panel rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-7">{children}</div>
            {footer && <div className="mt-6 text-center text-sm leading-6 text-base-content/65">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
