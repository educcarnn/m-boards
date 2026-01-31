import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BoardsModule } from "./modules/boards/boards.module";
import { CardsModule } from "./modules/cards/cards.module";
import { ColumnsModule } from "./modules/columns/columns.module";
import { DatabaseModule } from "./database/prisma/database.module";

@Module({
  imports: [
    DatabaseModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
