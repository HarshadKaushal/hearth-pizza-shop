import { KitchenDesk } from "@/components/KitchenDesk";

export default function KitchenPage() {
  return (
    <div className="page">
      <section className="intro">
        <p className="kicker">Kitchen</p>
        <h1>Tickets, in the order they arrived.</h1>
        <p className="lede">
          Received can start preparing or be cancelled. Preparing can be marked ready. Ready can be
          completed. Nothing moves backward.
        </p>
      </section>
      <KitchenDesk />
    </div>
  );
}
