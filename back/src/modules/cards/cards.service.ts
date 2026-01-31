import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Card } from "./card.entity";
import { CardsRepository } from "./cards.repository";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { MoveCardDto } from "./dto/move-card.dto";

@Injectable()
export class CardsService {
  constructor(private readonly repo: CardsRepository) {}

  async create(dto: CreateCardDto) {
    const card = Card.create({
      id: randomUUID(),
      boardId: dto.boardId,
      columnId: dto.columnId,
      title: dto.title,
      description: dto.description ?? null,
      position: dto.position,
    });

    await this.repo.create(card);
    return card.toJSON();
  }

  async update(cardId: string, dto: UpdateCardDto) {
    const card = await this.repo.findById(cardId);
    if (!card) throw new NotFoundException("Card not found");

    card.updateDetails({
      title: dto.title,
      description: dto.description ?? undefined,
    });

    await this.repo.update(card);
    return card.toJSON();
  }

  async remove(cardId: string) {
    const card = await this.repo.findById(cardId);
    if (!card) throw new NotFoundException("Card not found");
    await this.repo.delete(cardId);
    return { ok: true };
  }

  async move(cardId: string, dto: MoveCardDto) {
    const card = await this.repo.findById(cardId);
    if (!card) throw new NotFoundException("Card not found");

    const destCards = await this.repo.findManyByColumn(dto.toColumnId);

    const filtered = destCards.filter((c) => c.id !== cardId);

    card.moveTo({ toColumnId: dto.toColumnId, toPosition: dto.toPosition });

    const index = Math.max(0, Math.min(dto.toPosition, filtered.length));
    filtered.splice(index, 0, card);

    filtered.forEach((c, i) => c.moveTo({ toColumnId: c.columnId, toPosition: i }));

    await this.repo.updateMany(filtered);

    return card.toJSON();
  }
}
