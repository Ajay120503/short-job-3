import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import AuthLayout from "../components/auth/AuthLayout";
import toast from "react-hot-toast";

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
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {errors.form && (
          <div className="alert alert-error alert-soft py-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.form}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary h-11 w-full gap-2 text-sm font-semibold"
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

export default Register;
