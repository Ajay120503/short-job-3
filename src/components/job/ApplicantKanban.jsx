import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/axios";
import UserAvatar from "../common/UserAvatar";
import toast from "react-hot-toast";

const COLUMNS = [
  { key: "applied", label: "Applied" },
  { key: "reviewed", label: "Reviewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "rejected", label: "Rejected" },
  { key: "selected", label: "Selected" },
];

const ApplicantKanban = ({ applications: initialApps, onStatusChange }) => {
  const [apps, setApps] = useState(initialApps || []);
  const [draggedApp, setDraggedApp] = useState(null);

  useEffect(() => {
    setApps(initialApps || []);
  }, [initialApps]);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = apps.filter((a) => a.status === col.key);
    return acc;
  }, {});

  const handleDragStart = (e, appId) => {
    setDraggedApp(appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedApp) return;

    const appId = draggedApp;
    const app = apps.find((a) => a._id === appId);
    if (!app || app.status === newStatus) {
      setDraggedApp(null);
      return;
    }

    // Optimistic update
    setApps((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );
    setDraggedApp(null);

    try {
      const { data } = await API.put(`/jobs/applications/${appId}/status`, {
        status: newStatus,
      });
      if (onStatusChange) onStatusChange(data.application);
    } catch {
      // Revert on error
      setApps((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: app.status } : a))
      );
      toast.error("Failed to update status");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:mx-0">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className="flex-shrink-0 w-56 md:w-auto bg-base-200/50 rounded-lg p-3"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              {col.label}
            </span>
            <span className="badge badge-xs badge-ghost">
              {grouped[col.key]?.length || 0}
            </span>
          </div>
          <div className="space-y-2 min-h-[100px]">
            {grouped[col.key]?.map((app) => (
              <div
                key={app._id}
                className="card bg-base-100 shadow-sm border border-base-300/50 p-2 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleDragStart(e, app._id)}
              >
                <div className="flex items-center gap-2">
                  <UserAvatar user={app.applicant} size={28} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/profile/${app.applicant?._id}`}
                      className="text-xs font-medium truncate block hover:text-primary"
                    >
                      {app.applicant?.name || "Unknown"}
                    </Link>
                    {app.applicant?.institutionName && (
                      <p className="text-[10px] text-base-content/40 truncate">
                        {app.applicant.institutionName}
                      </p>
                    )}
                  </div>
                </div>
                {app.applicant?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {app.applicant.skills.slice(0, 2).map((s, i) => (
                      <span key={i} className="badge badge-xs badge-outline">
                        {s}
                      </span>
                    ))}
                    {app.applicant.skills.length > 2 && (
                      <span className="text-[10px] text-base-content/40">
                        +{app.applicant.skills.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {(!grouped[col.key] || grouped[col.key].length === 0) && (
              <div className="text-center py-4 text-xs text-base-content/30 border border-dashed border-base-300 rounded-lg">
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicantKanban;
