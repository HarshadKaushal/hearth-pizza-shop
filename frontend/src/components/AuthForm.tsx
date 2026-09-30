"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveToken } from "@/lib/auth";
import { apiBase } from "@/lib/money";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signup = mode === "signup";
  const next = search.get("next") || "/account";
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/auth/${signup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(signup ? { name: name.trim() } : {}),
        }),
      });
      const body = (await response.json()) as {
        token?: string;
        message?: string | string[];
      };


      
      
      console.log("login reponse",{status: response.status, body});



      
      if (!response.ok || !body.token) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "That account could not be used.");
        setPending(false);
        return;
      }
      saveToken(body.token);
      router.push(next);
      router.refresh();
    } catch {
      setError("The counter could not be reached. Check that the API is running.");
      setPending(false);
    }
  }

  return (
    <form className="auth-panel" onSubmit={(event) => void submit(event)}>
      <h2>{signup ? "Create your account" : "Log in"}</h2>
      {signup ? (
        <label className="field">
          Name
          <input
            required
            autoComplete="name"
            minLength={2}
            maxLength={80}
            placeholder="Ava Stone"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      ) : null}
      <label className="field">
        Email
        <input
          required
          autoFocus
          type="email"
          autoComplete="email"
          maxLength={120}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="field">
        Password
        <span className="password-row">
          <input
            required
            type={showPassword ? "text" : "password"}
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={8}
            maxLength={72}
            placeholder={signup ? "At least 8 characters" : "Your password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="button" className="text-button" onClick={() => setShowPassword((current) => !current)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : signup ? "Create account" : "Log in"}
      </button>
      <p className="hint">
        {signup ? (
          <>
            Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
