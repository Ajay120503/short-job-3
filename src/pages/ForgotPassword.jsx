import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Send,
  CheckCircle2,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import API from "../utils/axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("OTP sent to your email!");
    } catch {
      toast.error("Error sending OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Left Brand Panel — hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 bg-primary opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-8 backdrop-blur-sm">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="w-8 h-8 text-white"
              fontSize={24}
            />
          </div>

          <h1 className="text-4xl font-bold text-white font-heading mb-4">
            ShortJob
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Where Careers Begin
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Connect with people and organizations worldwide
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Discover teaching roles & research opportunities
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Build your career in one place
              </span>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-white/50 text-xs mb-3">Trusted by</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-heading">
                  10,000+
                </p>
                <p className="text-[11px] text-white/50">Members</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-heading">
                  5,000+
                </p>
                <p className="text-[11px] text-white/50">Creators</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-heading">
                  2,000+
                </p>
                <p className="text-[11px] text-white/50">Job Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo — visible only on small screens */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className="w-5 h-5 text-white"
                  fontSize={24}
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold font-heading text-neutral mb-1">
              Reset Password
            </h1>
            <p className="text-sm text-base-content/50">
              {sent
                ? "Check your email for the OTP"
                : "Enter your email to receive an OTP"}
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold font-heading text-neutral mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-base-content/50">
              {sent
                ? "Check your email for the OTP"
                : "Enter your email to receive an OTP"}
            </p>
          </div>

          {/* Form */}
          <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm">
                      Email
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                    <input
                      type="email"
                      className="input input-bordered w-full pl-10 h-11 text-sm focus:ring-2 focus:ring-primary/20"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full h-11 text-sm font-semibold gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send OTP
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-success" />
                </div>
                <p className="text-sm text-base-content/60 mb-6">
                  An OTP has been sent to{" "}
                  <span className="font-medium text-neutral">{email}</span>.
                  Check your inbox to continue.
                </p>
                <Link
                  to="/reset-password"
                  className="btn btn-primary w-full h-11 text-sm font-semibold gap-2"
                >
                  Enter OTP
                </Link>
              </div>
            )}

            <div className="divider text-xs text-base-content/30 my-5">or</div>

            <p className="text-center text-sm text-base-content/50">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>

          {/* Trust indicators — mobile only */}
          <div className="lg:hidden mt-6 flex items-center justify-center gap-4 text-xs text-base-content/30">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Free
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> No ads
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
