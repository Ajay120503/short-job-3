import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import toast from "../utils/toast";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { initiateRegister } = useAuthStore();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "", form: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (form.name.trim().length > 100) nextErrors.name = "Name is too long.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (form.email && !emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) nextErrors.password = "Password is required.";
    if (form.password && form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const passwordChecks = [
    { label: "6+ characters", passed: form.password.length >= 6 },
    { label: "Has a letter", passed: /[a-z]/i.test(form.password) },
    { label: "Has a number", passed: /\d/.test(form.password) },
  ];
  const passwordScore = passwordChecks.filter((check) => check.passed).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      await initiateRegister(payload);
      localStorage.setItem("pendingRegistrationEmail", payload.email);
      toast.success("OTP sent to your email! Please verify to continue.");
      navigate("/otp-verify", { state: { email: payload.email } });
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setErrors((prev) => ({ ...prev, form: message }));
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start your profile, network, jobs, posts, and messages in one place."
      badge="Free account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="rounded-xl border border-primary/15 bg-primary/8 px-3 py-2.5 text-xs leading-5 text-base-content/70 sm:px-3.5 sm:py-3 sm:text-sm">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Create once, then complete your profile later or start exploring
              jobs, posts, stories, and people right away.
            </p>
          </div>
        </div>

        <AuthInput
          icon={User}
          label="Full name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Your name"
          error={errors.name}
          autoComplete="name"
        />
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
          icon={Lock}
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(value) => updateField("password", value)}
          placeholder="At least 6 characters"
          error={errors.password}
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

        {form.password && (
          <div className="rounded-xl border border-base-300 bg-base-200/45 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-base-content/60">
                Password strength
              </span>
              <span
                className={`font-bold ${
                  passwordScore >= 3
                    ? "text-success"
                    : passwordScore >= 2
                      ? "text-warning"
                      : "text-error"
                }`}
              >
                {passwordScore >= 3
                  ? "Strong"
                  : passwordScore >= 2
                    ? "Okay"
                    : "Weak"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index < passwordScore
                      ? passwordScore >= 3
                        ? "bg-success"
                        : passwordScore >= 2
                          ? "bg-warning"
                          : "bg-error"
                      : "bg-base-300"
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    check.passed
                      ? "bg-success/10 text-success"
                      : "bg-base-100 text-base-content/45"
                  }`}
                >
                  {check.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {errors.form && (
          <div className="alert alert-error alert-soft py-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.form}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary h-11 w-full gap-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 sm:h-12"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              Create Account <ArrowRight className="h-4 w-4" />
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
        className={`input input-bordered h-11 w-full rounded-xl pl-10 text-sm focus:ring-2 focus:ring-primary/20 sm:h-12 ${
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

export default Register;
