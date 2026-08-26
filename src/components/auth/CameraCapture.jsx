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

const FACE_CAPTURE_ERROR =
  "Full face was not detected. Please keep your complete face centered in the camera frame and try again.";

const isFullFaceBoundingBox = (box, canvas) => {
  if (!box) return false;
  const width = canvas.width;
  const height = canvas.height;
  const left = box.x;
  const top = box.y;
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  const faceWidthRatio = box.width / width;
  const faceHeightRatio = box.height / height;
  const centerX = left + box.width / 2;
  const centerY = top + box.height / 2;
  const marginX = width * 0.025;
  const marginY = height * 0.025;

  return (
    left > marginX &&
    right < width - marginX &&
    top > marginY &&
    bottom < height - marginY &&
    faceWidthRatio >= 0.12 &&
    faceWidthRatio <= 0.82 &&
    faceHeightRatio >= 0.16 &&
    faceHeightRatio <= 0.92 &&
    centerX > width * 0.2 &&
    centerX < width * 0.8 &&
    centerY > height * 0.18 &&
    centerY < height * 0.82
  );
};

const estimateCanvasFacePresence = (canvas) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const step = Math.max(4, Math.floor(Math.min(width, height) / 120));
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * 0.26;
  const radiusY = height * 0.38;
  const background = { count: 0, lum: 0 };
  let globalCount = 0;
  let globalLum = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      globalCount += 1;
      globalLum += luminance;

      if (
        (x < width * 0.18 || x > width * 0.82) &&
        (y < height * 0.26 || y > height * 0.78)
      ) {
        background.count += 1;
        background.lum += luminance;
      }
    }
  }

  const backgroundLum = background.count
    ? background.lum / background.count
    : globalCount
      ? globalLum / globalCount
      : 128;
  const averageLum = globalCount ? globalLum / globalCount : 0;
  const stats = {
    count: 0,
    object: 0,
    detail: 0,
    warm: 0,
    leftLum: 0,
    rightLum: 0,
    leftCount: 0,
    rightCount: 0,
    bands: {
      top: { count: 0, object: 0, detail: 0 },
      middle: { count: 0, object: 0, detail: 0 },
      bottom: { count: 0, object: 0, detail: 0 },
    },
  };

  for (let y = Math.floor(height * 0.12); y < height * 0.9; y += step) {
    let previousLum = null;
    for (let x = Math.floor(width * 0.18); x < width * 0.82; x += step) {
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      if (normalizedX * normalizedX + normalizedY * normalizedY > 1) continue;

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const channelContrast = Math.max(r, g, b) - Math.min(r, g, b);
      const backgroundDiff = Math.abs(luminance - backgroundLum);
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      const warmFaceTone =
        luminance > 45 &&
        luminance < 235 &&
        cr > 132 &&
        cr < 185 &&
        cb > 70 &&
        cb < 145 &&
        r > b * 0.82;
      const detailed =
        channelContrast > 24 ||
        backgroundDiff > 28 ||
        (previousLum !== null && Math.abs(luminance - previousLum) > 18);
      const foreground =
        backgroundDiff > 24 ||
        channelContrast > 34 ||
        luminance < backgroundLum - 28 ||
        warmFaceTone;
      const relativeY = y / height;
      const band =
        relativeY < 0.4
          ? stats.bands.top
          : relativeY < 0.68
            ? stats.bands.middle
            : stats.bands.bottom;

      stats.count += 1;
      band.count += 1;
      if (foreground) {
        stats.object += 1;
        band.object += 1;
      }
      if (detailed) {
        stats.detail += 1;
        band.detail += 1;
      }
      if (warmFaceTone) stats.warm += 1;
      if (x < centerX) {
        stats.leftLum += luminance;
        stats.leftCount += 1;
      } else {
        stats.rightLum += luminance;
        stats.rightCount += 1;
      }
      previousLum = luminance;
    }
  }

  if (!stats.count) {
    return { passed: false, confidence: 0, reason: "no-face-detail" };
  }

  const ratios = Object.fromEntries(
    Object.entries(stats.bands).map(([key, value]) => [
      key,
      {
        object: value.count ? value.object / value.count : 0,
        detail: value.count ? value.detail / value.count : 0,
      },
    ]),
  );
  const objectRatio = stats.object / stats.count;
  const detailRatio = stats.detail / stats.count;
  const warmRatio = stats.warm / stats.count;
  const leftAverage = stats.leftCount ? stats.leftLum / stats.leftCount : 0;
  const rightAverage = stats.rightCount ? stats.rightLum / stats.rightCount : 0;
  const symmetryScore = 1 - Math.min(Math.abs(leftAverage - rightAverage) / 95, 1);
  const balancedFace =
    ratios.top.object > 0.055 &&
    ratios.middle.object > 0.09 &&
    ratios.bottom.object > 0.045 &&
    ratios.top.detail > 0.025 &&
    ratios.middle.detail > 0.035;

  if (averageLum < 35 || averageLum > 235) {
    return { passed: false, confidence: 0.12, reason: "poor-lighting" };
  }
  if (objectRatio < 0.12 && warmRatio < 0.05) {
    return { passed: false, confidence: 0.2, reason: "no-centered-face" };
  }
  if (detailRatio < 0.05) {
    return { passed: false, confidence: 0.25, reason: "no-face-detail" };
  }
  if (!balancedFace) {
    return { passed: false, confidence: 0.38, reason: "cropped-or-off-center" };
  }

  const confidence =
    Math.min(objectRatio / 0.34, 1) * 0.34 +
    Math.min(detailRatio / 0.16, 1) * 0.28 +
    Math.min(warmRatio / 0.16, 1) * 0.16 +
    symmetryScore * 0.14 +
    0.08;

  return {
    passed: confidence >= 0.52,
    confidence: Number(confidence.toFixed(2)),
    reason: confidence >= 0.52 ? "fallback-full-face" : "no-centered-face",
  };
};

export const detectFaceFromCanvas = async (canvas) => {
  const BrowserFaceDetector = window.FaceDetector;

  if (BrowserFaceDetector) {
    try {
      const detector = new BrowserFaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      const faces = await detector.detect(canvas);
      const validFaces = faces.filter((face) =>
        isFullFaceBoundingBox(face.boundingBox, canvas),
      );
      return {
        faceDetected: validFaces.length > 0,
        faceCount: faces.length,
        detector: "browser-face-detector",
        confidence: validFaces.length > 0 ? 1 : 0,
        validation: validFaces.length > 0 ? "full-face" : "cropped-or-off-center",
      };
    } catch {
      const fallback = estimateCanvasFacePresence(canvas);
      return {
        faceDetected: fallback.passed,
        faceCount: fallback.passed ? 1 : 0,
        detector: "canvas-face-presence-gate",
        confidence: fallback.confidence,
        validation: fallback.passed ? "fallback-full-face" : fallback.reason,
      };
    }
  }

  const fallback = estimateCanvasFacePresence(canvas);
  return {
    faceDetected: fallback.passed,
    faceCount: fallback.passed ? 1 : 0,
    detector: "canvas-face-presence-gate",
    confidence: fallback.confidence,
    validation: fallback.passed ? "fallback-full-face" : fallback.reason,
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
    throw new Error(FACE_CAPTURE_ERROR);
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
