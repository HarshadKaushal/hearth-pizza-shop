import { CheckoutForm } from "@/components/CheckoutForm";
import { fetchIngredients } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const ingredients = await fetchIngredients();

  return (
    <div className="page">
      <section className="intro">
        <p className="kicker">Checkout</p>
        <h1>Send it to the kitchen.</h1>
        <p className="lede">Pickup needs a name and a 10-digit phone number. Delivery also needs an address.</p>
      </section>
      {ingredients === null ? (
        <p className="notice" role="status">
          The menu cannot be loaded, so the total cannot be checked. Start the API and refresh.
        </p>
      ) : (
        <CheckoutForm ingredients={ingredients} />
      )}
    </div>
  );
}
