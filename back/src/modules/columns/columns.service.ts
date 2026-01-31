import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Column } from "./column.entity";
import { ColumnsRepository } from "./columns.repository";
import { CreateColumnDto } from "./dto/create-column.dto";

@Injectable()
export class ColumnsService {
  constructor(private readonly repo: ColumnsRepository) {}

  async create(dto: CreateColumnDto) {
    const column = Column.create({
      id: randomUUID(),
      boardId: dto.boardId,
      name: dto.name,
      position: dto.position,
    });

    await this.repo.create(column);
    return column.toJSON();
  }

  async listByBoard(boardId: string) {
    const columns = await this.repo.findManyByBoard(boardId);
    return columns.map((c) => c.toJSON());
  }

  async rename(columnId: string, name: string) {
    const column = await this.repo.findById(columnId);
    if (!column) throw new NotFoundException("Column not found");

    column.rename(name);
    await this.repo.update(column);

    return column.toJSON();
  }

  async remove(columnId: string) {
    const column = await this.repo.findById(columnId);
    if (!column) throw new NotFoundException("Column not found");

    await this.repo.delete(columnId);
    return { ok: true };
  }
}