import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "./store/authStore";
import { SocketProvider } from "./context/SocketContext";
import {
  APP_THEME_CHANGE_EVENT,
  applyAppTheme,
  getStoredThemeMode,
} from "./utils/theme";
import {
  APP_FONT_CHANGE_EVENT,
  applyAppFont,
  getStoredFontMode,
} from "./utils/font";

// Layout Components
import Sidebar from "./components/common/Sidebar";
import RightSidebar from "./components/common/RightSidebar";
import BottomNav from "./components/common/BottomNav";
import MobileHeader from "./components/common/MobileHeader";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpScreen from "./pages/OtpScreen";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobApplicants from "./pages/JobApplicants";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import CreateStory from "./pages/CreateStory";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import SavedPosts from "./pages/SavedPosts";
import Settings from "./pages/Settings";
import LoginHistory from "./pages/LoginHistory";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";
import BlockedScreen from "./pages/BlockedScreen";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminContentDetail from "./pages/admin/AdminContentDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLoginRecords from "./pages/admin/AdminLoginRecords";

function App() {
  const { fetchMe, isAuthenticated, user } = useAuthStore();
  const [appInitialized, setAppInitialized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isBlocked = user?.isBlocked;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    const syncTheme = () => applyAppTheme(getStoredThemeMode());
    const syncFont = () => applyAppFont(getStoredFontMode());
    syncTheme();
    syncFont();
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    window.addEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
    window.addEventListener(APP_FONT_CHANGE_EVENT, syncFont);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("storage", syncFont);
    if (!mediaQuery) {
      return () => {
        window.removeEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
        window.removeEventListener(APP_FONT_CHANGE_EVENT, syncFont);
        window.removeEventListener("storage", syncTheme);
        window.removeEventListener("storage", syncFont);
      };
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncTheme);
      return () => {
        mediaQuery.removeEventListener("change", syncTheme);
        window.removeEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
        window.removeEventListener(APP_FONT_CHANGE_EVENT, syncFont);
        window.removeEventListener("storage", syncTheme);
        window.removeEventListener("storage", syncFont);
      };
    }
    mediaQuery.addListener?.(syncTheme);
    return () => {
      mediaQuery.removeListener?.(syncTheme);
      window.removeEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
      window.removeEventListener(APP_FONT_CHANGE_EVENT, syncFont);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("storage", syncFont);
    };
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          await fetchMe();
        } catch {
          // Invalid token - will redirect to login
        }
      }
      setAppInitialized(true);
    };
    initApp();
  }, [fetchMe]);

  if (!appInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon
              icon={faUserGraduate}
              className="w-8 h-8 text-white"
              fontSize={24}
            />
          </div>
          <h1 className="text-3xl font-bold text-primary">ShortJob</h1>
          <p className="mt-2 text-base-content/60">
            Where Careers Begin
          </p>
          <div className="mt-4 loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-base-100">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1E293B",
                color: "#F0F4FF",
                borderRadius: "12px",
              },
            }}
          />

          <Routes>
            {/* Public routes (no layout) */}
            <Route
              path="/"
              element={
                isBlocked ? (
                  <Navigate to="/blocked" />
                ) : isAuthenticated ? (
                  <Navigate to="/feed" />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path="/login"
              element={
                isBlocked ? (
                  <Navigate to="/blocked" />
                ) : isAuthenticated ? (
                  <Navigate to="/feed" />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isBlocked ? (
                  <Navigate to="/blocked" />
                ) : isAuthenticated ? (
                  <Navigate to="/feed" />
                ) : (
                  <Register />
                )
              }
            />
            <Route
              path="/otp-verify"
              element={
                isBlocked ? (
                  <Navigate to="/blocked" />
                ) : isAuthenticated ? (
                  <Navigate to="/feed" />
                ) : (
                  <OtpScreen />
                )
              }
            />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/blocked" element={<BlockedScreen />} />

            {/* Protected routes (with layout) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col h-screen overflow-hidden bg-base-100">
                    <MobileHeader />
                    <div className="flex flex-1 min-h-0">
                      <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggle={toggleSidebar}
                      />
                      <main className="app-main flex-1 overflow-y-auto scroll-smooth">
                        <Routes>
                          <Route path="/feed" element={<Feed />} />
                          <Route
                            path="/posts/create"
                            element={<CreatePost />}
                          />
                          <Route
                            path="/stories/create"
                            element={<CreateStory />}
                          />
                          <Route path="/explore" element={<Explore />} />
                          <Route path="/jobs" element={<Jobs />} />
                          <Route path="/jobs/create" element={<CreateJob />} />
                          <Route path="/jobs/:id/edit" element={<EditJob />} />
                          <Route path="/jobs/:id" element={<JobDetail />} />
                          <Route
                            path="/jobs/:id/applicants"
                            element={<JobApplicants />}
                          />
                          <Route path="/profile/:id" element={<Profile />} />
                          <Route
                            path="/edit-profile"
                            element={<EditProfile />}
                          />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/chat/:id" element={<Chat />} />
                          <Route
                            path="/notifications"
                            element={<Notifications />}
                          />
                          <Route path="/saved" element={<SavedPosts />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route
                            path="/settings/login-history"
                            element={<LoginHistory />}
                          />
                          <Route path="/post/:id" element={<PostDetail />} />
                          <Route path="/post/:id/edit" element={<EditPost />} />

                          {/* Admin routes */}
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/users" element={<AdminUsers />} />
                          <Route
                            path="/admin/users/:id"
                            element={<AdminUserDetail />}
                          />
                          <Route path="/admin/queue" element={<AdminQueue />} />
                          <Route
                            path="/admin/content/:type/:id"
                            element={<AdminContentDetail />}
                          />
                          <Route
                            path="/admin/settings"
                            element={<AdminSettings />}
                          />
                          <Route
                            path="/admin/login-records"
                            element={<AdminLoginRecords />}
                          />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <RightSidebar />
                    </div>
                    <BottomNav />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
