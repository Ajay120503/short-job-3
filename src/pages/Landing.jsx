import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";

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
  "Build a profile",
  "Post or discover",
  "Apply and chat",
  "Grow with signals",
];

const stats = [
  { value: "24h", label: "login audit retention" },
  { value: "3", label: "content queues" },
  { value: "Live", label: "chat and alerts" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content shadow-sm">
              <FontAwesomeIcon icon={faUserGraduate} className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-bold text-primary">
              ShortJob
            </span>
          </Link>
          <div className="flex items-center gap-2">
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
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:pb-24 lg:pt-36">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#fbfefd_0%,#edf7f6_70%,#fbfefd_100%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="max-w-2xl"
            >
              <motion.div
                variants={fadeUp}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                Professional community, jobs, chat, and moderation
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-heading text-4xl font-extrabold leading-tight text-neutral sm:text-5xl lg:text-6xl"
              >
                Where careers begin and trusted networks grow.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl text-base leading-7 text-base-content/65 sm:text-lg"
              >
                ShortJob brings posts, stories, opportunities, applications,
                realtime chat, and admin review into one focused platform.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link to="/register" className="btn btn-primary btn-lg gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg gap-2">
                  Sign In
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-base-content/55"
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
              className="relative"
            >
              <div className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-xl shadow-primary/10">
                <div className="rounded-lg border border-base-300 bg-base-200/55 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-error" />
                      <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                      <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      Live workspace
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_0.78fr]">
                    <div className="space-y-3">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="rounded-lg border border-primary/20 bg-base-100 p-4"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/15" />
                          <div className="min-w-0 flex-1">
                            <div className="h-3 w-28 rounded bg-neutral/15" />
                            <div className="mt-2 h-2 w-20 rounded bg-primary/20" />
                          </div>
                          <BadgeCheck className="h-5 w-5 text-success" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 rounded bg-base-300" />
                          <div className="h-3 w-4/5 rounded bg-base-300" />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <span className="h-16 rounded bg-primary/10" />
                          <span className="h-16 rounded bg-accent/10" />
                          <span className="h-16 rounded bg-success/10" />
                        </div>
                      </motion.div>

                      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold">
                            Opportunity match
                          </span>
                          <span className="badge badge-success badge-soft badge-sm">
                            86%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-base-300">
                          <motion.div
                            initial={{ width: "18%" }}
                            animate={{ width: "86%" }}
                            transition={{ duration: 1.2, delay: 0.4 }}
                            className="h-full rounded-full bg-success"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity }}
                        className="rounded-lg border border-accent/20 bg-base-100 p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-accent" />
                          <span className="text-sm font-bold">Jobs</span>
                        </div>
                        {[
                          "Product Trainer",
                          "Support Lead",
                          "Content Creator",
                        ].map((role) => (
                          <div
                            key={role}
                            className="mb-2 rounded border border-base-300 bg-base-200/60 px-3 py-2 text-xs font-medium"
                          >
                            {role}
                          </div>
                        ))}
                      </motion.div>

                      <div className="rounded-lg border border-info/20 bg-base-100 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-info" />
                          <span className="text-sm font-bold">Moderation</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between rounded bg-success/10 px-3 py-2 text-success">
                            <span>Approved</span>
                            <span>42</span>
                          </div>
                          <div className="flex items-center justify-between rounded bg-warning/10 px-3 py-2 text-warning">
                            <span>Review</span>
                            <span>8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-base-300 bg-primary px-4 py-8 text-primary-content sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="mx-auto grid max-w-5xl gap-6 text-center sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <div className="font-heading text-3xl font-extrabold">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-primary-content/70">
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
              className="mx-auto mb-12 max-w-2xl text-center"
            >
              <motion.div
                variants={fadeUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
              >
                <Zap className="h-3.5 w-3.5" />
                One connected flow
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl font-bold sm:text-4xl"
              >
                From profile to opportunity without friction.
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={stagger}
              className="grid gap-3 md:grid-cols-4"
            >
              {flowSteps.map((step, index) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="font-heading text-base font-bold">{step}</h3>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-300">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(index + 1) * 25}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: index * 0.08 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </motion.div>
              ))}
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
              className="mb-12 max-w-2xl"
            >
              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl font-bold sm:text-4xl"
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
                    className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
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
            className="mx-auto max-w-4xl rounded-lg border border-primary/20 bg-primary p-8 text-center text-primary-content shadow-xl shadow-primary/15 sm:p-12"
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/12"></div>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Start building your network today.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-content/75">
              Create your profile, share your work, discover opportunities, and
              manage everything from one focused place.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="btn border-0 bg-white text-primary hover:bg-white/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="btn btn-ghost text-white hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-base-300 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-base-content/45 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-content">
              <FontAwesomeIcon icon={faUserGraduate} className="h-4 w-4" />
            </span>
            <span className="font-heading font-bold text-base-content">
              ShortJob
            </span>
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
