import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
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
  "Location, camera access, and a full visible face capture are required to sign in while this security feature is enabled.";

const getFaceErrorMessage = (face) => {
  if (face?.validation === "poor-lighting") {
    return "The photo is too dark or too bright. Face the light and keep your full face inside the guide.";
  }
  if (face?.validation === "no-centered-face") {
    return "No centered face was found. Move closer, face the camera directly, and keep your full face visible.";
  }
  if (face?.validation === "no-face-detail") {
    return "The face is not clear enough. Clean the camera, improve lighting, and try again.";
  }
  return "Full face was not detected. Please keep your complete face centered in the camera frame and try again.";
};

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
      stopVideoStream(streamRef.current);
      streamRef.current = null;
    }

    return () => {
      stopVideoStream(streamRef.current);
      streamRef.current = null;
    };
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
      setStatus("Camera is ready. Center your full face inside the guide before capture.");
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
        throw new Error(getFaceErrorMessage(face));
      }

      const photo = await canvasToLoginPhoto(canvas);
      const position = positionRef.current;
      if (!position?.coords) {
        throw new Error("Location is not ready. Please restart verification.");
      }
      stopCamera();
      setLocationReady(false);
      setStatus("");
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
    setLocationReady(false);
    setStatus("");
    onError?.("");
    onCancel?.();
  };

  const busy = loading || permissionLoading || captureLoading;

  return (
    <div className="modal modal-open px-2 sm:px-4">
      <div className="modal-box flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden border border-base-300 p-0 shadow-2xl">
        <div className="shrink-0 border-b border-base-300/70 bg-base-100 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-2xl">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold leading-tight sm:text-xl">
                Security Verification Required
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-base-content/60">
                Allow location and camera, then capture a clear full-face photo
                to continue signing in.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-black aspect-[4/5] max-h-[58dvh] sm:aspect-video lg:max-h-none">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${cameraReady ? "block" : "hidden"}`}
                muted
                playsInline
              />
              {!cameraReady && (
                <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center text-white/75">
                  <Video className="h-10 w-10 sm:h-12 sm:w-12" />
                  <p className="mt-3 text-sm font-semibold">
                    Camera preview required
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-white/50">
                    Your browser will ask for camera and location permission.
                  </p>
                </div>
              )}
              {cameraReady && (
                <>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[70%] w-[58%] rounded-[48%] border-2 border-white/85 shadow-[0_0_0_999px_rgba(0,0,0,0.24)] sm:w-[44%]" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl bg-black/60 px-3 py-2 text-center text-[11px] font-semibold leading-4 text-white sm:inset-x-3 sm:bottom-3 sm:text-xs">
                    Keep forehead, chin, and both sides of your face inside the oval.
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-base-300 bg-base-200/50 p-3 sm:p-4 space-y-3">
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
                  description="Your full face must be clear, centered, and visible."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-success/20 bg-success/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
                    <Lightbulb className="h-4 w-4" />
                    Good capture
                  </div>
                  <ul className="space-y-1 text-xs leading-5 text-base-content/65">
                    <li>Face camera directly.</li>
                    <li>Show forehead to chin.</li>
                    <li>Use front light.</li>
                    <li>Keep camera steady.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-error/20 bg-error/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-error">
                    <CircleAlert className="h-4 w-4" />
                    Will be rejected
                  </div>
                  <ul className="space-y-1 text-xs leading-5 text-base-content/65">
                    <li>Half face or cut face.</li>
                    <li>Looking away or covered face.</li>
                    <li>Too close to camera.</li>
                    <li>Dark, blurred, or blocked view.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {status && (
            <div className="alert alert-info alert-soft mt-4 py-2 text-sm">
              {status}
            </div>
          )}

          {error && (
            <div className="alert alert-error alert-soft mt-4 py-2 text-sm">
              {error}
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-base-content/50">
            This is used only for login security records. It is visible to you
            and platform admins, never shown to other users.
          </p>

          {cameraReady && (
            <button
              type="button"
              className="btn btn-link btn-sm mt-2 px-0 text-base-content/55"
              onClick={handleOpenCamera}
              disabled={busy}
            >
              Restart permission check
            </button>
          )}
        </div>

        <div className="modal-action mt-0 shrink-0 flex-col border-t border-base-300/70 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <button
            type="button"
            className="btn btn-ghost h-11 w-full rounded-xl sm:w-auto"
            onClick={handleCancel}
            disabled={busy}
          >
            Back to login
          </button>
          {cameraReady ? (
            <button
              type="button"
              className="btn btn-primary h-11 w-full gap-2 rounded-xl sm:w-auto"
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
              className="btn btn-primary h-11 w-full gap-2 rounded-xl sm:w-auto"
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
