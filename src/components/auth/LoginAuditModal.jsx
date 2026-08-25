import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  LocateFixed,
  RotateCcw,
  ShieldCheck,
  Video,
} from "lucide-react";
import {
  canvasToLoginPhoto,
  captureCanvasFromVideo,
  detectFaceFromCanvas,
  getPosition,
  getVideoStream,
  stopVideoStream,
} from "./CameraCapture";

const REQUIRED_PERMISSION_MESSAGE =
  "Location, camera access, and a clear face capture are required to sign in while this security feature is enabled.";

const LoginAuditModal = ({ isOpen, loading, error, onCapture, onError, onCancel }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const positionRef = useRef(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [status, setStatus] = useState("");

  const stopCamera = (updateState = true) => {
    stopVideoStream(streamRef.current);
    streamRef.current = null;
    if (updateState) {
      setCameraReady(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLocationReady(false);
      setStatus("");
    }

    return () => stopCamera(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenCamera = async () => {
    stopCamera();
    setPermissionLoading(true);
    setStatus("Requesting location and camera permissions...");
    onError?.("");

    try {
      const position = await getPosition();
      const stream = await getVideoStream();
      positionRef.current = position;
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setLocationReady(true);
      setCameraReady(true);
      setStatus("Camera is ready. Keep your face centered and capture.");
    } catch (err) {
      stopCamera();
      setLocationReady(false);
      setStatus("");
      onError?.(err.message || REQUIRED_PERMISSION_MESSAGE);
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleCapture = async () => {
    setCaptureLoading(true);
    setStatus("Checking for a clear face...");
    onError?.("");

    try {
      const canvas = captureCanvasFromVideo(videoRef.current);
      const face = await detectFaceFromCanvas(canvas);
      if (!face.faceDetected) {
        throw new Error("Face was not detected. Please face the camera clearly and try again.");
      }

      const photo = await canvasToLoginPhoto(canvas);
      const position = positionRef.current;
      if (!position?.coords) {
        throw new Error("Location is not ready. Please restart verification.");
      }
      stopCamera();
      await onCapture({
        photo,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        ...face,
      });
    } catch (err) {
      setStatus("");
      onError?.(err.message || REQUIRED_PERMISSION_MESSAGE);
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel?.();
  };

  const busy = loading || permissionLoading || captureLoading;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl border border-base-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">
              Security Verification Required
            </h3>
            <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
              For account security, ShortJob verifies your location and requires
              a live camera face capture before this sign-in can continue.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-black aspect-video">
            <video
              ref={videoRef}
              className={`h-full w-full object-cover ${cameraReady ? "block" : "hidden"}`}
              muted
              playsInline
            />
            {!cameraReady && (
              <div className="flex h-full w-full flex-col items-center justify-center text-white/75">
                <Video className="h-12 w-12" />
                <p className="mt-3 text-sm font-medium">Camera preview required</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4 space-y-3">
            <Requirement
              icon={LocateFixed}
              active={locationReady}
              title="Location permission"
              description="High accuracy location is attached to this login record."
            />
            <Requirement
              icon={Camera}
              active={cameraReady}
              title="Live camera preview"
              description="The camera must open before you can capture the login photo."
            />
            <Requirement
              icon={ShieldCheck}
              active={false}
              title="Face capture"
              description="Keep your face visible and centered before pressing capture."
            />
          </div>
        </div>

        {status && (
          <div className="alert alert-info alert-soft mt-4 text-sm">
            {status}
          </div>
        )}

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
            className="btn btn-ghost btn-md"
            onClick={handleCancel}
            disabled={busy}
          >
            Back to login
          </button>
          {cameraReady ? (
            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={handleCapture}
              disabled={busy || !locationReady}
            >
              {busy ? (
                <span className="loading loading-spinner loading-sm" />
              ) : error ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Capture Face & Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={handleOpenCamera}
              disabled={busy}
            >
              {busy ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              Open Camera & Location
            </button>
          )}
        </div>

        {cameraReady && (
          <button
            type="button"
            className="btn btn-link btn-sm px-0 text-base-content/55"
            onClick={handleOpenCamera}
            disabled={busy}
          >
            Restart permission check
          </button>
        )}

        <p className="text-[11px] text-base-content/40 mt-3">
          By continuing, you agree to this verification for this sign-in.
        </p>
      </div>
    </div>
  );
};

const Requirement = ({ icon: Icon, active, title, description }) => (
  <div className="flex items-start gap-3">
    <div
      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        active ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </div>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-base-content/55 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default LoginAuditModal;
