import Link from "next/link";
import { Builder } from "@/components/Builder";
import { fetchIngredients } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BuildPage() {
  const ingredients = await fetchIngredients();

  return (
    <div className="page">
      <section className="intro">
        <p className="kicker">Build</p>
        <h1>One crust, one sauce, one cheese.</h1>
        <p className="lede">
          Toppings stop at eight. The number on this page is a preview. The kitchen charges the
          total the server computes when you place the order.{" "}
          <Link href="/">Back to the menu</Link>
        </p>
      </section>
      {ingredients === null ? (
        <p className="notice" role="status">
          The menu cannot be loaded. Start the API on port 3001 and refresh this page.
        </p>
      ) : (
        <Builder ingredients={ingredients} />
      )}
    </div>
  );
}
