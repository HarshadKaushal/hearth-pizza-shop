import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FulfillmentType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./create-order.dto";
import { orderWithPizzas, toOrderResponse } from "./order.presenter";
import { PizzaPricingError, pricePizza } from "./pricing";
import { assertStatusTransition, StatusTransitionError } from "./status";
import { UpdateStatusDto } from "./update-status.dto";

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

  async list() {
    const orders = await this.prisma.order.findMany({
      include: orderWithPizzas,
      orderBy: { createdAt: "desc" },
    });
    return { orders: orders.map(toOrderResponse) };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderWithPizzas,
    });
    if (!order) {
      throw new NotFoundException("Order not found.");
    }
    return toOrderResponse(order);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Order not found.");
    }

    try {
      assertStatusTransition(existing.status, dto.status);
    } catch (error) {
      if (error instanceof StatusTransitionError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    const updated = await this.prisma.order.updateMany({
      where: { id, status: existing.status },
      data: { status: dto.status },
    });
    if (updated.count !== 1) {
      throw new ConflictException("The order status changed. Refresh and try again.");
    }

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: orderWithPizzas,
    });
    return toOrderResponse(order);
  }
}
