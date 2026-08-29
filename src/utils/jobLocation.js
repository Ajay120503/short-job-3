export const getJobWorkModeLabel = (location) => {
  if (location === "remote") return "Remote";
  if (location === "hybrid") return "Hybrid";
  return "On-site";
};

export const getJobWorkplaceLabel = (job = {}) => {
  const parts = [
    job.workplaceName,
    job.workplaceAddress,
    job.workplaceCity,
    job.workplaceState,
    job.workplaceCountry,
  ].filter(Boolean);

  if (parts.length) return parts.join(", ");
  return getJobWorkModeLabel(job.location);
};

export const hasJobCoordinates = (job = {}) =>
  job.coordinates?.lat !== "" &&
  job.coordinates?.lng !== "" &&
  job.coordinates?.lat !== undefined &&
  job.coordinates?.lng !== undefined &&
  Number.isFinite(Number(job.coordinates?.lat)) &&
  Number.isFinite(Number(job.coordinates?.lng));

export const getJobMapLink = (job = {}) => {
  if (hasJobCoordinates(job)) {
    const lat = Number(job.coordinates.lat);
    const lng = Number(job.coordinates.lng);
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  }

  const query = getJobWorkplaceLabel(job);
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
};

export const getJobMapEmbedUrl = (job = {}) => {
  if (!hasJobCoordinates(job)) return "";
  const lat = Number(job.coordinates.lat);
  const lng = Number(job.coordinates.lng);
  const delta = 0.01;
  const bbox = [
    lng - delta,
    lat - delta,
    lng + delta,
    lat + delta,
  ].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};
