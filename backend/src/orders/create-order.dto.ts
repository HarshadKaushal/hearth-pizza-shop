import { FulfillmentType, PizzaSize } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { MAX_PIZZAS, MAX_TOPPINGS } from "./pricing";

export class CreatePizzaDto {
  @IsEnum(PizzaSize)
  size!: PizzaSize;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3 + MAX_TOPPINGS)
  @IsString({ each: true })
  ingredientIds!: string[];
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerName!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone!: string;

  @IsEnum(FulfillmentType)
  fulfillment!: FulfillmentType;

  @ValidateIf((order: CreateOrderDto) => order.fulfillment === FulfillmentType.DELIVERY)
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;

  @IsInt()
  @Min(0)
  quotedTotalCents!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_PIZZAS)
  @ValidateNested({ each: true })
  @Type(() => CreatePizzaDto)
  pizzas!: CreatePizzaDto[];
}
