import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import useAuthStore from "../store/authStore";
import AuthLayout from "../components/auth/AuthLayout";
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
  const [localError, setLocalError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (email) localStorage.setItem("pendingRegistrationEmail", email);
    inputRefs.current[0]?.focus();
  }, [email]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (otpValue = otp) => {
    const normalizedOtp = String(otpValue).replace(/\D/g, "").slice(0, OTP_LENGTH);
    setLocalError("");
    if (!email) {
      toast.error("Registration email is missing. Please register again.");
      navigate("/register");
      return;
    }
    if (normalizedOtp.length !== OTP_LENGTH) {
      setLocalError("Enter the 6-digit OTP.");
      return;
    }

    clearError();
    setIsLoading(true);
    try {
      await verifyOTP(email, normalizedOtp);
      localStorage.removeItem("pendingRegistrationEmail");
      toast.success("OTP verified successfully!");
      navigate("/complete-profile");
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      setLocalError(message);
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
    setLocalError("");

    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (newOtp.length === OTP_LENGTH) handleSubmit(newOtp);
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
    setLocalError("");
    inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH) - 1]?.focus();
    if (pastedOtp.length === OTP_LENGTH) handleSubmit(pastedOtp);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    setLocalError("");
    try {
      await resendOTP(email);
      toast.success("OTP resent to your email!");
      setResendCooldown(60);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      setLocalError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const activeError = localError || error;

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        <>
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-base-content/75 break-all">
            {email || "your email"}
          </span>
          .
        </>
      }
      badge="One-time verification"
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register again
          </Link>
        </>
      }
    >
      <div className="mb-5 rounded-xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-primary">
        <div className="flex items-center gap-2 font-semibold">
          <Mail className="h-4 w-4" />
          Check your inbox
        </div>
        <p className="mt-1 text-xs text-primary/75">
          Paste the code or type each digit. The form submits automatically when complete.
        </p>
      </div>

      <div className="mb-5 flex items-center justify-center gap-2">
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
            className={`h-12 w-10 rounded-xl border bg-base-100 text-center text-xl font-bold transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-12 ${
              activeError ? "border-error" : "border-base-300"
            }`}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>

      {activeError && (
        <div className="alert alert-error alert-soft mb-4 py-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{activeError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={isLoading || otp.length !== OTP_LENGTH}
        className="btn btn-primary h-11 w-full gap-2 text-sm font-semibold"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Verify & Continue
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-base-content/50">Resend code in {resendCooldown}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="btn btn-ghost btn-sm gap-2 text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            Resend Code
          </button>
        )}
      </div>
    </AuthLayout>
  );
};

export default OtpScreen;
