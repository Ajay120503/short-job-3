import {
  Plus,
  Building2,
  Briefcase,
  Trophy,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../../utils/axios";
import FontAwesomeGraduateIcon from "../common/FontAwesomeGraduateIcon";

const typeConfig = {
  school: {
    icon: FontAwesomeGraduateIcon,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  college: {
    icon: Building2,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  work: { icon: Briefcase, color: "text-teal-500", bg: "bg-teal-50" },
  achievement: {
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
};

const emptyEntry = { year: "", title: "", institution: "", type: "school" };

const CareerTimeline = ({ timeline = [], isOwner, userId, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(timeline.length ? timeline : [emptyEntry]);
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(
    () =>
      [...(timeline || [])].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
      }),
    [timeline],
  );

  const openEditor = () => {
    setDraft(timeline?.length ? timeline : [emptyEntry]);
    setEditing(true);
  };

  const updateDraft = (index, field, value) => {
    setDraft((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeDraft = (index) => {
    setDraft((items) =>
      items.length === 1
        ? [emptyEntry]
        : items.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const saveTimeline = async () => {
    const cleaned = draft
      .map((entry) => ({
        year: String(entry.year || "").trim(),
        title: String(entry.title || "").trim(),
        institution: String(entry.institution || "").trim(),
        type: entry.type || "school",
      }))
      .filter((entry) => entry.year || entry.title || entry.institution);

    if (cleaned.some((entry) => !entry.year || !entry.title)) {
      toast.error("Each timeline entry needs a year and title.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.put(`/users/${userId}/timeline`, {
        timeline: cleaned,
      });
      onUpdated?.(data.user?.timeline || cleaned, data.user);
      setEditing(false);
      toast.success("Career timeline updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update timeline");
    } finally {
      setSaving(false);
    }
  };

  if (!timeline || timeline.length === 0) {
    if (!isOwner) return null;
    return (
      <>
        <div className="mt-4 p-4 bg-base-200/30 rounded-lg text-center">
          <p className="text-sm text-base-content/40">
            No career timeline entries yet.
          </p>
          <button
            onClick={openEditor}
            className="btn btn-ghost btn-xs gap-1 mt-2"
          >
            <Plus className="w-3 h-3" /> Add Entry
          </button>
        </div>
        {editing && (
          <TimelineEditor
            draft={draft}
            saving={saving}
            updateDraft={updateDraft}
            removeDraft={removeDraft}
            addDraft={() => setDraft((items) => [...items, emptyEntry])}
            onClose={() => setEditing(false)}
            onSave={saveTimeline}
          />
        )}
      </>
    );
  }

  return (
    <div className="mt-4 mb-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        Career Journey
        {isOwner && (
          <button
            onClick={openEditor}
            className="btn btn-ghost btn-xs gap-1 ml-auto"
          >
            <Pencil className="w-3 h-3" /> Manage
          </button>
        )}
      </h3>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-base-300 rounded-full" />

        {sorted.map((entry, idx) => {
          const config = typeConfig[entry.type] || typeConfig.school;
          const Icon = config.icon;
          return (
            <div key={idx} className="relative pb-4 last:pb-0">
              {/* Node */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full ${config.bg} flex items-center justify-center border-2 border-base-100`}
              >
                <Icon className={`w-3 h-3 ${config.color}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-base-content/50">
                  {entry.year}
                </span>
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.institution && (
                  <p className="text-xs text-base-content/50">
                    {entry.institution}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <TimelineEditor
          draft={draft}
          saving={saving}
          updateDraft={updateDraft}
          removeDraft={removeDraft}
          addDraft={() => setDraft((items) => [...items, emptyEntry])}
          onClose={() => setEditing(false)}
          onSave={saveTimeline}
        />
      )}
    </div>
  );
};

const TimelineEditor = ({
  draft,
  saving,
  updateDraft,
  removeDraft,
  addDraft,
  onClose,
  onSave,
}) => (
  <div className="modal modal-open">
    <div className="modal-box max-w-2xl">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg">Career Timeline</h3>
          <p className="text-xs text-base-content/50">
            Add background, work, and achievement milestones shown on your profile.
          </p>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
        {draft.map((entry, index) => (
          <div
            key={index}
            className="rounded-xl border border-base-300 bg-base-100 p-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                className="input input-bordered input-sm"
                placeholder="Year"
                value={entry.year}
                onChange={(e) => updateDraft(index, "year", e.target.value)}
              />
              <select
                className="select select-bordered select-sm"
                value={entry.type}
                onChange={(e) => updateDraft(index, "type", e.target.value)}
              >
                <option value="school">Foundation</option>
                <option value="college">Advanced</option>
                <option value="work">Work</option>
                <option value="achievement">Achievement</option>
              </select>
              <input
                className="input input-bordered input-sm sm:col-span-2"
                placeholder="Title"
                value={entry.title}
                onChange={(e) => updateDraft(index, "title", e.target.value)}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                placeholder="Organization or place"
                value={entry.institution}
                onChange={(e) =>
                  updateDraft(index, "institution", e.target.value)
                }
              />
              <button
                onClick={() => removeDraft(index)}
                className="btn btn-ghost btn-sm btn-square text-error"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-action justify-between">
        <button onClick={addDraft} className="btn btn-ghost btn-sm gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary btn-sm gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Timeline"}
        </button>
      </div>
    </div>
  </div>
);

export default CareerTimeline;
