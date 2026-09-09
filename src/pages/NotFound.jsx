import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="max-w-xl mx-auto px-5 py-16 sm:py-24 text-center">
    <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-10 shadow-sm">
    <p className="text-7xl font-bold tracking-tight text-primary" aria-hidden="true">404</p>
    <h1 className="text-2xl font-bold mt-6">Page not found</h1>
    <p className="text-base-content/65 mt-3 leading-relaxed">
      This link may be outdated, or the page may have moved. Head back to your feed to keep exploring.
    </p>
    <Link to="/feed" className="btn btn-primary mt-6 w-full sm:w-auto">
      Go to Feed
    </Link>
    </div>
  </div>
);
export default NotFound;
