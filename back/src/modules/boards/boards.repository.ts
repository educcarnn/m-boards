import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { Board } from './board.entity';

export interface IBoardsRepository {
  create(board: Board): Promise<void>;
  findById(id: string): Promise<Board | null>;
  findAll(): Promise<Board[]>;
  update(board: Board): Promise<void>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class PrismaBoardsRepository implements IBoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(board: Board): Promise<void> {
    const data = board.toJSON();

    await this.prisma.board.create({
      data: {
        id: data.id,
        name: data.name,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Board | null> {
    const row = await this.prisma.board.findUnique({ where: { id } });
    if (!row) return null;

    return Board.restore({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findAll(): Promise<Board[]> {
    const rows = await this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) =>
      Board.restore({
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async update(board: Board): Promise<void> {
    const data = board.toJSON();

    await this.prisma.board.update({
      where: { id: data.id },
      data: {
        name: data.name,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.board.delete({ where: { id } });
  }
}
