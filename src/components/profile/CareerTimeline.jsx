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
import toast from "../../utils/toast";
import API from "../../utils/axios";
import FontAwesomeGraduateIcon from "../common/FontAwesomeGraduateIcon";

const typeConfig = {
  school: {
    icon: FontAwesomeGraduateIcon,
    label: "Education",
    color: "text-info",
    bg: "bg-info/10",
  },
  college: {
    icon: Building2,
    label: "Education",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  work: { icon: Briefcase, label: "Experience", color: "text-primary", bg: "bg-primary/10" },
  achievement: {
    icon: Trophy,
    label: "Achievement",
    color: "text-warning",
    bg: "bg-warning/10",
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

  const hasEntries = sorted.length > 0;

  if (!hasEntries) {
    if (!isOwner) return null;
    return (
      <>
        <section className="my-4 rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-heading text-base font-bold">Build your career journey</h3>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-base-content/50">
            Add education, experience, and achievements to help visitors understand your background.
          </p>
          <button
            onClick={openEditor}
            className="btn btn-primary btn-sm mt-4 gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add first milestone
          </button>
        </section>
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
    <section className="my-4 overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm">
      <div className="flex items-center gap-3 border-b border-base-300/60 px-4 py-3.5 sm:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-bold">Career Journey</h3>
          <p className="text-[11px] text-base-content/45">{sorted.length} {sorted.length === 1 ? "milestone" : "milestones"}</p>
        </div>
        {isOwner && (
          <button
            onClick={openEditor}
            className="btn btn-ghost btn-sm ml-auto gap-1.5 text-primary"
          >
            <Pencil className="h-3.5 w-3.5" /> Manage
          </button>
        )}
      </div>
      <div className="relative px-4 py-5 pl-12 sm:px-5 sm:pl-14">
        {/* Vertical line */}
        <div className="absolute bottom-7 left-[27px] top-7 w-px bg-gradient-to-b from-primary/60 via-base-300 to-base-300 sm:left-[35px]" />

        {sorted.map((entry, idx) => {
          const config = typeConfig[entry.type] || typeConfig.school;
          const Icon = config.icon;
          return (
            <article key={`${entry.year}-${entry.title}-${idx}`} className="group relative pb-5 last:pb-0">
              {/* Node */}
              <div
                className={`absolute -left-9 top-1 flex h-7 w-7 items-center justify-center rounded-xl border-2 border-base-100 shadow-sm sm:-left-10 ${config.bg}`}
              >
                <Icon className={`w-3 h-3 ${config.color}`} />
              </div>
              <div className="rounded-xl border border-transparent px-3 py-2 transition-colors group-hover:border-base-300/60 group-hover:bg-base-200/35">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-primary">{entry.year}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${config.bg} ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-sm font-semibold leading-snug">{entry.title}</p>
                {entry.institution && (
                  <p className="text-xs text-base-content/50">
                    {entry.institution}
                  </p>
                )}
              </div>
            </article>
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
    </section>
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
  <div className="modal modal-open px-2" role="dialog" aria-modal="true" aria-labelledby="timeline-editor-title">
    <div className="modal-box max-h-[92dvh] max-w-3xl overflow-hidden border border-base-300 p-0 shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-base-300/60 px-4 py-4 sm:px-5">
        <div>
          <h3 id="timeline-editor-title" className="font-heading text-lg font-bold">Career Timeline</h3>
          <p className="text-xs text-base-content/50">
            Add background, work, and achievement milestones shown on your
            profile.
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close timeline editor">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[58dvh] space-y-3 overflow-y-auto bg-base-200/25 px-4 py-4 sm:px-5">
        {draft.map((entry, index) => (
          <div
            key={index}
            className="rounded-2xl border border-base-300/70 bg-base-100 p-3.5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-base-content/55">Milestone {index + 1}</span>
              <button type="button" onClick={() => removeDraft(index)} className="btn btn-ghost btn-xs btn-square text-error" aria-label={`Remove milestone ${index + 1}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="form-control">
                <span className="label-text mb-1 text-[11px] font-medium">Year *</span>
                <input
                className="input input-bordered input-sm w-full"
                placeholder="2026"
                inputMode="numeric"
                maxLength={4}
                value={entry.year}
                onChange={(e) => updateDraft(index, "year", e.target.value)}
              />
              </label>
              <label className="form-control">
                <span className="label-text mb-1 text-[11px] font-medium">Type</span>
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
              </label>
              <label className="form-control sm:col-span-2">
                <span className="label-text mb-1 text-[11px] font-medium">Title *</span>
                <input
                className="input input-bordered input-sm sm:col-span-2"
                placeholder="e.g. Joined as Product Designer"
                value={entry.title}
                onChange={(e) => updateDraft(index, "title", e.target.value)}
              />
              </label>
            </div>
            <div className="mt-3">
              <label className="form-control">
              <span className="label-text mb-1 text-[11px] font-medium">Organization or place</span>
              <input
                className="input input-bordered input-sm w-full"
                placeholder="Organization or place"
                value={entry.institution}
                onChange={(e) =>
                  updateDraft(index, "institution", e.target.value)
                }
              />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-action m-0 flex-col-reverse justify-between gap-2 border-t border-base-300/60 px-4 py-3 sm:flex-row sm:px-5">
        <button type="button" onClick={addDraft} className="btn btn-ghost btn-sm gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
        <button type="button"
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
