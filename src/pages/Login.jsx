import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import LoginAuditModal from "../components/auth/LoginAuditModal";
import AuthLayout from "../components/auth/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [auditToken, setAuditToken] = useState("");
  const [auditError, setAuditError] = useState("");
  const [formError, setFormError] = useState("");
  const { login, completeLoginAudit, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }
    try {
      const data = await login(email, password);
      if (data.requiresLoginAudit) {
        setAuditToken(data.tempToken);
        setAuditError("");
        return;
      }
      toast.success("Welcome back!");
      navigate("/feed");
    } catch {
      setFormError("Invalid email or password.");
      toast.error("Invalid email or password.");
    }
  };

  const handleAuditCapture = async ({
    photo,
    lat,
    lng,
    accuracy,
    faceDetected,
    faceCount,
    detector,
    confidence,
    validation,
  }) => {
    setAuditError("");
    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("lat", lat);
      formData.append("lng", lng);
      formData.append("accuracy", accuracy);
      formData.append("faceDetected", faceDetected ? "true" : "false");
      formData.append("faceCount", String(faceCount || 0));
      formData.append("faceDetector", detector || "");
      formData.append("faceConfidence", String(confidence || 0));
      formData.append("faceValidation", validation || "");
      await completeLoginAudit(auditToken, formData);
      toast.success("Welcome back!");
      navigate("/feed");
    } catch (err) {
      setAuditError(
        err.response?.data?.message ||
          "Location and camera access are required to sign in while this security feature is enabled. Please allow both and try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <LoginAuditModal
        isOpen={Boolean(auditToken)}
        loading={isLoading}
        error={auditError}
        onCapture={handleAuditCapture}
        onError={(message) => setAuditError(message)}
        onCancel={() => {
          setAuditToken("");
          setAuditError("");
        }}
      />
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to continue your ShortJob workspace."
        badge="Secure sign in"
        footer={
          <>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create free account
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium text-sm">Email</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
              <input
                type="email"
                className={`input input-bordered w-full pl-10 h-11 text-sm focus:ring-2 focus:ring-primary/20 ${formError ? "input-error" : ""}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError("");
                }}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium text-sm">Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
              <input
                type={showPassword ? "text" : "password"}
                className={`input input-bordered w-full pl-10 pr-10 h-11 text-sm focus:ring-2 focus:ring-primary/20 ${formError ? "input-error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError("");
                }}
                required
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

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {formError && (
            <div className="alert alert-error alert-soft py-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full h-11 text-sm font-semibold gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default Login;
