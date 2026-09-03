import {
  Award,
  Briefcase,
  FileText,
  Megaphone,
  Sparkles,
  CircleHelp,
  ChartNoAxesColumn,
  CalendarDays,
  Paperclip,
  PartyPopper,
  MessagesSquare,
} from "lucide-react";

export const postTypes = [
  {
    value: "general",
    label: "General",
    icon: FileText,
  },
  {
    value: "job",
    label: "Job",
    icon: Briefcase,
  },
  {
    value: "announcement",
    label: "Announcement",
    icon: Megaphone,
  },
  {
    value: "achievement",
    label: "Achievement",
    icon: Award,
  },
  {
    value: "noticeboard",
    label: "Notice",
    icon: Sparkles,
    requiresInstitution: true,
  },
  { value: "question", label: "Ask", icon: CircleHelp },
  { value: "poll", label: "Poll", icon: ChartNoAxesColumn },
  { value: "event", label: "Event", icon: CalendarDays },
  { value: "resource_share", label: "Share", icon: Paperclip },
  { value: "celebration", label: "Cheer", icon: PartyPopper },
  { value: "discussion", label: "Discuss", icon: MessagesSquare },
];

export const getAvailablePostTypes = (user) =>
  user ? postTypes : postTypes.filter((type) => !type.requiresInstitution);
