import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="max-w-3xl mx-auto p-6 text-center py-20">
    <h1 className="text-6xl font-bold text-primary">404</h1>
    <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
    <p className="text-base-content/50 mt-2">
      The page you're looking for doesn't exist.
    </p>
    <Link to="/feed" className="btn btn-primary mt-6">
      Go to Feed
    </Link>
  </div>
);
export default NotFound;
