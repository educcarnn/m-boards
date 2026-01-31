import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private readonly service: BoardsService) {}

  @Post()
  async create(@Body() dto: CreateBoardDto): Promise<BoardResponseDto> {
    const board = await this.service.create({ name: dto.name });
    return BoardResponseDto.from(board);
  }

  @Get()
  async list(): Promise<BoardResponseDto[]> {
    const boards = await this.service.list();
    return boards.map(BoardResponseDto.from);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<BoardResponseDto> {
    const board = await this.service.getById(id);
    return BoardResponseDto.from(board);
  }

  @Patch(':id')
  async rename(
    @Param('id') id: string,
    @Body() dto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    const board = await this.service.rename(id, { name: dto.name });
    return BoardResponseDto.from(board);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ ok: true }> {
    await this.service.remove(id);
    return { ok: true };
  }
}
