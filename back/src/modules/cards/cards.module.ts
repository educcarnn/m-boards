import { Module } from "@nestjs/common";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { CardsRepository, PrismaCardsRepository } from "./cards.repository";

@Module({
  controllers: [CardsController],
  providers: [
    CardsService,
    { provide: CardsRepository, useClass: PrismaCardsRepository },
  ],
  exports: [CardsService],
})
export class CardsModule {}