import { IngredientCategory, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth/password";

const prisma = new PrismaClient();

type SeedIngredient = {
  name: string;
  description: string;
  category: IngredientCategory;
  priceCents: number;
  available?: boolean;
};

const ingredients: SeedIngredient[] = [
  { name: "Thin crust", description: "Crisp, lightly browned edge.", category: "CRUST", priceCents: 0 },
  { name: "Classic hand-tossed", description: "The house dough.", category: "CRUST", priceCents: 0 },
  { name: "Thick pan", description: "A taller edge with more chew.", category: "CRUST", priceCents: 100 },
  { name: "Gluten-free crust", description: "Rice and tapioca base.", category: "CRUST", priceCents: 250 },
  { name: "Tomato", description: "Slow-cooked house tomato.", category: "SAUCE", priceCents: 0 },
  { name: "Basil pesto", description: "Basil, olive oil, and nuts.", category: "SAUCE", priceCents: 100 },
  { name: "BBQ", description: "Smoky and slightly sweet.", category: "SAUCE", priceCents: 50 },
  { name: "Garlic white", description: "Roasted garlic and cream.", category: "SAUCE", priceCents: 75 },
  { name: "Mozzarella", description: "Whole-milk mozzarella.", category: "CHEESE", priceCents: 150 },
  { name: "Cheddar", description: "Sharp cheddar, melted in.", category: "CHEESE", priceCents: 150 },
  { name: "Parmesan", description: "Aged parmesan, grated to order.", category: "CHEESE", priceCents: 175 },
  { name: "Vegan mozzarella", description: "Almond-based melt.", category: "CHEESE", priceCents: 200 },
  { name: "Pepperoni", description: "Cupped pepperoni.", category: "TOPPING", priceCents: 200 },
  { name: "Mushrooms", description: "Roasted cremini.", category: "TOPPING", priceCents: 150 },
  { name: "Black olives", description: "Sliced, rinsed of brine.", category: "TOPPING", priceCents: 125 },
  { name: "Red onion", description: "Thin raw rings.", category: "TOPPING", priceCents: 100 },
  { name: "Bell peppers", description: "Sweet red and yellow.", category: "TOPPING", priceCents: 100 },
  { name: "Jalapeños", description: "Fresh slices.", category: "TOPPING", priceCents: 100 },
  { name: "Pineapple", description: "Grilled, not canned syrup.", category: "TOPPING", priceCents: 125 },
  { name: "Roasted chicken", description: "Pulled roast chicken.", category: "TOPPING", priceCents: 250 },
  { name: "Bacon", description: "Thick-cut, chopped.", category: "TOPPING", priceCents: 225 },
  { name: "Fresh basil", description: "Torn after the bake.", category: "TOPPING", priceCents: 75 },
  {
    name: "Anchovies",
    description: "Off the board today.",
    category: "TOPPING",
    priceCents: 200,
    available: false,
  },
];

const KITCHEN_EMAIL = "kitchen@hearth.test";
const KITCHEN_PASSWORD = "hearth-kitchen";

async function main() {
  const kitchen = await prisma.user.findUnique({ where: { email: KITCHEN_EMAIL } });
  if (!kitchen) {
    await prisma.user.create({
      data: {
        email: KITCHEN_EMAIL,
        name: "Kitchen",
        passwordHash: await hashPassword(KITCHEN_PASSWORD),
        role: "KITCHEN",
      },
    });
  } else if (kitchen.role !== "KITCHEN") {
    await prisma.user.update({ where: { email: KITCHEN_EMAIL }, data: { role: "KITCHEN" } });
  }

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {
        description: ingredient.description,
        category: ingredient.category,
        priceCents: ingredient.priceCents,
        available: ingredient.available ?? true,
      },
      create: {
        name: ingredient.name,
        description: ingredient.description,
        category: ingredient.category,
        priceCents: ingredient.priceCents,
        available: ingredient.available ?? true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
