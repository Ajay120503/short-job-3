import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GripVertical,
  Mail,
  MapPin,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import API from "../../utils/axios";
import UserAvatar from "../common/UserAvatar";
import UserSignalBadge from "../common/UserSignalBadge";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../../utils/specialUserStyles";
import toast from "../../utils/toast";

const COLUMNS = [
  {
    key: "applied",
    label: "Applied",
    icon: Clock3,
    tone: "border-info/20 bg-info/5 text-info",
  },
  {
    key: "reviewed",
    label: "Reviewed",
    icon: UserCheck,
    tone: "border-primary/20 bg-primary/5 text-primary",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    icon: Star,
    tone: "border-warning/25 bg-warning/10 text-warning",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    tone: "border-error/20 bg-error/5 text-error",
  },
  {
    key: "selected",
    label: "Selected",
    icon: CheckCircle2,
    tone: "border-success/25 bg-success/10 text-success",
  },
];

const ApplicantKanban = ({ applications: initialApps, onStatusChange }) => {
  const [statusOverrides, setStatusOverrides] = useState({});
  const [draggedApp, setDraggedApp] = useState(null);
  const [overColumn, setOverColumn] = useState("");
  const apps = (initialApps || []).map((app) =>
    statusOverrides[app._id]
      ? { ...app, status: statusOverrides[app._id] }
      : app
  );

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = apps.filter((a) => a.status === col.key);
    return acc;
  }, {});

  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", app._id);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setOverColumn("");
    if (!draggedApp) return;

    const appId = draggedApp._id;
    const app = apps.find((a) => a._id === appId);
    if (!app || app.status === newStatus) {
      setDraggedApp(null);
      return;
    }

    setStatusOverrides((prev) => ({ ...prev, [appId]: newStatus }));
    setDraggedApp(null);

    try {
      const { data } = await API.put(`/jobs/applications/${appId}/status`, {
        status: newStatus,
      });
      const updatedApplication = data.application || {};
      if (onStatusChange) {
        onStatusChange({
          ...app,
          ...updatedApplication,
          status: updatedApplication.status || newStatus,
          applicant:
            updatedApplication.applicant &&
            typeof updatedApplication.applicant === "object"
              ? updatedApplication.applicant
              : app.applicant,
        });
      }
    } catch {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
      toast.error("Failed to update status");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:mx-0">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const items = grouped[col.key] || [];
        const isOver = overColumn === col.key;
        return (
          <div
            key={col.key}
            className={`flex-shrink-0 w-[18rem] rounded-2xl border p-3 transition-all md:w-auto ${
              isOver
                ? "border-primary/45 bg-primary/8 shadow-sm"
                : "border-base-300/70 bg-base-200/45"
            }`}
            onDragEnter={() => setOverColumn(col.key)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOverColumn("");
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className={`mb-3 rounded-xl border px-3 py-2 ${col.tone}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs font-bold uppercase tracking-wide">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-base-100/80 px-2 py-0.5 text-xs font-bold text-base-content/70">
                  {items.length}
                </span>
              </div>
            </div>

            <div className="space-y-2 min-h-[160px]">
              {items.map((app) => (
                <ApplicantCard
                  key={app._id}
                  app={app}
                  isDragging={draggedApp?._id === app._id}
                  onDragStart={handleDragStart}
                  onDragEnd={() => {
                    setDraggedApp(null);
                    setOverColumn("");
                  }}
                />
              ))}
              {items.length === 0 && (
                <div
                  className={`flex min-h-[120px] items-center justify-center rounded-xl border border-dashed text-xs transition-colors ${
                    isOver
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-base-300 bg-base-100/45 text-base-content/35"
                  }`}
                >
                  Drop applicants here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ApplicantCard = ({ app, isDragging, onDragStart, onDragEnd }) => {
  const applicant = app.applicant || {};
  const isSpecialApplicant = canUseSpecialStyle(applicant);
  const specialStyle = getSpecialUserStyle(applicant);
  const location = [applicant.city, applicant.state].filter(Boolean).join(", ");
  const headline =
    applicant.currentPosition ||
    applicant.profession ||
    applicant.subject ||
    applicant.institutionName;

  return (
    <div
      className={`rounded-2xl border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isSpecialApplicant
          ? `${specialStyle.shell} ${specialStyle.shellHover}`
          : "border-base-300/70 bg-base-100 hover:border-primary/25"
      } ${isDragging ? "opacity-60 ring-2 ring-primary/20" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start gap-2.5">
        <UserAvatar
          user={applicant}
          size={36}
          ringClass={isSpecialApplicant ? specialStyle.ring : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <Link
                to={applicant._id ? `/profile/${applicant._id}` : "#"}
                className={`block truncate text-sm font-semibold hover:text-primary ${
                  isSpecialApplicant ? specialStyle.muted : ""
                }`}
              >
                {applicant.name || "Unknown applicant"}
              </Link>
              <UserSignalBadge user={applicant} size="xs" />
            </div>
            <GripVertical
              className={`h-4 w-4 shrink-0 cursor-grab ${
                isSpecialApplicant ? specialStyle.icon : "text-base-content/25"
              }`}
            />
          </div>
          {headline && (
            <p className="mt-0.5 truncate text-xs text-base-content/55">
              {headline}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] text-base-content/50">
        {applicant.email && (
          <p className="flex min-w-0 items-center gap-1.5">
            <Mail
              className={`h-3.5 w-3.5 shrink-0 ${
                isSpecialApplicant ? specialStyle.icon : ""
              }`}
            />
            <span className="truncate">{applicant.email}</span>
          </p>
        )}
        {location && (
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin
              className={`h-3.5 w-3.5 shrink-0 ${
                isSpecialApplicant ? specialStyle.icon : ""
              }`}
            />
            <span className="truncate">{location}</span>
          </p>
        )}
        {Number(applicant.experience) > 0 && (
          <p className="flex min-w-0 items-center gap-1.5">
            <BriefcaseBusiness
              className={`h-3.5 w-3.5 shrink-0 ${
                isSpecialApplicant ? specialStyle.icon : ""
              }`}
            />
            <span>{applicant.experience} year experience</span>
          </p>
        )}
      </div>

      {applicant.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {applicant.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isSpecialApplicant
                  ? specialStyle.soft
                  : "bg-base-200 text-base-content/60"
              }`}
            >
              {skill}
            </span>
          ))}
          {applicant.skills.length > 3 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isSpecialApplicant
                  ? specialStyle.label
                  : "bg-primary/10 text-primary"
              }`}
            >
              +{applicant.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantKanban;
