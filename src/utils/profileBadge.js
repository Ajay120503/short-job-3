/**
 * 🔔 PROFILE BADGE UTILITY
 *
 * Powered by the profile customization system.
 * Use this to display the authenticated user's badge in the top navbar (and anywhere else needed).
 */
import { getUserSignal } from "./userSignals";

export const getProfileBadge = (user) => {
  if (!user) return null     // No user? No badge
  return getUserSignal(user?.profileTheme?.variant) // 🔥 Get the user's badge based on their profile theme variant
}
export const getAdminBadge = () => ({
  label: "Pro",
  className: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border border-amber-300/50 shadow-sm shadow-amber-500/20 rounded-full px-2 py-0.5 text-[10px] font-bold",
  isAdmin: true,
});