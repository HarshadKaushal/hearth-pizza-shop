import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@hearth/shared";
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../validation.pipe";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { AuthToken } from "./token";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  @HttpCode(201)
  signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupValues) {
    return this.auth.signup(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginValues) {
    return this.auth.login(dto);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() request: { user: AuthToken }) {
    const user = await this.auth.profile(request.user.id);
    return { user };
  }
}
