import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect blocked users to the suspended screen
  if (user?.isBlocked) {
    return <Navigate to="/blocked" replace />;
  }

  if (!Number.isFinite(Number(user?.age)) || Number(user.age) < 18) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
