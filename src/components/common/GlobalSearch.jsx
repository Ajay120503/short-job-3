import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  FileText,
  Home,
  LoaderCircle,
  MessageCircle,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import API from "../../utils/axios";
import UserAvatar from "./UserAvatar";

const APP_DESTINATIONS = [
  {
    title: "Feed",
    subtitle: "Posts from your community",
    path: "/feed",
    icon: Home,
  },
  {
    title: "Explore people",
    subtitle: "Discover users and profiles",
    path: "/explore",
    icon: User,
  },
  {
    title: "Jobs",
    subtitle: "Find nearby opportunities",
    path: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Messages",
    subtitle: "Open your conversations",
    path: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    subtitle: "View your activity alerts",
    path: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    subtitle: "Manage your account",
    path: "/settings",
    icon: Settings,
  },
];

const getPostTitle = (post) => {
  const text = String(post.text || "").trim();
  return text
    ? text.length > 82
      ? `${text.slice(0, 82)}…`
      : text
    : `${post.type || "Post"} post`;
};

const GlobalSearch = ({ className = "" }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({ users: [], jobs: [], posts: [] });

  const pageResults = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return APP_DESTINATIONS.filter((item) => {
      const searchable = `${item.title} ${item.subtitle}`.toLowerCase();
      return words.every((word) => searchable.includes(word));
    });
  }, [query]);

  const hasResults =
    pageResults.length ||
    results.users.length ||
    results.jobs.length ||
    results.posts.length;

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get("/search", {
          params: { q: searchTerm },
          signal: controller.signal,
        });
        setResults(data.results || { users: [], jobs: [], posts: [] });
      } catch (requestError) {
        if (requestError.code !== "ERR_CANCELED") {
          setResults({ users: [], jobs: [], posts: [] });
          setError("Search is temporarily unavailable");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults({ users: [], jobs: [], posts: [] });
    setError("");
  };

  const openResult = (path) => {
    closeSearch();
    navigate(path);
  };

  const handleQueryChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults({ users: [], jobs: [], posts: [] });
      setError("");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn btn-ghost btn-circle btn-sm hover:bg-primary/10 ${className}`}
        aria-label="Open global search"
        title="Search ShortJob"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && createPortal(
        <div
          className="z-app-global-search fixed inset-0 flex items-start justify-center bg-neutral/45 backdrop-blur-sm sm:px-3 sm:pt-[8vh]"
          onMouseDown={closeSearch}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            onMouseDown={(event) => event.stopPropagation()}
            className="flex h-[100dvh] max-h-none w-full max-w-none flex-col overflow-hidden border-0 bg-base-100 shadow-2xl sm:h-auto sm:max-h-[min(760px,88vh)] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-base-300"
          >
            <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-base-300 px-4 pt-[env(safe-area-inset-top)] sm:h-14 sm:pt-0">
              {loading ? (
                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Search className="h-5 w-5 text-base-content/45" />
              )}
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search people, jobs, posts, or pages..."
                className="min-w-0 flex-1 bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/35 sm:text-base"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-72 flex-1 overflow-y-auto p-3 sm:p-4">
              {!query.trim() ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="font-semibold">Search all of ShortJob</p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-base-content/45">
                    Find an exact user, opportunity, post, or application page.
                  </p>
                </div>
              ) : query.trim().length < 2 ? (
                <div className="flex min-h-64 items-center justify-center text-sm text-base-content/45">
                  Type at least 2 characters
                </div>
              ) : error ? (
                <div className="flex min-h-64 items-center justify-center text-sm text-error">
                  {error}
                </div>
              ) : !loading && !hasResults ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <p className="font-semibold">No exact matches found</p>
                  <p className="mt-1 text-xs text-base-content/45">
                    Check the spelling or try fewer words.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {pageResults.length > 0 && (
                    <ResultGroup title="Pages">
                      {pageResults.map((item) => (
                        <PageResult
                          key={item.path}
                          item={item}
                          onOpen={openResult}
                        />
                      ))}
                    </ResultGroup>
                  )}
                  {results.users.length > 0 && (
                    <ResultGroup title="People">
                      {results.users.map((item) => (
                        <UserResult
                          key={item._id}
                          item={item}
                          onOpen={openResult}
                        />
                      ))}
                    </ResultGroup>
                  )}
                  {results.jobs.length > 0 && (
                    <ResultGroup title="Jobs">
                      {results.jobs.map((item) => (
                        <ContentResult
                          key={item._id}
                          icon={Briefcase}
                          title={item.title}
                          subtitle={[
                            item.institutionName,
                            item.workplaceName || item.workplaceCity,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                          path={`/jobs/${item._id}`}
                          onOpen={openResult}
                        />
                      ))}
                    </ResultGroup>
                  )}
                  {results.posts.length > 0 && (
                    <ResultGroup title="Posts">
                      {results.posts.map((item) => (
                        <ContentResult
                          key={item._id}
                          icon={FileText}
                          title={getPostTitle(item)}
                          subtitle={`${item.author?.name || "ShortJob user"} · ${item.type || "post"}`}
                          path={`/post/${item._id}`}
                          onOpen={openResult}
                        />
                      ))}
                    </ResultGroup>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      , document.body)}
    </>
  );
};

const ResultGroup = ({ title, children }) => (
  <section>
    <h3 className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-base-content/40">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </section>
);

const ResultButton = ({ children, path, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(path)}
    className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-base-300 hover:bg-base-200/70 focus-visible:border-primary/40 focus-visible:bg-primary/5 focus-visible:outline-none"
  >
    {children}
  </button>
);

const PageResult = ({ item, onOpen }) => {
  const Icon = item.icon;
  return (
    <ResultButton path={item.path} onOpen={onOpen}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {item.title}
        </span>
        <span className="block truncate text-xs text-base-content/45">
          {item.subtitle}
        </span>
      </span>
    </ResultButton>
  );
};

const UserResult = ({ item, onOpen }) => (
  <ResultButton path={`/profile/${item._id}`} onOpen={onOpen}>
    <UserAvatar user={item} size={40} showPresence={false} />
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold">{item.name}</span>
      <span className="block truncate text-xs capitalize text-base-content/45">
        {[item.role || item.category, item.institutionName, item.city]
          .filter(Boolean)
          .join(" · ") || "ShortJob user"}
      </span>
    </span>
  </ResultButton>
);

const ContentResult = ({ icon: Icon, title, subtitle, path, onOpen }) => (
  <ResultButton path={path} onOpen={onOpen}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200 text-primary">
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold">{title}</span>
      <span className="block truncate text-xs text-base-content/45">
        {subtitle}
      </span>
    </span>
  </ResultButton>
);

export default GlobalSearch;
