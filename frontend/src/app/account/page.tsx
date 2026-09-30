import { AccountBoard } from "@/components/AccountBoard";

export default function AccountPage() {
  return (
    <div className="page">
      <section className="intro">
        <p className="kicker">Your orders</p>
        <h1>Pizzas filed under your account.</h1>
        <p className="lede">Only orders placed while you were logged in show up here.</p>
      </section>
      <AccountBoard />
    </div>
  );
}
