import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/**
 * Entry point for the Payment API service.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001, '0.0.0.0');
  console.log("Payment API is running on: http://localhost:3001");
}
bootstrap();

