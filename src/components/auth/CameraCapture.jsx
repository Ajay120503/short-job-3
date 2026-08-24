const getPosition = () =>
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

const getVideoStream = () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(new Error("Camera is not supported by this browser."));
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });
};

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

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
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
};

export const captureLoginAudit = async () => {
  let stream;
  try {
    const [position, videoStream] = await Promise.all([
      getPosition(),
      getVideoStream(),
    ]);
    stream = videoStream;
    const photo = await captureFrame(stream);
    return {
      photo,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } finally {
    stream?.getTracks?.().forEach((track) => track.stop());
  }
};
