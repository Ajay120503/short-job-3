import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  Clock,
  Briefcase,
  FileText,
  Globe,
  Award,
  Heart,
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileSpreadsheet,
  Printer,
  Search,
  Send,
  Users,
  Phone,
  Building2,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import API from "../utils/axios";
import ApplicantKanban from "../components/job/ApplicantKanban";
import UserAvatar from "../components/common/UserAvatar";
import UserSignalBadge from "../components/common/UserSignalBadge";
import { getJobWorkplaceLabel } from "../utils/jobLocation";
import {
  canUseSpecialStyle,
  getSpecialUserStyle,
} from "../utils/specialUserStyles";
import toast from "../utils/toast";

const statusColors = {
  applied: "badge-ghost",
  reviewed: "badge-info",
  shortlisted: "badge-warning",
  rejected: "badge-error",
  selected: "badge-success",
};

const statusSteps = ["applied", "reviewed", "shortlisted", "selected"];
const statusLabels = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  selected: "Selected",
  rejected: "Rejected",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

const getApplicantRows = (applications) =>
  applications.map((app, index) => {
    const a = app.applicant || {};
    return {
      "#": index + 1,
      Name: a.name || "Unknown",
      Email: a.email || "",
      Phone: a.phone || "",
      Status: statusLabels[app.status] || app.status,
      Profession: a.profession || "",
      "Current Position": a.currentPosition || "",
      "Current Company": a.currentCompany || "",
      Experience: a.experience ? `${a.experience} years` : "",
      Education: a.educationLevel || "",
      Subject: a.subject || "",
      Location: [a.city, a.state].filter(Boolean).join(", "),
      Skills: (a.skills || []).join(", "),
      Qualifications: (a.qualifications || []).join(", "),
      Interests: (a.interests || []).join(", "),
      "Open to Opportunities": a.openToOpportunities ? "Yes" : "No",
      "Applied On": formatDate(app.createdAt),
      "Cover Letter": app.coverLetter || "",
      Resume: a.resumeUrl || "",
      LinkedIn: a.linkedinUrl || "",
      Notes: app.notes || "",
    };
  });

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildApplicantTable = (rows) => {
  if (!rows.length) return "<p>No applicants found.</p>";
  const headers = Object.keys(rows[0]);
  return `
    <table>
      <thead>
        <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${headers
                .map((h) => `<td>${escapeHtml(row[h])}</td>`)
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const InfoPill = ({ icon: Icon, children, tone = "base" }) => {
  const tones = {
    base: "bg-base-200/70 text-base-content/65 border-base-300/60",
    primary: "bg-primary/8 text-primary border-primary/15",
    accent: "bg-accent/10 text-accent border-accent/15",
    success: "bg-success/10 text-success border-success/15",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
};

const ApplicantCard = ({ app, onStatusUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const a = app.applicant || {};
  const isSpecialApplicant = canUseSpecialStyle(a);
  const specialStyle = getSpecialUserStyle(a);
  const location = [a.city, a.state].filter(Boolean).join(", ");
  const currentRole = [a.currentPosition || a.profession, a.currentCompany]
    .filter(Boolean)
    .join(" at ");
  const profileSignals = [
    a.resumeUrl && "Resume",
    a.linkedinUrl && "LinkedIn",
    a.openToOpportunities && "Open",
    a.skills?.length > 0 && `${a.skills.length} skills`,
  ].filter(Boolean);

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isSpecialApplicant
          ? `${specialStyle.shell} ${specialStyle.shellHover}`
          : "border-base-300/60 bg-base-100 hover:border-primary/25"
      }`}
    >
      {/* Compact Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Avatar & Basic Info */}
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="relative shrink-0">
              <UserAvatar
                user={a}
                size={58}
                ringClass={
                  isSpecialApplicant
                    ? specialStyle.ring
                    : "ring-2 ring-base-200"
                }
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Link
                      to={`/profile/${a?._id}`}
                      className={`block truncate text-base font-bold transition-colors hover:text-primary ${
                        isSpecialApplicant ? specialStyle.muted : "text-base-content"
                      }`}
                    >
                      {a?.name || "Unknown"}
                    </Link>
                    <UserSignalBadge user={a} size="xs" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-base-content/55">
                    {currentRole || a.educationLevel || "Applicant profile"}
                  </p>
                </div>
                <span
                  className={`badge badge-sm font-semibold capitalize ${
                    isSpecialApplicant
                      ? specialStyle.label
                      : statusColors[app.status] || "badge-ghost"
                  }`}
                >
                  {statusLabels[app.status] || app.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {a?.email && (
                  <InfoPill icon={Mail} tone="primary">
                    {a.email}
                  </InfoPill>
                )}
                {a?.phone && <InfoPill icon={Phone}>{a.phone}</InfoPill>}
                {location && <InfoPill icon={MapPin}>{location}</InfoPill>}
                {a?.experience > 0 && (
                  <InfoPill icon={Briefcase} tone="accent">
                    {a.experience} yrs experience
                  </InfoPill>
                )}
                {a?.educationLevel && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      isSpecialApplicant
                        ? specialStyle.soft
                        : "border-base-300/60 bg-base-200/70 text-base-content/65"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faUserGraduate}
                      className="h-3.5 w-3.5"
                    />
                    {a.educationLevel}
                  </span>
                )}
                {a?.currentCompany && (
                  <InfoPill icon={Building2}>{a.currentCompany}</InfoPill>
                )}
              </div>

              {a?.bio && (
                <p
                  className={`mt-3 line-clamp-2 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    isSpecialApplicant
                      ? `${specialStyle.soft} border border-current/10`
                      : "bg-base-200/45 text-base-content/65"
                  }`}
                >
                  {a.bio}
                </p>
              )}

              {profileSignals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profileSignals.map((signal) => (
                    <span
                      key={signal}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isSpecialApplicant
                          ? specialStyle.soft
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {signal}
                    </span>
                  ))}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      isSpecialApplicant
                        ? specialStyle.muted
                        : "bg-base-200 text-base-content/45"
                    }`}
                  >
                    Applied {formatDate(app.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row items-center justify-between gap-2 border-t border-base-200 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
            {/* Status update buttons */}
            <div
              className={`flex items-center gap-1 rounded-full p-1 ${
                isSpecialApplicant ? specialStyle.soft : "bg-base-200/60"
              }`}
            >
              {statusSteps.map((step) => {
                const currentIdx = statusSteps.indexOf(app.status);
                const stepIdx = statusSteps.indexOf(step);
                const isPast = currentIdx >= stepIdx;
                return (
                  <button
                    key={step}
                    onClick={() => onStatusUpdate(app._id, step)}
                    disabled={step === app.status}
                    title={`Mark as ${step}`}
                    className={`btn btn-xs btn-circle transition-all ${
                      step === app.status
                        ? "btn-primary"
                        : isPast
                          ? "btn-ghost text-primary/40"
                          : "btn-ghost text-base-content/20 hover:text-primary"
                    }`}
                  >
                    {step === "selected" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </button>
                );
              })}
              {app.status !== "rejected" && (
                <button
                  onClick={() => onStatusUpdate(app._id, "rejected")}
                  title="Reject"
                  className="btn btn-xs btn-circle btn-ghost text-error/50 hover:text-error"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-xs btn-outline gap-1 rounded-full"
            >
              {expanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Details <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skills */}
        {a?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {a.skills.map((skill, i) => (
              <span
                key={i}
                className={`badge badge-sm text-xs ${
                  isSpecialApplicant ? specialStyle.label : "badge-soft badge-primary"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-base-200/70 px-5 py-4 space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {a?.age && (
              <div className={`rounded-lg p-3 text-center ${isSpecialApplicant ? specialStyle.soft : "bg-base-200/50"}`}>
                <Calendar className={`w-4 h-4 mx-auto mb-1 ${isSpecialApplicant ? specialStyle.icon : "text-primary"}`} />
                <p className="text-xs text-base-content/40">Age</p>
                <p className="text-sm font-semibold">{a.age}</p>
              </div>
            )}
            {a?.experience > 0 && (
              <div className={`rounded-lg p-3 text-center ${isSpecialApplicant ? specialStyle.soft : "bg-base-200/50"}`}>
                <Briefcase className={`w-4 h-4 mx-auto mb-1 ${isSpecialApplicant ? specialStyle.icon : "text-primary"}`} />
                <p className="text-xs text-base-content/40">Experience</p>
                <p className="text-sm font-semibold">{a.experience} yrs</p>
              </div>
            )}
            {a?.educationLevel && (
              <div className={`rounded-lg p-3 text-center ${isSpecialApplicant ? specialStyle.soft : "bg-base-200/50"}`}>
                <FontAwesomeIcon
                  icon={faUserGraduate}
                  className={`w-4 h-4 mx-auto mb-1 ${isSpecialApplicant ? specialStyle.icon : "text-primary"}`}
                  fontSize={24}
                />
                <p className="text-xs text-base-content/40">Education</p>
                <p className="text-sm font-semibold capitalize">
                  {a.educationLevel}
                </p>
              </div>
            )}
            {a?.subject && (
              <div className={`rounded-lg p-3 text-center ${isSpecialApplicant ? specialStyle.soft : "bg-base-200/50"}`}>
                <BookOpen className={`w-4 h-4 mx-auto mb-1 ${isSpecialApplicant ? specialStyle.icon : "text-primary"}`} />
                <p className="text-xs text-base-content/40">Subject</p>
                <p className="text-sm font-semibold">{a.subject}</p>
              </div>
            )}
          </div>

          {/* Qualifications */}
          {a?.qualifications?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Qualifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {a.qualifications.map((q, i) => (
                  <span
                    key={i}
                    className={`badge badge-sm ${
                      isSpecialApplicant ? specialStyle.label : "badge-outline"
                    }`}
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {a?.interests?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {a.interests.map((interest, i) => (
                  <span
                    key={i}
                    className={`badge badge-sm ${
                      isSpecialApplicant ? specialStyle.soft : "badge-ghost"
                    }`}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div>
              <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Cover Letter
              </h4>
              <p
                className={`text-sm rounded-lg p-3 whitespace-pre-wrap ${
                  isSpecialApplicant
                    ? specialStyle.soft
                    : "bg-base-200/50 text-base-content/70"
                }`}
              >
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Cover Letter File */}
          {app.coverLetterFile?.url && (
            <a
              href={app.coverLetterFile.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-xs gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> View Cover Letter Attachment
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Links & Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
            <a
              href={`mailto:${a?.email}`}
              className="btn btn-primary btn-xs gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> {a?.email || "Email"}
            </a>
            {a?.resumeUrl && (
              <a
                href={a.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Resume
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {a?.linkedinUrl && (
              <a
                href={a.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-xs gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" /> LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Link
              to={`/profile/${a?._id}`}
              className="btn btn-ghost btn-xs gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Full Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const JobApplicants = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          API.get(`/jobs/${id}`),
          API.get(`/jobs/${id}/applicants`),
        ]);
        setJob(jobRes.data.job);
        setApplications(appRes.data.applications);
      } catch {
        toast.error("Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const statusCounts = applications.reduce(
    (counts, app) => ({
      ...counts,
      [app.status]: (counts[app.status] || 0) + 1,
    }),
    {},
  );

  const filteredApplications = applications
    .filter((app) => !filterStatus || app.status === filterStatus)
    .filter((app) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      const a = app.applicant || {};
      return [
        a.name,
        a.email,
        a.city,
        a.state,
        a.profession,
        a.subject,
        a.educationLevel,
        ...(a.skills || []),
        ...(a.qualifications || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "experience") {
        return (b.applicant?.experience || 0) - (a.applicant?.experience || 0);
      }
      if (sortBy === "name") {
        return (a.applicant?.name || "").localeCompare(b.applicant?.name || "");
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await API.put(`/jobs/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
      toast.success(`Application marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleKanbanStatusChange = (updatedApplication) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app._id !== updatedApplication._id) return app;
        const hasPopulatedApplicant =
          updatedApplication.applicant &&
          typeof updatedApplication.applicant === "object" &&
          updatedApplication.applicant.name;
        return {
          ...app,
          ...updatedApplication,
          applicant: hasPopulatedApplicant
            ? updatedApplication.applicant
            : app.applicant,
        };
      })
    );
  };

  const getExportName = (extension) => {
    const safeTitle = (job?.title || "job-applicants")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const suffix = filterStatus ? `-${filterStatus}` : "";
    return `${safeTitle || "job-applicants"}${suffix}-${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
  };

  const handleExportExcel = (scope = "filtered") => {
    const source = scope === "all" ? applications : filteredApplications;
    if (!source.length) {
      toast.error("No applicants to export");
      return;
    }

    const rows = getApplicantRows(source);
    const workplaceLabel = getJobWorkplaceLabel(job);
    const html = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <h2>${escapeHtml(job.title)} - Applicants</h2>
          <p>${escapeHtml(job.institutionName || "")} ${escapeHtml(workplaceLabel)}</p>
          ${buildApplicantTable(rows)}
        </body>
      </html>
    `;
    downloadFile(
      html,
      getExportName("xls"),
      "application/vnd.ms-excel;charset=utf-8",
    );
    toast.success("Excel record generated");
  };

  const handleExportPdf = (scope = "filtered") => {
    const source = scope === "all" ? applications : filteredApplications;
    if (!source.length) {
      toast.error("No applicants to export");
      return;
    }

    const rows = getApplicantRows(source);
    const workplaceLabel = getJobWorkplaceLabel(job);
    const reportWindow = window.open("", "_blank", "width=1100,height=800");
    if (!reportWindow) {
      toast.error("Allow popups to generate PDF");
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(job.title)} Applicants</title>
          <style>
            body { font-family: Arial, sans-serif; color: #26332f; margin: 28px; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            .meta { color: #66736f; margin-bottom: 18px; }
            .summary { display: flex; gap: 10px; flex-wrap: wrap; margin: 18px 0; }
            .box { border: 1px solid #d5ebe8; border-radius: 8px; padding: 10px 12px; }
            .box strong { display: block; font-size: 18px; color: #147F83; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #edf7f6; text-align: left; }
            th, td { border: 1px solid #d5ebe8; padding: 7px; vertical-align: top; }
            @media print { button { display: none; } body { margin: 12px; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:8px 12px;">Print / Save PDF</button>
          <h1>${escapeHtml(job.title)} - Applicant Report</h1>
          <div class="meta">
            ${escapeHtml(job.institutionName || "")} · ${escapeHtml(workplaceLabel)}
            · Generated ${escapeHtml(formatDate(new Date()))}
          </div>
          <div class="summary">
            <div class="box"><strong>${applications.length}</strong>Total</div>
            <div class="box"><strong>${statusCounts.shortlisted || 0}</strong>Shortlisted</div>
            <div class="box"><strong>${statusCounts.selected || 0}</strong>Selected</div>
            <div class="box"><strong>${statusCounts.rejected || 0}</strong>Rejected</div>
          </div>
          ${buildApplicantTable(rows)}
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    setTimeout(() => reportWindow.print(), 300);
    toast.success("PDF report opened");
  };

  const getVisibleEmails = () =>
    filteredApplications
      .map((app) => app.applicant?.email)
      .filter(Boolean);

  const handleCopyEmails = async () => {
    const emails = getVisibleEmails();
    if (!emails.length) {
      toast.error("No emails in current list");
      return;
    }
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      toast.success(`Copied ${emails.length} email${emails.length !== 1 ? "s" : ""}`);
    } catch {
      toast.error("Clipboard access blocked by browser");
    }
  };

  const handleEmailApplicants = () => {
    const emails = getVisibleEmails();
    if (!emails.length) {
      toast.error("No emails in current list");
      return;
    }
    window.location.href = `mailto:?bcc=${encodeURIComponent(
      emails.join(","),
    )}&subject=${encodeURIComponent(`Update for ${job.title}`)}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="h-8 w-48 skeleton rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card border border-base-300/50 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full skeleton"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton rounded"></div>
                  <div className="h-3 w-48 skeleton rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>Job not found</p>
        <Link to="/jobs" className="btn btn-primary mt-4">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <Link
        to={`/jobs/${id}`}
        className="text-primary text-sm flex items-center gap-1 mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Job
      </Link>

      <div className="card bg-base-100 border border-base-300/50 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold font-heading">{job.title}</h1>
            <p className="text-sm text-base-content/60 mt-0.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {job.institutionName} · {getJobWorkplaceLabel(job)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-base-content/50">
              <UserCheck className="w-4 h-4" />
              {applications.length} applicant{applications.length !== 1 && "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total", value: applications.length, icon: Users },
          { label: "Reviewed", value: statusCounts.reviewed || 0, icon: Eye },
          { label: "Shortlisted", value: statusCounts.shortlisted || 0, icon: Clock },
          { label: "Selected", value: statusCounts.selected || 0, icon: CheckCircle },
          { label: "Rejected", value: statusCounts.rejected || 0, icon: XCircle },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() =>
              setFilterStatus(stat.label === "Total" ? "" : stat.label.toLowerCase())
            }
            className={`rounded-xl border p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
              (stat.label === "Total" && !filterStatus) ||
              filterStatus === stat.label.toLowerCase()
                ? "border-primary/40 bg-primary/5"
                : "border-base-300/60 bg-base-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-base-content/45">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      <div data-filter-panel className="card bg-base-100 border border-base-300/60 p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-9 h-10"
              placeholder="Search applicants, skills, location..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered select-sm h-10"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="experience">Most experience</option>
              <option value="name">Name A-Z</option>
            </select>
            <button onClick={handleCopyEmails} className="btn btn-outline btn-sm gap-1.5">
              <Mail className="w-4 h-4" /> Copy emails
            </button>
            <button onClick={handleEmailApplicants} className="btn btn-outline btn-sm gap-1.5">
              <Send className="w-4 h-4" /> Email list
            </button>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-primary btn-sm gap-1.5">
                <Download className="w-4 h-4" /> Export
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-10 w-56 p-2 shadow-xl border border-base-300"
              >
                <li>
                  <button onClick={() => handleExportExcel("filtered")}>
                    <FileSpreadsheet className="w-4 h-4" />
                    Current list Excel
                  </button>
                </li>
                <li>
                  <button onClick={() => handleExportPdf("filtered")}>
                    <Printer className="w-4 h-4" />
                    Current list PDF
                  </button>
                </li>
                <li>
                  <button onClick={() => handleExportExcel("all")}>
                    <FileSpreadsheet className="w-4 h-4" />
                    All applicants Excel
                  </button>
                </li>
                <li>
                  <button onClick={() => handleExportPdf("all")}>
                    <Printer className="w-4 h-4" />
                    All applicants PDF
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle + Filter */}
      <div data-filter-panel className="flex items-center justify-between gap-3 mb-4 flex-wrap rounded-xl border border-base-300/60 bg-base-100 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`btn btn-xs ${
              viewMode === "list" ? "btn-primary" : "btn-ghost"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`btn btn-xs ${
              viewMode === "kanban" ? "btn-primary" : "btn-ghost"
            }`}
          >
            Kanban
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-base-content/60">
            Filter:
          </span>
          {[
            "",
            "applied",
            "reviewed",
            "shortlisted",
            "selected",
            "rejected",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`badge badge-sm cursor-pointer transition-all ${
                filterStatus === status
                  ? "badge-primary"
                  : status
                  ? `${statusColors[status]} hover:opacity-70`
                  : "badge-ghost hover:badge-primary"
              }`}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Applications */}
      {viewMode === "kanban" ? (
        <ApplicantKanban
          applications={filteredApplications}
          onStatusChange={handleKanbanStatusChange}
        />
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16">
          <Eye className="w-16 h-16 mx-auto text-base-content/15 mb-4" />
          <p className="text-base-content/40 font-medium">
            No matching applications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <ApplicantCard
              key={app._id}
              app={app}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
