import Link from "next/link";
import { fetchIngredients } from "@/lib/catalog";
import { formatCents } from "@/lib/money";
import { CATEGORY_LABEL, CATEGORY_ORDER, type Ingredient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const ingredients = await fetchIngredients();

  return (
    <div className="page">
      <section className="intro">
        <p className="kicker">The board</p>
        <h1>Every ingredient has a price before it hits the pie.</h1>
        <p className="lede">
          Crust, sauce, and cheese are chosen one each. Toppings are extra, up to eight. Size sets
          the base: $8, $12, or $16. What you see here is what the kitchen charges.{" "}
          <Link href="/build">Build a pizza</Link>.
        </p>
      </section>
      {ingredients === null ? <MenuUnavailable /> : <MenuList ingredients={ingredients} />}
    </div>
  );
}

function MenuUnavailable() {
  return (
    <p className="notice" role="status">
      The menu cannot be loaded. Start the API on port 3001 and refresh this page.
    </p>
  );
}

function MenuList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="board">
      {CATEGORY_ORDER.map((category) => {
        const rows = ingredients.filter((item) => item.category === category);
        if (rows.length === 0) {
          return null;
        }
        return (
          <section key={category} className="category" aria-labelledby={category}>
            <h2 id={category}>{CATEGORY_LABEL[category]}</h2>
            <ul>
              {rows.map((item) => (
                <li key={item.id} className={item.available ? "item" : "item off"}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <p className="price">
                    {item.available ? formatCents(item.priceCents) : "Off the board"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
