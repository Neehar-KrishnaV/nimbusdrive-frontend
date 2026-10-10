import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Files() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sharingFile, setSharingFile] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/files");
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load files:", err);
      setError("Unable to load your files. Check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes == null || bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / 1024 ** index).toFixed(2)} ${units[index]}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString();
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/files/upload", formData);

      setMessage("File uploaded successfully.");
      setSelectedFile(null);
      event.target.reset();

      await loadFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      setError(
        err.response?.data?.message ||
          "Upload failed. Please check your backend API."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
  try {
    const response = await api.get(
      `/files/download/${file.id}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.fileName || "downloaded-file";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed:", err);
      setError("Download failed. Check the download API endpoint.");
    }
  };

  const handleDelete = async (file) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.fileName}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/files/${file.id}`);

      setFiles((currentFiles) =>
        currentFiles.filter((item) => item.id !== file.id)
      );

      setMessage("File deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Deletion failed. Check the delete API endpoint.");
    }
  };

  

  const filteredFiles = files.filter((file) =>
    (file.fileName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleShare = async (file) => {
  try {
    setSharingFile(file);
    setShareUrl("");
    setCopySuccess(false);
    setShareLoading(true);
    setError("");

    const response = await api.post(`/files/share/${file.id}`);

    const url = response.data.replace("Share Link: ", "").trim();

    setShareUrl(url);
  } catch (err) {
    console.error("Sharing failed:", err);
    setError("Failed to generate share link. Please try again.");
    setSharingFile(null);
  } finally {
    setShareLoading(false);
  }
};

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);

    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  } catch (err) {
    console.error("Copy failed:", err);
    setError("Unable to copy link. Please copy it manually.");
  }
};
const handleRevokeShare = async () => {
  if (!sharingFile) return;

  const confirmed = window.confirm(
    `Are you sure you want to disable sharing for "${sharingFile.fileName}"?`
  );

  if (!confirmed) return;

  try {
    setShareLoading(true);
    setError("");

    await api.delete(`/files/share/${sharingFile.id}`);

    setShareUrl("");
    setCopySuccess(false);
    setSharingFile(null);

    alert("Sharing has been disabled successfully.");
  } catch (err) {
    console.error("Revoke sharing failed:", err);
    setError("Failed to disable sharing. Please try again.");
  } finally {
    setShareLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/dashboard" className="text-2xl font-bold">
            Nimbus<span className="text-blue-500">Drive</span>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="mt-2 text-slate-400">
            Upload, search, download, and manage your documents.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-green-800 bg-green-950 p-4 text-green-300">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Upload a File</h2>

          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <input
              type="file"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] || null)
              }
              className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
            />

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Documents</h2>
              <p className="mt-1 text-sm text-slate-400">
                {files.length} files
              </p>
            </div>

            <input
              type="search"
              placeholder="Search files..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {loading ? (
            <p className="p-10 text-center text-slate-400">
              Loading files...
            </p>
          ) : filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-3 text-4xl">📁</div>
              <h3 className="font-semibold">No files found</h3>
              <p className="mt-2 text-sm text-slate-400">
                Upload a file or try another search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">File Name</th>
                    <th className="px-6 py-4 font-medium">Size</th>
                    <th className="px-6 py-4 font-medium">Uploaded</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="max-w-xs truncate px-6 py-4 font-medium">
                        📄 {file.fileName}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                        {formatBytes(file.fileSize)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                        {formatDate(file.uploadedAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDownload(file)}
                            className="font-medium text-blue-400 hover:text-blue-300"
                          >
                            Download
                          </button>

                          <button
                            onClick={() => handleDelete(file)}
                            className="font-medium text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleShare(file)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            Share
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      {sharingFile && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Share file
        </h2>

        <button
          onClick={() => {
            setSharingFile(null);
            setShareUrl("");
            setCopySuccess(false);
          }}
          className="text-2xl text-slate-400 hover:text-white"
          aria-label="Close sharing dialog"
        >
          &times;
        </button>
      </div>

      <div className="mb-5 rounded-xl bg-slate-800 p-4">
        <p className="mb-1 text-sm text-slate-400">
          Selected file
        </p>

        <p className="break-all font-medium text-white">
          {sharingFile.fileName}
        </p>
      </div>

      {shareLoading ? (
        <p className="py-4 text-center text-slate-300">
          Generating share link...
        </p>
      ) : shareUrl ? (
        <>
          <label className="mb-2 block text-sm text-slate-300">
            Anyone with this link can access the shared file.
          </label>

          <input
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="mb-4 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-3 text-sm text-white outline-none"
          />

          <button
            onClick={handleCopyLink}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {copySuccess ? "✓ Link copied!" : "Copy link"}
          </button>
          <button
            onClick={handleRevokeShare}
            disabled={shareLoading}
            className="mt-3 w-full rounded-lg border border-red-500/30 px-4 py-3 font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
  {shareLoading ? "Processing..." : "Disable Sharing"}
</button>
        </>
      ) : (
        <p className="text-sm text-red-400">
          Could not generate the share link. Please close and try again.
        </p>
      )}

      <button
        onClick={() => {
          setSharingFile(null);
          setShareUrl("");
          setCopySuccess(false);
        }}
        className="mt-3 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-300 transition hover:bg-slate-800"
      >
        Close
      </button>

    </div>
  </div>
)}
    </div>
    
  );
}

export default Files;