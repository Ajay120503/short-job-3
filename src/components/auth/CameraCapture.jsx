export const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });

export const getVideoStream = () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(new Error("Camera is not supported by this browser."));
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });
};

export const stopVideoStream = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

export const captureCanvasFromVideo = (video) => {
  if (!video?.videoWidth || !video?.videoHeight) {
    throw new Error("Camera preview is not ready yet.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const estimateLiveFaceFrame = (canvas) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;
  const xStart = Math.floor(width * 0.18);
  const xEnd = Math.floor(width * 0.82);
  const yStart = Math.floor(height * 0.12);
  const yEnd = Math.floor(height * 0.9);
  const imageData = context.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
  const data = imageData.data;
  let sampled = 0;
  let bright = 0;
  let dark = 0;
  let luminanceTotal = 0;
  let contrastTotal = 0;
  let edgeHits = 0;
  let previousLum = null;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const contrast = Math.max(r, g, b) - Math.min(r, g, b);

    sampled += 1;
    luminanceTotal += luminance;
    contrastTotal += contrast;
    if (luminance > 70) bright += 1;
    if (luminance < 35) dark += 1;
    if (previousLum !== null && Math.abs(luminance - previousLum) > 18) {
      edgeHits += 1;
    }
    previousLum = luminance;
  }

  if (!sampled) return 0;

  const avgLum = luminanceTotal / sampled;
  const avgContrast = contrastTotal / sampled;
  const brightRatio = bright / sampled;
  const darkRatio = dark / sampled;
  const edgeRatio = edgeHits / sampled;

  const exposureScore = avgLum > 45 && avgLum < 225 ? 0.35 : 0;
  const detailScore = Math.min(avgContrast / 70, 1) * 0.3;
  const centerScore = brightRatio > 0.08 && darkRatio < 0.7 ? 0.2 : 0;
  const edgeScore = Math.min(edgeRatio / 0.22, 1) * 0.15;

  return Number((exposureScore + detailScore + centerScore + edgeScore).toFixed(2));
};

export const detectFaceFromCanvas = async (canvas) => {
  const BrowserFaceDetector = window.FaceDetector;

  if (BrowserFaceDetector) {
    try {
      const detector = new BrowserFaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      const faces = await detector.detect(canvas);
      return {
        faceDetected: faces.length > 0,
        faceCount: faces.length,
        detector: "browser-face-detector",
        confidence: faces.length > 0 ? 1 : 0,
      };
    } catch {
      // Fall through to the live-frame gate if the browser detector fails.
    }
  }

  const confidence = estimateLiveFaceFrame(canvas);
  return {
    faceDetected: confidence >= 0.62,
    faceCount: confidence >= 0.62 ? 1 : 0,
    detector: "live-camera-frame-gate",
    confidence,
  };
};

export const canvasToLoginPhoto = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to capture photo."));
          return;
        }
        resolve(new File([blob], "login-audit.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  });

const captureFrame = async (stream) => {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = reject;
    video.play().catch(reject);
  });

  const canvas = captureCanvasFromVideo(video);
  const face = await detectFaceFromCanvas(canvas);
  if (!face.faceDetected) {
    throw new Error("Face was not detected. Please face the camera clearly and try again.");
  }
  const photo = await canvasToLoginPhoto(canvas);
  return { photo, face };
};

export const captureLoginAudit = async () => {
  let stream;
  try {
    const [position, videoStream] = await Promise.all([
      getPosition(),
      getVideoStream(),
    ]);
    stream = videoStream;
    const { photo, face } = await captureFrame(stream);
    return {
      photo,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      ...face,
    };
  } finally {
    stopVideoStream(stream);
  }
};
