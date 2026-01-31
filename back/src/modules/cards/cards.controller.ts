import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { CardsService } from "./cards.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { MoveCardDto } from "./dto/move-card.dto";

@Controller("cards")
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCardDto) {
    return this.service.update(id, dto);
  }

  @Patch(":id/move")
  move(@Param("id") id: string, @Body() dto: MoveCardDto) {
    return this.service.move(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}