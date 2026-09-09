import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  ChevronDown,
  MessageCircle,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import ThemeToggle from "../components/common/ThemeToggle";
import Brand from "../components/common/Brand";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const featureCards = [
  {
    icon: Users,
    title: "People worth connecting with",
    desc: "Share your work, follow your community, and turn everyday conversations into new connections.",
    tone: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: Briefcase,
    title: "Work that fits your day",
    desc: "Find paid opportunities for a few hours, a day, a weekend, or a short-term commitment.",
    tone: "text-accent bg-accent/10 border-accent/20",
  },
  {
    icon: MessageCircle,
    title: "Less back-and-forth",
    desc: "Discuss the details in private chat. Share files, ask questions, and keep your conversations together.",
    tone: "text-info bg-info/10 border-info/20",
  },
  {
    icon: ShieldCheck,
    title: "A more thoughtful community",
    desc: "Content checks and human moderation help review jobs, posts, and stories across the platform.",
    tone: "text-success bg-success/10 border-success/20",
  },
];

const flowSteps = [
  {
    title: "Build a profile",
    detail: "Add your program, skills, and what you're looking for.",
  },
  {
    title: "Post or discover",
    detail: "Share updates, or scan the feed for relevant opportunities.",
  },
  {
    title: "Apply and chat",
    detail: "Apply in a click, then message directly to sort out details.",
  },
  {
    title: "Grow with signals",
    detail: "Track responses, follows, and match strength over time.",
  },
];

const stats = [
  { value: "Flexible", label: "Hours, days, and weekends" },
  { value: "Connected", label: "People, teams, and opportunities" },
  { value: "Together", label: "Applications and conversations" },
];

const questions = [
  ["What kind of jobs can I find?", "ShortJob focuses on paid short jobs: a few hours, one day, a weekend, or short-term work. Each listing includes the schedule and payout so you can decide what fits."],
  ["Can I find opportunities near me?", "Yes. Allow location access to discover nearby jobs and adjust the distance filter. You can manage location access in your settings and also look for remote opportunities."],
  ["Can I use ShortJob to hire people?", "Yes. Create a job with the skills, qualifications, schedule, and payout you need. Review applicants, compare their profiles, and manage applications from your job’s applicant board."],
  ["What do I need to get started?", "Create an account and complete your profile. Add your skills and interests to help you find relevant work, then explore jobs and connect with your community."],
];

