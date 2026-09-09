import { Link } from "react-router-dom";
import { Calendar, Camera, Laptop, MapPin, ShieldCheck } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import BadgeChip from "../common/BadgeChip";
import { getActiveBadges } from "../../utils/badgeUtils";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

const compactText = (value, limit = 240) => {
  const text = Array.from(String(value || ""))
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? " " : character;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
};

const LoginRecordDetail = ({ record }) => {
  if (!record) return null;
  const user = record.user || {};
  const lat = record.location?.lat;
  const lng = record.location?.lng;
  const hasMap = lat != null && lng != null && lat !== "" && lng !== "" && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.01}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : "";

  return (
    <div className="login-record-detail min-w-0 rounded-2xl bg-base-100 p-3 sm:p-5">
      <div className="login-record-layout grid gap-5">
        <div className="login-record-media grid content-start gap-3">
          <div className="aspect-square max-h-64 overflow-hidden rounded-2xl bg-base-200 border border-base-300">
            {record.photo?.url ? (
              <img
                src={record.photo.url}
                alt="Login verification"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/35">
                No photo
              </div>
            )}
          </div>
          {hasMap && (
            <iframe
              title="Login location map"
              src={mapSrc}
              className="w-full h-36 rounded-xl border border-base-300"
              loading="lazy"
            />
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-3">
            <UserAvatar user={user} size={48} showPresence={false} showAdminBadge={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold [overflow-wrap:anywhere]">{user.name || "Unknown user"}</p>
                <span
                  className={`badge badge-xs ${
                    user.isBlocked ? "badge-error" : "badge-success"
                  } badge-soft`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <p className="text-xs text-base-content/65 break-all">
                {user.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-1 line-clamp-1">
                {getActiveBadges(user)
                  .slice(0, 4)
                  .map((badge) => (
                    <BadgeChip
                      key={badge._id || badge.type}
                      badgeType={badge.type}
                      size="sm"
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info
              icon={Calendar}
              label="Login time"
              value={formatDate(record.loginAt)}
            />
            <Info
              icon={MapPin}
              label="City / State"
              value={
                [record.location?.city, record.location?.state]
                  .filter(Boolean)
                  .join(", ") || "Unknown"
              }
            />
            <Info
              icon={MapPin}
              label="Coordinates"
              value={
                hasMap
                  ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
                  : "Unknown"
              }
            />
            <Info
              icon={ShieldCheck}
              label="Accuracy"
              value={
                record.location?.accuracy
                  ? `±${Math.round(record.location.accuracy)} meters`
                  : "Unknown"
              }
            />
            <Info
              icon={Laptop}
              label="Device"
              value={record.device?.browser || "Unknown"}
            />
            <Info
              icon={ShieldCheck}
              label="IP address"
              value={record.device?.ip || "Unknown"}
            />
            <Info
              icon={Camera}
              label="Face verification"
              value={
                record.faceDetection?.detected
                  ? `Verified${
                      record.faceDetection.count
                        ? ` (${record.faceDetection.count} detected)`
                        : ""
                    }`
                  : "Legacy record"
              }
            />
            <Info
              icon={ShieldCheck}
              label="Detector"
              value={record.faceDetection?.detector || "Not recorded"}
            />
            <Info
              icon={ShieldCheck}
              label="Face rule"
              value={
                record.faceDetection?.validation
                  ? record.faceDetection.validation.replace(/-/g, " ")
                  : "Not recorded"
              }
            />
          </div>

          <div className="min-w-0 rounded-xl bg-base-200/60 border border-base-300 p-3 text-xs text-base-content/60">
            <div className="grid min-w-0 gap-1.5 sm:grid-cols-[auto_1fr]">
              <span className="font-semibold text-base-content/75">Profile:</span>
              <div className="min-w-0 space-y-1">
                {user.phone && (
                  <p className="break-words [overflow-wrap:anywhere]">
                    {compactText(user.phone, 40)}
                  </p>
                )}
                {user.address && (
                  <p className="break-words [overflow-wrap:anywhere]">
                    {compactText(user.address)}
                  </p>
                )}
                {(user.city || user.state) && (
                  <p className="break-words [overflow-wrap:anywhere]">
                    {compactText([user.city, user.state].filter(Boolean).join(", "), 100)}
                  </p>
                )}
                {!user.phone && !user.address && !user.city && !user.state && (
                  <p>No phone/address on profile</p>
                )}
              </div>
            </div>
            <p className="mt-1">
              <span className="font-semibold text-base-content/75">
                Account created:
              </span>{" "}
              {formatDate(user.createdAt)}
            </p>
          </div>

          {user._id && (
            <Link
              to={`/admin/login-records?userId=${user._id}`}
              className="btn btn-outline btn-sm h-auto min-h-10 py-2 text-center whitespace-normal"
            >
              View all login records for this user
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="min-w-0 rounded-xl border border-base-300 bg-base-200/40 p-3">
    <div className="flex items-center gap-2 text-xs text-base-content/65">
      <Icon className="w-3.5 h-3.5 shrink-0 text-primary" />
      {label}
    </div>
    <p className="mt-1 text-sm font-semibold break-words [overflow-wrap:anywhere]">
      {compactText(value)}
    </p>
  </div>
);

export default LoginRecordDetail;
