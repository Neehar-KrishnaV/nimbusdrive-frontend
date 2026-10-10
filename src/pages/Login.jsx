import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Your backend returns the JWT as a plain string.
      const token =
        typeof response.data === "string"
          ? response.data
          : response.data.token;

      if (!token) {
        throw new Error("The server did not return a JWT token.");
      }

      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : null) ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          NimbusDrive
        </h1>

        <p className="mb-8 text-center text-slate-400">
          Sign in to access your files
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <label className="mb-2 block text-sm text-slate-300">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
        />

        <label className="mb-2 block text-sm text-slate-300">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;