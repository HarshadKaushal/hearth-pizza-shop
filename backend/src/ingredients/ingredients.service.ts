import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.ingredient.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return {
      ingredients: rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        priceCents: row.priceCents,
        available: row.available,
      })),
    };
  }
}
