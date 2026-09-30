import { createIngredientSchema, updateIngredientSchema, type CreateIngredientValues, type UpdateIngredientValues } from "@hearth/shared";
import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { KitchenGuard } from "../auth/kitchen.guard";
import { ZodValidationPipe } from "../validation.pipe";
import { IngredientsService } from "./ingredients.service";

@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredients: IngredientsService) {}

  @Get()
  list() {
    return this.ingredients.list();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(KitchenGuard)
  create(@Body(new ZodValidationPipe(createIngredientSchema)) dto: CreateIngredientValues) {
    return this.ingredients.create(dto);
  }

  @Patch(":id")
  @UseGuards(KitchenGuard)
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateIngredientSchema)) dto: UpdateIngredientValues) {
    return this.ingredients.update(id, dto);
  }
}
