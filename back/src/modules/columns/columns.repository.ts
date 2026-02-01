import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { Column } from "./column.entity";
import { ColumnWithCardsDto } from "../cards/dto/column-with-cards.dto";

export abstract class ColumnsRepository {
  abstract findById(id: string): Promise<Column | null>;
  abstract findManyByBoard(boardId: string): Promise<Column[]>;
  abstract findManyWithCardsByBoard(boardId: string): Promise<ColumnWithCardsDto[]>; 
  abstract create(column: Column): Promise<void>;
  abstract update(column: Column): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

@Injectable()
export class PrismaColumnsRepository implements ColumnsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const row = await this.prisma.column.findUnique({ where: { id } });
    return row ? Column.restore(row as any) : null;
  }

  async findManyByBoard(boardId: string) {
    const rows = await this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
    });

    return rows.map((r) => Column.restore(r as any));
  }

  async findManyWithCardsByBoard(boardId: string): Promise<ColumnWithCardsDto[]> {
    const rows = await this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
      include: {
        cards: { orderBy: { position: "asc" } },
      },
    });

    return rows as any;
  }

  async create(column: Column) {
    await this.prisma.column.create({
      data: column.toJSON() as any,
    });
  }

  async update(column: Column) {
    const data = column.toJSON();
    await this.prisma.column.update({
      where: { id: data.id },
      data: {
        name: data.name,
        position: data.position,
        updatedAt: data.updatedAt,
      } as any,
    });
  }

  async delete(id: string) {
    await this.prisma.column.delete({ where: { id } });
  }
}