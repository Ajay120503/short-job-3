import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Mail, Send } from "lucide-react";
import API from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";
import toast from "react-hot-toast";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email: normalizedEmail });
      setSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      const message = err.response?.data?.message || "Error sending OTP.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle={
        sent
          ? "Your reset code is ready. Continue to set a new password."
          : "Enter your account email and we will send a reset OTP."
      }
      badge="Account recovery"
      footer={
        <>
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-sm font-medium">Email</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/35" />
              <input
                type="email"
                className={`input input-bordered h-11 w-full pl-10 text-sm focus:ring-2 focus:ring-primary/20 ${
                  error ? "input-error" : ""
                }`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
            {error && <p className="mt-1 text-xs font-medium text-error">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary h-11 w-full gap-2 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send OTP
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm leading-6 text-base-content/60">
            An OTP has been sent to{" "}
            <span className="font-semibold text-base-content break-all">{email}</span>.
          </p>
          <Link to="/reset-password" className="btn btn-primary mt-5 h-11 w-full text-sm font-semibold">
            Enter OTP
          </Link>
        </div>
      )}

      {error && sent && (
        <div className="alert alert-error alert-soft mt-4 py-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
