import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Users,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import API from "../utils/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch {
      toast.error("Invalid OTP or error resetting password.");
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
          <p className="text-lg text-white/70 mb-10">Where Careers Begin</p>

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
              <span className="text-sm">Build your career in one place</span>
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
                  className="w-8 h-8 text-white"
                  fontSize={24}
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold font-heading text-neutral mb-1">
              Enter New Password
            </h1>
            <p className="text-sm text-base-content/50">
              Enter the OTP sent to your email
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold font-heading text-neutral mb-2">
              Enter New Password
            </h1>
            <p className="text-sm text-base-content/50">
              Enter the OTP sent to your email
            </p>
          </div>

          {/* Form */}
          <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">Email</span>
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

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">OTP</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 h-11 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-sm">
                    New Password
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-10 pr-10 h-11 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full h-11 text-sm font-semibold gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Password
              </button>
            </form>

            <div className="divider text-xs text-base-content/30 my-5">or</div>

            <p className="text-center text-sm text-base-content/50">
              Didn't receive an OTP?{" "}
              <Link
                to="/forgot-password"
                className="text-primary font-semibold hover:underline"
              >
                Resend
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

export default ResetPassword;
