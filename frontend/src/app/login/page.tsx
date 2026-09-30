import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="page auth-page">
      <section className="auth-aside">
        <p className="kicker">Account</p>
        <h1>Welcome back.</h1>
        <p className="lede">Log in to place an order and open the pizzas already filed under your name.</p>
        <ul className="auth-points">
          <li>See every pizza you ordered, newest first.</li>
          <li>The kitchen still gets your name and phone on the ticket.</li>
          <li>Your password stays on the server as a hash, not as plain text.</li>
        </ul>
      </section>
      <Suspense fallback={<p className="hint">Loading…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
