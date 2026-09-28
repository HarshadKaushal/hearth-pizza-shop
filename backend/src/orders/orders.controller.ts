import { Body, Controller, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { CreateOrderDto } from "./create-order.dto";
import { OrdersService } from "./orders.service";
import { UpdateStatusDto } from "./update-status.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
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
