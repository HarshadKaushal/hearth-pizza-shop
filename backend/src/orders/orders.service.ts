import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { FulfillmentType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./create-order.dto";
import { orderWithPizzas, toOrderResponse } from "./order.presenter";
import { PizzaPricingError, pricePizza } from "./pricing";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const ids = [...new Set(dto.pizzas.flatMap((pizza) => pizza.ingredientIds))];
    const catalog = await this.prisma.ingredient.findMany({
      where: { id: { in: ids } },
    });

    let priced;
    try {
      priced = dto.pizzas.map((pizza) =>
        pricePizza(pizza.size, pizza.label, pizza.ingredientIds, catalog),
      );
    } catch (error) {
      if (error instanceof PizzaPricingError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const totalCents = priced.reduce((sum, pizza) => sum + pizza.lineTotalCents, 0);
    if (totalCents !== dto.quotedTotalCents) {
      throw new ConflictException({
        message: "Quoted total does not match the menu.",
        serverTotalCents: totalCents,
      });
    }

    const order = await this.prisma.$transaction((tx) =>
      tx.order.create({
        data: {
          customerName: dto.customerName.trim(),
          phone: dto.phone.trim(),
          fulfillment: dto.fulfillment,
          address: dto.fulfillment === FulfillmentType.DELIVERY ? dto.address!.trim() : null,
          notes: dto.notes?.trim() || null,
          totalCents,
          pizzas: {
            create: priced.map((pizza) => ({
              size: pizza.size,
              label: pizza.label,
              baseCents: pizza.baseCents,
              lineTotalCents: pizza.lineTotalCents,
              ingredients: {
                create: pizza.ingredients.map((item) => ({
                  ingredientId: item.ingredientId,
                  name: item.name,
                  category: item.category,
                  priceCents: item.priceCents,
                })),
              },
            })),
          },
        },
        include: orderWithPizzas,
      }),
    );

    return toOrderResponse(order);
  }
}
