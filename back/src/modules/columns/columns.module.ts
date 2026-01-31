import { Module } from "@nestjs/common";
import { ColumnsController } from "./columns.controller";
import { ColumnsService } from "./columns.service";
import { ColumnsRepository, PrismaColumnsRepository } from "./columns.repository";

@Module({
  controllers: [ColumnsController],
  providers: [
    ColumnsService,
    { provide: ColumnsRepository, useClass: PrismaColumnsRepository },
  ],
  exports: [ColumnsService],
})
export class ColumnsModule {}