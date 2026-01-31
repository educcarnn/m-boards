import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotFoundError } from 'src/shared/errors/not-found.error';
import { Board } from './board.entity';
import type { IBoardsRepository } from './boards.repository';

export const BOARDS_REPOSITORY = Symbol('BOARDS_REPOSITORY');

@Injectable()
export class BoardsService {
  constructor(
    @Inject(BOARDS_REPOSITORY)
    private readonly boardsRepo: IBoardsRepository,
  ) {}

  async create(input: { name: string }): Promise<Board> {
    const board = Board.create({
      id: randomUUID(),
      name: input.name,
    });

    await this.boardsRepo.create(board);
    return board;
  }

  async list(): Promise<Board[]> {
    return this.boardsRepo.findAll();
  }

  async getById(id: string): Promise<Board> {
    const board = await this.boardsRepo.findById(id);
    if (!board) throw new NotFoundError(`Board ${id} not found`);
    return board;
  }

  async rename(id: string, input: { name: string }): Promise<Board> {
    const board = await this.getById(id);

    board.rename(input.name);

    await this.boardsRepo.update(board);
    return board;
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.boardsRepo.delete(id);
  }
}
