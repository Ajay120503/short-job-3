import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Briefcase,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;

const OtpScreen = () => {
  const { verifyOTP, resendOTP, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    location.state?.email || localStorage.getItem("pendingRegistrationEmail") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (email) {
      localStorage.setItem("pendingRegistrationEmail", email);
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (otpValue = otp) => {
    const normalizedOtp = String(otpValue).replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!email) {
      toast.error("Registration email is missing. Please register again.");
      navigate("/register");
      return;
    }
    if (normalizedOtp.length !== OTP_LENGTH) return;

    clearError();
    setIsLoading(true);
    try {
      await verifyOTP(email, normalizedOtp);
      localStorage.removeItem("pendingRegistrationEmail");
      toast.success("OTP verified successfully!");
      navigate("/complete-profile");
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit && value) return;

    const next = otp.padEnd(OTP_LENGTH, " ").split("");
    next[index] = digit || "";
    const newOtp = next.join("").replace(/\s/g, "").slice(0, OTP_LENGTH);
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.length === OTP_LENGTH) {
      handleSubmit(newOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedOtp) return;
    setOtp(pastedOtp);
    inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH) - 1]?.focus();

    if (pastedOtp.length === OTP_LENGTH) {
      handleSubmit(pastedOtp);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await resendOTP(email);
      toast.success("OTP resent to your email!");
      setResendCooldown(60);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Left Brand Panel — hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-primary relative flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />

        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-8 backdrop-blur-sm">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="w-8 h-8 text-white"
            />
          </div>

          <h1 className="text-4xl font-bold text-white font-heading mb-4">
            ShortJob
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Where Careers Begin
          </p>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Secure email verification for every account
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Connect with students, teachers, and institutions
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">
                Unlock posts, jobs, stories, and messages
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className="w-5 h-5 text-white"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold font-heading text-neutral mb-1">
              Verify Your Email
            </h1>
            <p className="text-sm text-base-content/50">
              Enter the code sent to your inbox
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold font-heading text-neutral mb-2">
              Verify Your Email
            </h1>
            <p className="text-sm text-base-content/50">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-base-content/80 break-all">
                {email || "your email"}
              </span>
            </p>
          </div>

          {email && (
            <div className="lg:hidden mb-4 rounded-xl bg-primary/10 text-primary px-4 py-3 text-xs font-medium text-center break-all">
              {email}
            </div>
          )}

          <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              One-time verification
            </div>

            {/* OTP Input */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-10 h-12 text-center text-xl font-bold rounded-xl border border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors bg-base-100"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-error text-center mb-4">{error}</p>
            )}

            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || otp.length !== OTP_LENGTH}
              className="btn btn-primary w-full h-11 text-sm font-semibold mb-4"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-base-content/50">
                  Resend in {resendCooldown}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="btn btn-ghost btn-sm gap-2 text-primary"
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Resend Code
                </button>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-base-content/50 hover:text-base-content/80"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpScreen;
