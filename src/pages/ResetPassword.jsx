import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import API from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";
import toast from "../utils/toast";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResetPassword = () => {
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const updateField = (field, value) => {
    const nextValue = field === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: "", form: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const email = form.email.trim().toLowerCase();
    if (!email || !emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (form.otp.length !== 6) {
      nextErrors.otp = "Enter the 6-digit OTP.";
    }
    if (!form.newPassword || form.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email: form.email.trim().toLowerCase(),
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid OTP or error resetting password.";
      setErrors((prev) => ({ ...prev, form: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your reset OTP and choose a new password for your account."
      badge="Password recovery"
      footer={
        <>
          Did not receive an OTP?{" "}
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Resend code
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={Mail}
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="your@email.com"
          error={errors.email}
          autoComplete="email"
        />
        <AuthInput
          icon={ShieldCheck}
          label="OTP"
          value={form.otp}
          onChange={(value) => updateField("otp", value)}
          placeholder="6-digit OTP"
          error={errors.otp}
          inputMode="numeric"
          maxLength={6}
        />
        <AuthInput
          icon={Lock}
          label="New password"
          type={showPassword ? "text" : "password"}
          value={form.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          placeholder="At least 6 characters"
          error={errors.newPassword}
          autoComplete="new-password"
          action={
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/35 hover:text-base-content/70"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {errors.form && (
          <div className="alert alert-error alert-soft py-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.form}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary h-11 w-full gap-2 text-sm font-semibold"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Reset Password
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

const AuthInput = ({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  action,
  type = "text",
  ...props
}) => (
  <div className="form-control">
    <label className="label pb-1">
      <span className="label-text text-sm font-medium">{label}</span>
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/35" />
      <input
        type={type}
        className={`input input-bordered h-11 w-full pl-10 text-sm focus:ring-2 focus:ring-primary/20 ${
          action ? "pr-10" : ""
        } ${error ? "input-error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        {...props}
      />
      {action}
    </div>
    {error && <p className="mt-1 text-xs font-medium text-error">{error}</p>}
  </div>
);

export default ResetPassword;
