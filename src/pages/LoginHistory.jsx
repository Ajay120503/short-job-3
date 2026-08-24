import { useEffect, useState } from "react";
import { Camera, Clock, Laptop, MapPin, ShieldCheck } from "lucide-react";
import API from "../utils/axios";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

const LoginHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/users/me/login-history");
        setRecords(data.records || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Login History
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Your security verification records are visible only to you and platform admins.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
          <Camera className="w-10 h-10 text-base-content/20 mx-auto mb-3" />
          <p className="font-semibold text-base-content/55">
            No login audit records yet
          </p>
          <p className="text-sm text-base-content/40 mt-1">
            Records appear here only after login security verification is enabled.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record._id}
              className="rounded-2xl border border-base-300 bg-base-100 p-3 flex gap-3"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-base-200 shrink-0">
                {record.photo?.url ? (
                  <img
                    src={record.photo.url}
                    alt="Login verification"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {formatDate(record.loginAt)}
                </p>
                <p className="text-xs text-base-content/55 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[record.location?.city, record.location?.state]
                    .filter(Boolean)
                    .join(", ") || "Approximate location unavailable"}
                </p>
                <p className="text-xs text-base-content/55 mt-1 flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5" />
                  {record.device?.browser || "Unknown device"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginHistory;
