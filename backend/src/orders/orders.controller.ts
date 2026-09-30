import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuthToken } from "../auth/token";
import { CreateOrderDto } from "./create-order.dto";
import { OrdersService } from "./orders.service";
import { UpdateStatusDto } from "./update-status.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthToken) {
    return this.orders.create(dto, user.id);
  }

  @Get("mine")
  @UseGuards(AuthGuard)
  mine(@CurrentUser() user: AuthToken) {
    return this.orders.listForUser(user.id);
  }

  @Get()
  list() {
    return this.orders.list();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.orders.findOne(id);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.orders.updateStatus(id, dto);
  }
}
