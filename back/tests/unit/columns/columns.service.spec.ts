import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";

import { ColumnsService } from "../../../src/modules/columns/columns.service";
import { ColumnsRepository } from "../../../src/modules/columns/columns.repository";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("../../../src/modules/columns/column.entity", () => {
  return {
    Column: {
      create: jest.fn(),
    },
  };
});

import { Column } from "../../../src/modules/columns/column.entity";

describe("ColumnsService", () => {
  let service: ColumnsService;
  let repo: jest.Mocked<ColumnsRepository>;

  const repoMock: jest.Mocked<Partial<ColumnsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findManyWithCardsByBoard: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: ColumnsRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    repo = module.get(ColumnsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("deve criar uma coluna e persistir no repo", async () => {
      (randomUUID as jest.Mock).mockReturnValue("uuid-123");

      const dto = { boardId: "board-1", name: "Backlog", position: 1 };

      const fakeColumn = {
        toJSON: jest.fn().mockReturnValue({
          id: "uuid-123",
          boardId: "board-1",
          name: "Backlog",
          position: 1,
        }),
      };

      (Column.create as jest.Mock).mockReturnValue(fakeColumn);

      const result = await service.create(dto as any);

      expect(randomUUID).toHaveBeenCalled();
      expect(Column.create).toHaveBeenCalledWith({
        id: "uuid-123",
        boardId: "board-1",
        name: "Backlog",
        position: 1,
      });

      expect(repo.create).toHaveBeenCalledWith(fakeColumn);
      expect(result).toEqual({
        id: "uuid-123",
        boardId: "board-1",
        name: "Backlog",
        position: 1,
      });
    });
  });

  describe("listByBoard", () => {
    it("deve listar colunas com cards do board", async () => {
      const boardId = "board-1";
      const columns = [
        { id: "c1", name: "Backlog", cards: [] },
        { id: "c2", name: "Doing", cards: [{ id: "card-1" }] },
      ];

      repo.findManyWithCardsByBoard!.mockResolvedValue(columns as any);

      const result = await service.listByBoard(boardId);

      expect(repo.findManyWithCardsByBoard).toHaveBeenCalledWith(boardId);
      expect(result).toBe(columns);
    });
  });

  describe("rename", () => {
    it("deve renomear a coluna e atualizar no repo", async () => {
      const columnId = "col-1";
      const newName = "Novo Nome";

      const columnEntity = {
        rename: jest.fn(),
        toJSON: jest.fn().mockReturnValue({ id: columnId, name: newName }),
      };

      repo.findById!.mockResolvedValue(columnEntity as any);

      const result = await service.rename(columnId, newName);

      expect(repo.findById).toHaveBeenCalledWith(columnId);
      expect(columnEntity.rename).toHaveBeenCalledWith(newName);
      expect(repo.update).toHaveBeenCalledWith(columnEntity);
      expect(result).toEqual({ id: columnId, name: newName });
    });

    it("deve lançar NotFoundException quando a coluna não existir", async () => {
      repo.findById!.mockResolvedValue(null as any);

      await expect(service.rename("col-x", "Nome")).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.rename("col-x", "Nome")).rejects.toThrow("Column not found");

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deve remover a coluna no repo e retornar ok", async () => {
      const columnId = "col-1";

      repo.findById!.mockResolvedValue({ id: columnId } as any);
      repo.delete!.mockResolvedValue(undefined as any);

      const result = await service.remove(columnId);

      expect(repo.findById).toHaveBeenCalledWith(columnId);
      expect(repo.delete).toHaveBeenCalledWith(columnId);
      expect(result).toEqual({ ok: true });
    });

    it("deve lançar NotFoundException quando a coluna não existir", async () => {
      repo.findById!.mockResolvedValue(null as any);

      await expect(service.remove("col-x")).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.remove("col-x")).rejects.toThrow("Column not found");

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
