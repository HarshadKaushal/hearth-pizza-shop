import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="page auth-page">
      <section className="auth-aside">
        <p className="kicker">Account</p>
        <h1>Create an account.</h1>
        <p className="lede">A user id is generated for you. Orders you place after this are filed under that id.</p>
      </section>
      <Suspense fallback={<p className="hint">Loading…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
