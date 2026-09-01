"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Login failed." });
        return;
      }
      // Refresh so the server re-renders the admin panel (session cookie is set).
      window.location.reload();
    } catch {
      setStatus({ kind: "error", message: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-logo">
          <Image src="/icon.png" alt="One Way Nepal" width={34} height={34} />
          <div>
            Admin <span>· One Way Nepal</span>
          </div>
        </div>
        <div className="admin-header-right">
          <Link className="admin-btn" href="/">
            View site
          </Link>
        </div>
      </header>

      <div className="admin-login">
        <h1>Admin sign in</h1>
        <p>Enter your administrator credentials to continue.</p>
        <form onSubmit={submit}>
          <div className="admin-field">
            <label>Username</label>
            <input
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {status && (
            <div className={`admin-status ${status.kind}`} role="status">
              {status.message}
            </div>
          )}

          <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}