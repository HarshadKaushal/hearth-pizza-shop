"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { saveToken } from "@/lib/auth";
import { apiBase } from "@/lib/money";
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@/lib/validation";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return mode === "signup" ? <SignupForm /> : <LoginForm />;
}

function SignupForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { token?: string; message?: string | string[] };
      if (!response.ok || !body.token) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "That account could not be used.");
        return;
      }
      saveToken(body.token);
      router.push(next);
      router.refresh();
    } catch {
      setError("The counter could not be reached. Check that the API is running.");
    }
  });

  return (
    <form className="auth-panel" noValidate onSubmit={onSubmit}>
      <h2>Create your account</h2>
      <label className="field">
        Name
        <input
          autoComplete="name"
          maxLength={80}
          placeholder="Ava Stone"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <span className="field-error" role="alert">
            {errors.name.message}
          </span>
        ) : null}
      </label>
      <EmailField error={errors.email?.message} registration={register("email")} />
      <PasswordField
        showPassword={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
        error={errors.password?.message}
        registration={register("password")}
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Create account"}
      </button>
      <p className="hint">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
      </p>
    </form>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { token?: string; message?: string | string[] };
      if (!response.ok || !body.token) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "That account could not be used.");
        return;
      }
      saveToken(body.token);
      router.push(next);
      router.refresh();
    } catch {
      setError("The counter could not be reached. Check that the API is running.");
    }
  });

  return (
    <form className="auth-panel" noValidate onSubmit={onSubmit}>
      <h2>Log in</h2>
      <EmailField error={errors.email?.message} registration={register("email")} />
      <PasswordField
        showPassword={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
        error={errors.password?.message}
        registration={register("password")}
        autoComplete="current-password"
        placeholder="Your password"
      />
      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Log in"}
      </button>
      <p className="hint">
        New here? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
      </p>
    </form>
  );
}

function EmailField({
  error,
  registration,
}: {
  error?: string;
  registration: UseFormRegisterReturn<"email">;
}) {
  return (
    <label className="field">
      Email
      <input
        autoFocus
        type="email"
        autoComplete="email"
        maxLength={120}
        placeholder="you@example.com"
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function PasswordField({
  showPassword,
  onToggle,
  error,
  registration,
  autoComplete,
  placeholder,
}: {
  showPassword: boolean;
  onToggle: () => void;
  error?: string;
  registration: UseFormRegisterReturn<"password">;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <label className="field">
      Password
      <span className="password-row">
        <input
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={72}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          {...registration}
        />
        <button type="button" className="text-button" onClick={onToggle}>
          {showPassword ? "Hide" : "Show"}
        </button>
      </span>
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
