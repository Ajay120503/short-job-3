import { Camera, LocateFixed, ShieldCheck, RotateCcw } from "lucide-react";
import { captureLoginAudit } from "./CameraCapture";

const REQUIRED_PERMISSION_MESSAGE =
  "Location and camera access are required to sign in while this security feature is enabled. Please allow both and try again.";

const LoginAuditModal = ({ isOpen, loading, error, onCapture, onError, onCancel }) => {
  if (!isOpen) return null;

  const handleCapture = async () => {
    try {
      const result = await captureLoginAudit();
      await onCapture(result);
    } catch {
      onError?.(REQUIRED_PERMISSION_MESSAGE);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg border border-base-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">
              Security Verification Required
            </h3>
            <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
              For account security, ShortJob verifies your location and takes a
              photo at sign-in while this feature is enabled by your
              institution's admin.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-base-300 bg-base-200/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <LocateFixed className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-base-content/60">
              Browser location permission is required for this sign-in.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Camera className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-base-content/60">
              Camera permission is required for one photo frame only. The camera
              stream stops immediately after capture.
            </p>
          </div>
        </div>

        <p className="text-xs text-base-content/50 mt-4 leading-relaxed">
          This is used only for login security records. It is visible to you and
          platform admins, never shown to other users.
        </p>

        {error && (
          <div className="alert alert-error alert-soft mt-4 text-sm">
            {error}
          </div>
        )}

        <div className="modal-action flex-col sm:flex-row sm:items-center">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            disabled={loading}
          >
            Back to login
          </button>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={handleCapture}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : error ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {error ? "Try Again" : "Allow Location & Camera"}
          </button>
        </div>

        <p className="text-[11px] text-base-content/40 mt-3">
          By continuing, you agree to this verification for this sign-in.
        </p>
      </div>
    </div>
  );
};

export default LoginAuditModal;
