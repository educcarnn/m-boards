import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ColumnsService } from "./columns.service";
import { CreateColumnDto } from "./dto/create-column.dto";

@Controller("columns")
export class ColumnsController {
  constructor(private readonly service: ColumnsService) {}

  @Post()
  create(@Body() dto: CreateColumnDto) {
    return this.service.create(dto);
  }

  @Get("board/:boardId")
  listByBoard(@Param("boardId") boardId: string) {
    return this.service.listByBoard(boardId);
  }

  @Patch(":id/rename")
  rename(@Param("id") id: string, @Body("name") name: string) {
    return this.service.rename(id, name);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}