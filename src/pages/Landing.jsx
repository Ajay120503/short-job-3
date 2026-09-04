import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  MapPin,
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
    title: "Social Network",
    desc: "Posts, comments, follows, stories, saved posts, and profile signals in one connected feed.",
    tone: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    desc: "Create jobs, apply quickly, review applicants, ask questions, and track application status.",
    tone: "text-accent bg-accent/10 border-accent/20",
  },
  {
    icon: MessageCircle,
    title: "Realtime Chat",
    desc: "Private conversations with typing indicators, read receipts, media messages, and clean confirmations.",
    tone: "text-info bg-info/10 border-info/20",
  },
  {
    icon: ShieldCheck,
    title: "Smart Moderation",
    desc: "Rule-based fake detection runs beside manual review for posts, jobs, and stories.",
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
  { value: "24h", label: "audit retention" },
  { value: "3", label: "review queues" },
  { value: "Live", label: "chat and alerts" },
];

const trustItems = [
  "Public posts and stories",
  "Job matching",
  "Applicant kanban",
  "Admin review",
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Brand size="md" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pb-28 lg:pt-40">
          <div className="absolute inset-0 -z-10 bg-base-100" />
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
                Professional network, jobs, chat & review
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-heading text-4xl font-extrabold leading-[1.06] tracking-tight text-base-content sm:text-5xl lg:text-6xl"
              >
                A smarter way to build your network and manage work.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-base leading-7 text-base-content/65 sm:text-lg"
              >
                ShortJob brings public posts, stories, jobs, applications,
                realtime chat, and trusted review into one modern workspace.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/20"
                >
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg gap-2 bg-base-100"
                >
                  Sign In
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/55"
              >
                {[
                  "Free to start",
                  "Realtime alerts",
                  "Verified trust tools",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </span>
                ))}
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-2"
              >
                {trustItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-base-300 bg-base-200/70 px-3 py-1 text-xs font-semibold text-base-content/55"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Signature hero visual: a fanned stack of real product moments,
               instead of a generic browser-chrome dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.1 }}
              className="group relative mx-auto w-full max-w-md space-y-3 sm:h-[470px] sm:max-w-lg sm:space-y-0 lg:mx-0 lg:ml-auto lg:h-[520px] lg:max-w-xl"
            >
              <div className="absolute inset-x-8 bottom-2 top-0 hidden rounded-[2rem] border border-base-300 bg-base-200/70 shadow-2xl shadow-primary/10 transition-all duration-500 ease-out sm:block lg:inset-x-10 lg:bottom-4 lg:top-2 lg:group-hover:inset-x-2 lg:group-hover:bottom-0 lg:group-hover:top-0" />
              <div className="relative rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl transition-all duration-500 ease-out sm:absolute sm:inset-x-14 sm:bottom-9 sm:top-8 sm:rounded-[1.5rem] sm:p-4 lg:inset-x-16 lg:bottom-14 lg:top-12 lg:group-hover:inset-x-8 lg:group-hover:bottom-16 lg:group-hover:top-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Today
                    </p>
                    <p className="font-heading text-lg font-bold">
                      Opportunity Feed
                    </p>
                  </div>
                  <span className="badge badge-primary badge-soft">12 new</span>
                </div>
                <div className="space-y-3">
                  {[
                    ["Senior Coordinator", "Pune · Hybrid", "92%"],
                    ["Content Associate", "Remote", "86%"],
                    ["Operations Lead", "Mumbai", "78%"],
                  ].map(([title, place, match]) => (
                    <div
                      key={title}
                      className="rounded-xl border border-base-300/70 bg-base-200/45 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{title}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-base-content/45">
                            <MapPin className="h-3 w-3" />
                            {place}
                          </p>
                        </div>
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                          {match}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative rounded-xl border border-info/20 bg-base-100 p-3 shadow-lg transition-all duration-500 ease-out sm:absolute sm:left-0 sm:top-8 sm:w-[70%] sm:-rotate-3 sm:p-4 lg:-left-4 lg:top-4 lg:w-[66%] lg:group-hover:-left-16 lg:group-hover:-top-2 lg:group-hover:-rotate-6"
              >
                <div className="mb-3 flex items-center gap-2 text-info">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">
                    Chat
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="ml-auto w-3/4 rounded-lg rounded-tr-sm bg-info/15 px-3 py-2 text-xs">
                    Are you free for a quick call about the role?
                  </div>
                  <div className="w-2/3 rounded-lg rounded-tl-sm bg-base-200 px-3 py-2 text-xs">
                    Yes — 4pm works for me.
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="relative rounded-xl border border-accent/20 bg-base-100 p-3 shadow-lg transition-all duration-500 ease-out sm:absolute sm:right-0 sm:top-40 sm:w-[74%] sm:rotate-2 sm:p-4 lg:-right-2 lg:top-44 lg:w-[70%] lg:group-hover:-right-16 lg:group-hover:top-36 lg:group-hover:rotate-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      Opportunity
                    </span>
                  </div>
                  <span className="badge badge-success badge-soft badge-sm">
                    86% match
                  </span>
                </div>
                <p className="text-sm font-bold">Campus Content Lead</p>
                <p className="mt-1 text-xs text-base-content/55">
                  Student Affairs Office · Part-time
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-300">
                  <motion.div
                    initial={{ width: "12%" }}
                    animate={{ width: "86%" }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    className="h-full rounded-full bg-success"
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="relative rounded-xl border border-primary/20 bg-base-100 p-3 shadow-lg transition-all duration-500 ease-out sm:absolute sm:left-5 sm:top-[21rem] sm:w-[76%] sm:-rotate-1 sm:p-4 sm:shadow-xl lg:left-3 lg:top-[23rem] lg:w-[72%] lg:group-hover:-left-10 lg:group-hover:top-[24rem] lg:group-hover:-rotate-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/15" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-24 rounded bg-neutral/15" />
                    <div className="mt-1.5 h-2 w-16 rounded bg-primary/20" />
                  </div>
                  <BadgeCheck className="h-5 w-5 shrink-0 text-success" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-base-content/55">
                  <Users className="h-3.5 w-3.5" />
                  248 connections · 12 mutual
                </span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="relative rounded-xl border border-success/20 bg-base-100 p-3 shadow-lg transition-all duration-500 ease-out sm:absolute sm:right-4 sm:bottom-5 sm:w-[62%] lg:-right-2 lg:bottom-8 lg:group-hover:-right-14 lg:group-hover:bottom-1"
              >
                <div className="flex items-center gap-2 text-success">
                  <FileCheck2 className="h-4 w-4" />
                  <span className="text-xs font-bold">
                    Application reviewed
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-base-content/50">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Interview slot shared in chat
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-base-300 bg-primary px-4 py-9 text-primary-content sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="mx-auto grid max-w-4xl divide-y divide-white/15 text-center text-white sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="px-6 py-3 sm:py-0"
              >
                <div className="font-heading text-3xl font-extrabold">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-white/80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:py-24">
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
                From profile to opportunity without friction.
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

        <section className="bg-base-200/65 px-4 py-20 sm:px-6 lg:py-24">
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
                Built for active communities.
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-3 text-base-content/60">
                Every core screen works together, from social discovery to admin
                trust controls.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    className="group relative overflow-hidden rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${feature.tone.split(" ")[0].replace("text-", "bg-")}`}
                    />
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded border ${feature.tone}`}
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

        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
            className="landing-cta-panel mx-auto max-w-4xl rounded-xl border border-primary/25 p-8 text-center shadow-xl shadow-primary/15 sm:p-12"
          >
            <Brand size="lg" inverse iconOnly className="mb-5" />
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Start building your network today.
            </h2>
            <p className="landing-cta-copy mx-auto mt-3 max-w-xl">
              Create your profile, share your work, discover opportunities, and
              manage everything from one focused place.
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
  );
};

export default Landing;
