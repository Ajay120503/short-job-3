import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, MessageCircle, Users, Edit3 } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import UserAvatar from "./UserAvatar";

export default function MemberOverview({ user }) {
  const { messageCount = 0 } = useSocket() || {};
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const actions = [
    { to: "/jobs", icon: Briefcase, title: "Find your next job", detail: "Explore work that fits your day", tone: "text-primary bg-primary/10" },
    { to: "/chat", icon: MessageCircle, title: "Your conversations", detail: messageCount ? `${messageCount} unread messages` : "Pick up where you left off", tone: "text-info bg-info/10" },
    { to: "/explore", icon: Users, title: "Grow your network", detail: "Meet people with shared interests", tone: "text-success bg-success/10" },
  ];
  return (
    <section aria-label="Your dashboard" className="mb-7 space-y-4">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">Your ShortJob space</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0"><h2 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {firstName}.</h2><p className="mt-2 text-sm leading-6 text-base-content/65">A new connection or opportunity could be waiting for you.</p></div>
          <Link to={`/profile/${user?._id}`} aria-label="View your profile" className="hidden shrink-0 sm:block"><UserAvatar user={user} size={52} showPresence={false} showAdminBadge={false} /></Link>
        </div>
        <Link to="/posts/create" className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm text-base-content/65 transition-colors hover:border-primary/40 hover:bg-primary/5"><Edit3 size={17} className="shrink-0 text-primary" /><span className="flex-1">Share an update with your network…</span><ArrowUpRight size={17} className="shrink-0" /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{actions.map(({ to, icon: Icon, title, detail, tone }) => (
        <Link key={to} to={to} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 transition-colors hover:border-primary/40 sm:block">
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span>
          <div className="min-w-0 flex-1 sm:mt-3"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-base-content/60">{detail}</p></div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-base-content/40 group-hover:text-primary sm:hidden" />
        </Link>
      ))}</div>
    </section>
  );
}
