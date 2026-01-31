import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService, BOARDS_REPOSITORY } from './boards.service';
import { PrismaBoardsRepository } from './boards.repository';

@Module({
  controllers: [BoardsController],
  providers: [
    BoardsService,
    {
      provide: BOARDS_REPOSITORY,
      useClass: PrismaBoardsRepository,
    },
  ],
  exports: [BoardsService],
})
export class BoardsModule {}
