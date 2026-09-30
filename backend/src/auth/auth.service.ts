import type { LoginValues, SignupValues } from "@hearth/shared";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { hashPassword, verifyPassword } from "./password";
import { AuthToken, issueToken, readToken } from "./token";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: SignupValues) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with that email already exists.");
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash: await hashPassword(dto.password),
      },
    });
    return this.session(user);
  }

  async login(dto: LoginValues) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Email or password is wrong.");
    }
    return this.session(user);
  }

  async profile(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException("Log in to continue.");
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  authenticate(header: string | undefined): AuthToken {
    const [scheme, token] = (header ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Log in to continue.");
    }
    try {
      return readToken(token);
    } catch {
      throw new UnauthorizedException("Log in to continue.");
    }
  }

  private session(user: { id: string; email: string; name: string; role: "CUSTOMER" | "KITCHEN" }) {
    return {
      token: issueToken({ id: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
