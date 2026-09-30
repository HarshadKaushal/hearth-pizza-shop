import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthToken } from "./token";

@Injectable()
export class KitchenGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AuthToken }>();
    const user = this.auth.authenticate(request.headers.authorization);
    if (user.role !== "KITCHEN") {
      throw new ForbiddenException("Kitchen staff only.");
    }
    request.user = user;
    return true;
  }
}
