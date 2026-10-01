import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { IngredientsModule } from "./ingredients/ingredients.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SuggestionsModule } from "./suggestions/suggestions.module";

@Module({
  imports: [PrismaModule, HealthModule, IngredientsModule, AuthModule, OrdersModule, SuggestionsModule],
})
export class AppModule {}
