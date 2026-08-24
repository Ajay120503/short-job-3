import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
  Search,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeGraduateIcon from "../components/common/FontAwesomeGraduateIcon";

const Landing = () => {
  const features = [
    {
      icon: Users,
      title: "Connect & Network",
      desc: "Build your professional network with job seekers, job creators, and organizations worldwide.",
      color: "primary",
      bg: "bg-primary/10",
      textColor: "text-primary",
    },
    {
      icon: Briefcase,
      title: "Find Opportunities",
      desc: "Discover teaching jobs, internships, and research roles posted by verified institutions.",
      color: "accent",
      bg: "bg-accent/10",
      textColor: "text-accent",
    },
    {
      icon: FontAwesomeGraduateIcon,
      title: "Grow Your Career",
      desc: "Share achievements, get noticed by recruiters, and advance your career.",
      color: "secondary",
      bg: "bg-secondary/10",
      textColor: "text-secondary",
    },
  ];

  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Create Profile",
      desc: "Sign up as a job seeker or creator and build your profile in minutes.",
    },
    {
      step: "02",
      icon: MessageCircle,
      title: "Connect & Explore",
      desc: "Follow peers, browse posts, search for opportunities, and grow your network.",
    },
    {
      step: "03",
      icon: TrendingUp,
      title: "Apply & Grow",
      desc: "Apply to jobs, chat with connections, and track your career growth.",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <FontAwesomeIcon
                icon={faUserGraduate}
                className="w-5 h-5 text-white"
              />
            </div>
            <span className="text-lg font-bold text-primary font-heading tracking-tight">
              ShortJob
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm font-medium">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.02] -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-8">
            <Star className="w-3.5 h-3.5 fill-current" />
            Professional Social Network
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-heading text-neutral leading-[1.1] mb-6">
            Where <span className="text-primary">Careers Begin</span>
          </h1>
          <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect job seekers with job creaters, find teaching roles, and
            build your professional network — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn btn-primary btn-lg gap-2.5 shadow-sm px-8 text-base"
            >
              <FontAwesomeIcon icon={faUserGraduate} className="w-5 h-5" /> Join
              as Job Seeker
            </Link>
            <Link
              to="/register"
              className="btn btn-outline btn-lg gap-2.5 px-8 text-base"
            >
              <Users className="w-5 h-5" /> Join as Job Creater
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-base-content/40">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" /> No ads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" /> Secure &
              verified
            </span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-primary">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "10,000+", label: "Job Seekers" },
            { value: "5,000+", label: "Job creater" },
            { value: "2,000+", label: "Job Posts" },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold font-heading text-white">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
              <Sparkles className="w-3 h-3" />
              Simple 3-step process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-base-content/50 max-w-xl mx-auto">
              Get started in three simple steps and unlock your
              potential.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative group">
                  <div className="card bg-base-100 border border-base-300/50 p-8 text-center hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary/50 uppercase tracking-wider mb-2">
                      Step {s.step}
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-3">
                      {s.title}
                    </h3>
                    <p className="text-base-content/50 leading-relaxed text-sm">
                      {s.desc}
                    </p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-base-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Everything You <span className="text-primary">Need</span>
            </h2>
            <p className="text-base-content/50 max-w-xl mx-auto">
              Powerful tools designed for a growing professional community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="card bg-base-100 border border-base-300/50 shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 ${feat.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}
                  >
                    <Icon className={`w-8 h-8 ${feat.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-base-content/50 leading-relaxed text-sm">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-primary border-0 p-10 md:p-14 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Ready to Begin?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of job seekers and job creaters already building
              their future on ShortJob.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="btn bg-white text-primary hover:bg-white/90 border-0 btn-lg gap-2.5 px-10 text-base shadow-sm"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="btn btn-ghost text-white hover:bg-white/10 btn-lg gap-2.5 px-10 text-base"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300/50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className="w-4 h-4 text-white"
                />
              </div>
              <span className="font-bold font-heading text-base-content">
                ShortJob
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-base-content/40">
              <Link
                to="/login"
                className="hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hover:text-primary transition-colors"
              >
                Register
              </Link>
            </div>
            <p className="text-sm text-base-content/30">
              © 2026 ShortJob. Where Careers Begin.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
