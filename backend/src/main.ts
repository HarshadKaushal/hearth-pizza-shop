import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  app.enableCors({ origin });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

bootstrap();
