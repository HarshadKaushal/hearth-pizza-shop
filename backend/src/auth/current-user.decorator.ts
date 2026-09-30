import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthToken } from "./token";

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthToken => {
  return context.switchToHttp().getRequest<{ user: AuthToken }>().user;
});
