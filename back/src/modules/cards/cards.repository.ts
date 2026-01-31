import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma.service";
import { Card } from "./card.entity";

export abstract class CardsRepository {
  abstract findById(id: string): Promise<Card | null>;
  abstract create(card: Card): Promise<void>;
  abstract update(card: Card): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findManyByColumn(columnId: string): Promise<Card[]>;
  abstract updateMany(cards: Card[]): Promise<void>;
}

@Injectable()
export class PrismaCardsRepository implements CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const row = await this.prisma.card.findUnique({ where: { id } });
    return row ? Card.restore(row as any) : null;
  }

  async create(card: Card) {
    const data = card.toJSON();
    await this.prisma.card.create({ data: data as any });
  }

  async update(card: Card) {
    const data = card.toJSON();
    await this.prisma.card.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        position: data.position,
        updatedAt: data.updatedAt,
      } as any,
    });
  }

  async delete(id: string) {
    await this.prisma.card.delete({ where: { id } });
  }

  async findManyByColumn(columnId: string) {
    const rows = await this.prisma.card.findMany({
      where: { columnId },
      orderBy: { position: "asc" },
    });

    return rows.map((r) => Card.restore(r as any));
  }

  async updateMany(cards: Card[]) {
    await this.prisma.$transaction(
      cards.map((c) => {
        const data = c.toJSON();
        return this.prisma.card.update({
          where: { id: data.id },
          data: { columnId: data.columnId, position: data.position, updatedAt: data.updatedAt } as any,
        });
      }),
    );
  }
}
