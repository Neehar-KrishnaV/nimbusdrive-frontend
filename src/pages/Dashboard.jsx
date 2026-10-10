import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboard(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.response?.status === 401 ||
            err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const formatBytes = (bytes) => {
    if (bytes == null) return "0 B";
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-5 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  const usagePercentage =
    dashboard?.usagePercentage ??
    (dashboard?.storageLimit > 0
      ? (dashboard.storageUsed / dashboard.storageLimit) * 100
      : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              ☁
            </div>

            <div>
              <h1 className="text-xl font-bold">NimbusDrive</h1>
              <p className="text-xs text-slate-400">
                Your personal cloud storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-300 sm:block">
              {dashboard?.email}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">
          <h2 className="text-3xl font-bold">
            Welcome to NimbusDrive 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your files and monitor your cloud storage.
          </p>
        </div>

        {/* Storage Cards */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Storage Used */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Storage Used</p>

            <h3 className="mt-3 text-3xl font-bold">
              {formatBytes(dashboard?.storageUsed)}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Space occupied by your files
            </p>
          </div>

          {/* Storage Limit */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Storage Limit</p>

            <h3 className="mt-3 text-3xl font-bold">
              {formatBytes(dashboard?.storageLimit)}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your total available storage
            </p>
          </div>

          {/* File Count */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Files</p>

            <h3 className="mt-3 text-3xl font-bold">
              {dashboard?.fileCount ?? 0}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Files in your cloud drive
            </p>
          </div>

        </div>

        {/* Storage Progress */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                Storage Overview
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Track your storage consumption.
              </p>
            </div>

            <span className="text-sm font-semibold text-blue-400">
              {Number(usagePercentage || 0).toFixed(2)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, usagePercentage || 0)
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm text-slate-400">
            <span>{formatBytes(dashboard?.storageUsed)} used</span>
            <span>{formatBytes(dashboard?.storageLimit)} total</span>
          </div>

        </section>

        {/* Files Section */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold">My Files</h3>

              <p className="mt-2 text-sm text-slate-400">
                Access and manage your uploaded documents.
              </p>
            </div>

            <button
              onClick={() => navigate("/files")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              View My Files →
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <div className="text-4xl">📁</div>

            <p className="mt-3 font-medium">
              Your cloud files are ready
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Open My Files to upload, download, search, and share documents.
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;