import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { KitchenGuard } from "./kitchen.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, KitchenGuard],
  exports: [AuthService, AuthGuard, KitchenGuard],
})
export class AuthModule {}
