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

const LoginRecordDetail = ({ record }) => {
  if (!record) return null;
  const user = record.user || {};
  const lat = record.location?.lat;
  const lng = record.location?.lng;
  const hasMap = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.01}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : "";

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-base-200 border border-base-300">
            {record.photo?.url ? (
              <img
                src={record.photo.url}
                alt="Login verification"
                className="w-full h-full object-cover"
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

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <UserAvatar user={user} size={48} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{user.name || "Unknown user"}</p>
                <span
                  className={`badge badge-xs ${
                    user.isBlocked ? "badge-error" : "badge-success"
                  } badge-soft`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <p className="text-xs text-base-content/50 line-clamp-1">
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

          <div className="rounded-xl bg-base-200/60 border border-base-300 p-3 text-xs text-base-content/60">
            <p>
              <span className="font-semibold text-base-content/75">
                Profile:
              </span>{" "}
              {user.phone || user.address || user.city || user.state
                ? [user.phone, user.address, user.city, user.state]
                    .filter(Boolean)
                    .join(" · ")
                : "No phone/address on profile"}
            </p>
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
              className="btn btn-outline btn-sm"
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
  <div className="rounded-xl border border-base-300 bg-base-200/40 p-3">
    <div className="flex items-center gap-2 text-xs text-base-content/45">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <p className="mt-1 text-sm font-semibold break-words">{value}</p>
  </div>
);

export default LoginRecordDetail;