const Landing = () => {
  return (
    <MotionConfig reducedMotion="user">
    <div className="landing-page min-h-dvh bg-base-100 text-base-content overflow-x-hidden">
      <a href="#landing-content" className="skip-link">Skip to content</a>
      <nav className="z-app-navigation fixed top-0 left-0 right-0 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Brand size="sm" />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-base-content/65 lg:flex">
            <a href="#how-it-works" className="hover:text-primary">How it works</a>
            <a href="#features" className="hover:text-primary">Why ShortJob</a>
            <a href="#questions" className="hover:text-primary">Questions</a>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm hidden gap-2 sm:inline-flex">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main id="landing-content" tabIndex={-1}>
        <section className="landing-hero relative isolate overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:pb-24 lg:pt-40">
          <div aria-hidden="true" className="landing-hero-glow absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.div
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Small jobs. Real possibilities.
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-heading text-[2.8rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-base-content sm:text-6xl xl:text-7xl"
              >
                Your next move.<br />Your kind of <span className="text-primary">work.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-base leading-7 text-base-content/65 sm:text-lg"
              >
                Find paid short jobs that fit your skills and schedule. Meet your
                next team, build connections, and take the next step—right where you are.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/20"
                >
                  Find your next opportunity
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg gap-2 bg-base-100"
                >
                  I’m hiring
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/55"
              >
                {[
                  "Paid short jobs",
                  "Flexible schedules",
                  "Direct conversations",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </span>
                ))}
              </motion.div>

            </motion.div>

            <div className="landing-preview min-w-0 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl shadow-primary/10 lg:rotate-1">
              <div className="flex items-center gap-1.5 border-b border-base-300 bg-base-200/70 px-5 py-4">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-base-content/20" /><span aria-hidden="true" className="h-2 w-2 rounded-full bg-base-content/15" /><span aria-hidden="true" className="h-2 w-2 rounded-full bg-base-content/10" />
                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-base-content/60"><Sparkles size={12} /> A glimpse of ShortJob</span>
              </div>
              <div className="p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Discover your possibilities</p>
                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">Small commitment.<br />Something new.</h2>
                </div>
                <Briefcase className="h-6 w-6 shrink-0 text-primary" />
              </div>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-base-300 bg-base-200/50 px-3 py-3 text-xs text-base-content/60"><Search size={15} /> Your skills. Your schedule. Your next job.</div>
              <div className="space-y-3">
                {[
                  ["Event Assistant", "Pune · On-site", "Weekend · 2 days", "₹1,800"],
                  ["Workshop Tutor", "Remote", "One day · 4 hours", "₹1,200"],
                  ["Stock Assistant", "Mumbai · On-site", "Short-term · 3 days", "₹2,400"],
                ].map(([title, place, duration, payout]) => (
                  <div key={title} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-colors hover:border-primary/40 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Briefcase size={18} /></span>
                      <div className="min-w-0"><h3 className="text-sm font-bold sm:text-base">{title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-base-content/65"><MapPin size={12} />{place}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-base-300 pt-3"><span className="inline-flex items-center gap-1.5 text-xs text-base-content/65"><CalendarClock size={14} />{duration}</span><span className="text-sm font-bold">{payout}</span></div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-base-content/60">Illustrative opportunities · Sign in to see available jobs</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-base-300 bg-base-200/50 px-4 py-8 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="mx-auto grid max-w-6xl divide-y divide-base-300 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="px-6 py-3 sm:py-0"
              >
                <div className="font-heading text-xl font-bold text-base-content">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-base-content/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              variants={stagger}
              className="mx-auto mb-12 max-w-3xl text-center"
            >
              <motion.div
                variants={fadeUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent"
              >
                <Zap className="h-3.5 w-3.5" />
                One connected flow
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
              >
                A fresh start, in a few simple steps.
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={stagger}
              className="relative"
            >
              <div className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-base-300 md:block" />
              <div className="grid gap-3 md:grid-cols-4">
                {flowSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    variants={fadeUp}
                    className="relative rounded-lg border border-transparent p-3 transition-colors hover:border-base-300 hover:bg-base-200/45"
                  >
                    <div className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-base-100 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <h3 className="font-heading text-base font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-base-content/55">
                      {step.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-base-200/65 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={stagger}
              className="mb-12 max-w-3xl"
            >
              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
              >
                More than a job board.<br />A place to move forward.
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-3 text-base-content/60">
                Find the work. Meet the people. Keep everything connected.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-4 sm:grid-cols-2 lg:gap-6"
            >
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md sm:p-8"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${feature.tone.split(" ")[0].replace("text-", "bg-")}`}
                    />
                    <div
                      className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/60">
                      {feature.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="px-4 pt-20 sm:px-6 lg:pt-24">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">For people building teams</p>
              <h2 className="mt-4 max-w-lg font-heading text-3xl font-bold tracking-tight sm:text-4xl">Short on time?<br />Find your next helping hand.</h2>
              <p className="mt-4 max-w-lg leading-7 text-base-content/65">From a busy weekend to a short project, connect with people whose skills fit the work you need done.</p>
              <Link to="/register" className="btn btn-primary mt-6 w-full gap-2 sm:w-auto">Start hiring <ArrowRight size={16} /></Link>
            </div>
            <div className="space-y-3">
              {[
                [Briefcase, "Make the details clear", "Set the schedule, required skills, and payout."],
                [Users, "Find your fit", "Review applicant profiles against your job requirements."],
                [MessageCircle, "Keep things moving", "Manage applicants on your board and discuss the next steps."],
              ].map(([Icon, title, detail]) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={19} /></span>
                  <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-base-content/60">{detail}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="questions" className="scroll-mt-20 px-4 pt-20 sm:px-6 lg:pt-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Good to know</p>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">A few questions.<br />A little clarity.</h2>
              <p className="mt-4 leading-7 text-base-content/60">Get to know ShortJob before your next move.</p>
            </div>
            <div className="divide-y divide-base-300 border-y border-base-300">
              {questions.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
                    {question}<ChevronDown size={18} className="shrink-0 text-primary transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 pr-6 text-sm leading-7 text-base-content/65">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="landing-cta-panel mx-auto max-w-7xl rounded-3xl border border-primary/25 p-7 text-center shadow-xl shadow-primary/15 sm:p-16"
          >
            <Brand size="lg" inverse iconOnly className="mb-5" />
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              A little time. A new possibility.
            </h2>
            <p className="landing-cta-copy mx-auto mt-3 max-w-xl">
              Your next opportunity could start with a simple hello.
              Create your profile and see where it takes you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn landing-cta-primary border-0">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn btn-ghost landing-cta-secondary">
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-base-300 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-base-content/45 sm:flex-row">
          <div className="flex items-center gap-2">
            <Brand size="sm" />
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-primary">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-primary">
              Register
            </Link>
          </div>
          <p>© 2026 ShortJob. Where Careers Begin.</p>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
};

export default Landing;
