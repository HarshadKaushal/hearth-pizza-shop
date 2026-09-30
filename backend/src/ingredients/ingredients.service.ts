import type { CreateIngredientValues, UpdateIngredientValues } from "@hearth/shared";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.ingredient.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { ingredients: rows.map(toIngredient) };
  }

  async create(dto: CreateIngredientValues) {
    try {
      const row = await this.prisma.ingredient.create({
        data: {
          name: dto.name,
          description: dto.description,
          category: dto.category,
          priceCents: dto.priceCents,
          available: dto.available,
        },
      });
      return toIngredient(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("An ingredient with that name already exists.");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateIngredientValues) {
    try {
      const row = await this.prisma.ingredient.update({
        where: { id },
        data: {
          ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
          ...(dto.available !== undefined ? { available: dto.available } : {}),
        },
      });
      return toIngredient(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundException("Ingredient not found.");
      }
      throw error;
    }
  }
}

function toIngredient(row: {
  id: string;
  name: string;
  description: string;
  category: "CRUST" | "SAUCE" | "CHEESE" | "TOPPING";
  priceCents: number;
  available: boolean;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: row.priceCents,
    available: row.available,
  };
}
