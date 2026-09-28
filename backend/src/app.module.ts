import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { IngredientsModule } from "./ingredients/ingredients.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, HealthModule, IngredientsModule],
})
export class AppModule {}
