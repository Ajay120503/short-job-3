import { create } from "zustand";
import API from "../utils/axios";
import { isAdminUser } from "../utils/badgeUtils";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ── Auth helpers ──
  /** Convenience: is current user an admin? */
  isAdmin: () => isAdminUser(get().user),

  // ── Registration / OTP ──
  /**
   * Step 1 of OTP flow — initiate registration.
   * Sends name + email + password to backend.
   * Backend generates OTP, stores hash, sends email via Gmail SMTP.
   * Returns { email, message } on success.
   */
  initiateRegister: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/register/initiate", userData);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Step 2 of OTP flow — verify the 6-digit OTP sent to email.
   * On success the account is activated and a token is issued.
   */
  verifyOTP: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/register/verify-otp", {
        email,
        otp,
      });
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /** Resend OTP (rate-limited by backend: max 5/hour). */
  resendOTP: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/otp/resend", { email });
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to resend OTP";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Legacy register (fallback) ──
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/register", userData);
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Login ──
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/login", { email, password });
      if (data.requiresLoginAudit) {
        set({ isLoading: false });
        return data;
      }
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  completeLoginAudit: async (tempToken, formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/auth/login/complete-audit", formData, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Security verification failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Logout ──
  logout: async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false });
  },

  // ── Force logout (triggered by admin block / socket event) ──
  forceLogout: (reason) => {
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false, error: reason || null });
  },

  // ── Fetch current user ──
  fetchMe: async () => {
    try {
      const { data } = await API.get("/auth/me");
      set({ user: data.user, isAuthenticated: true });
      return data.user;
    } catch (error) {
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },

  // ── Update badges (self-selected during profile wizard / settings) ──
  updateBadges: async (badges) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.post("/users/me/badges", { badges });
      // Update local user with new badges
      set((state) => ({
        user: { ...state.user, badges: data.badges },
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update badges";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Update profile (general) ──
  updateProfile: async (updates, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await API.put(
        `/users/${get().user._id}`,
        updates,
        options
      );
      set((state) => ({
        user: { ...state.user, ...data.user },
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Delete account ──
  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await API.delete("/auth/me");
      localStorage.removeItem("accessToken");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete account";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // ── Misc ──
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
