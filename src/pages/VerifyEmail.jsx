import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import API from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      } catch {
        setStatus("error");
        setMessage("Invalid or expired verification link.");
      }
    };
    verify();
  }, [token]);

  return (
    <AuthLayout
      title="Email verification"
      subtitle={message || "Checking your verification link."}
      badge="Account verification"
    >
      <div className="text-center">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            status === "success"
              ? "bg-success text-success-content"
              : status === "error"
                ? "bg-error text-error-content"
                : "bg-primary text-primary-content"
          }`}
        >
          {status === "loading" && (
            <span className="loading loading-spinner loading-lg"></span>
          )}
          {status === "success" && (
            <CheckCircle className="w-10 h-10" />
          )}
          {status === "error" && <XCircle className="w-10 h-10" />}
        </div>
        <Link
          to={status === "error" ? "/register" : "/complete-profile"}
          className="btn btn-primary w-full"
        >
          {status === "error" ? "Register Again" : "Complete Your Profile"}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
