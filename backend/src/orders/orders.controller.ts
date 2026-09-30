import { orderSchema, type OrderValues } from "@hearth/shared";
import { BadRequestException, Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { KitchenGuard } from "../auth/kitchen.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuthToken } from "../auth/token";
import { ZodValidationPipe } from "../validation.pipe";
import { OrdersService } from "./orders.service";
import { UpdateStatusDto } from "./update-status.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard)
  create(@Body(new ZodValidationPipe(orderSchema)) dto: OrderValues, @CurrentUser() user: AuthToken) {
    return this.orders.create(dto, user.id);
  }

  @Get("mine")
  @UseGuards(AuthGuard)
  mine(@CurrentUser() user: AuthToken) {
    return this.orders.listForUser(user.id);
  }

  @Get()
  @UseGuards(KitchenGuard)
  list(@Query("page") page?: string) {
    const parsed = page === undefined ? 1 : Number(page);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException("Page must be a positive number.");
    }
    return this.orders.list(parsed);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.orders.findOne(id);
  }

  @Patch(":id/status")
  @UseGuards(KitchenGuard)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.orders.updateStatus(id, dto);
  }
}
