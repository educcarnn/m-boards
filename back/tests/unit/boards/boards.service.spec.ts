import { Test, TestingModule } from "@nestjs/testing";
import { randomUUID } from "crypto";

import { BoardsService, BOARDS_REPOSITORY } from "../../../src/modules/boards/boards.service";
import type { IBoardsRepository } from "../../../src/modules/boards/boards.repository";
import { NotFoundError } from "../../../src/shared/errors/not-found.error";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("../../../src/modules/boards/board.entity", () => {
  return {
    Board: {
      create: jest.fn(),
    },
  };
});

import { Board } from "../../../src/modules/boards/board.entity";

describe("BoardsService", () => {
  let service: BoardsService;
  let repo: jest.Mocked<IBoardsRepository>;

  const repoMock: jest.Mocked<IBoardsRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: BOARDS_REPOSITORY, useValue: repoMock },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    repo = module.get(BOARDS_REPOSITORY);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("deve criar um board e persistir", async () => {
      (randomUUID as jest.Mock).mockReturnValue("uuid-board-1");

      const boardEntity = { id: "uuid-board-1", name: "Meu board" };
      (Board.create as jest.Mock).mockReturnValue(boardEntity);

      const result = await service.create({ name: "Meu board" });

      expect(randomUUID).toHaveBeenCalled();
      expect(Board.create).toHaveBeenCalledWith({ id: "uuid-board-1", name: "Meu board" });
      expect(repo.create).toHaveBeenCalledWith(boardEntity);
      expect(result).toBe(boardEntity);
    });
  });

  describe("list", () => {
    it("deve retornar lista de boards", async () => {
      const boards = [{ id: "b1" }, { id: "b2" }] as any;

      repo.findAll.mockResolvedValue(boards);

      const result = await service.list();

      expect(repo.findAll).toHaveBeenCalled();
      expect(result).toBe(boards);
    });
  });

  describe("getById", () => {
    it("deve retornar o board quando existir", async () => {
      const board = { id: "b1", name: "Board" } as any;
      repo.findById.mockResolvedValue(board);

      const result = await service.getById("b1");

      expect(repo.findById).toHaveBeenCalledWith("b1");
      expect(result).toBe(board);
    });

    it("deve lançar NotFoundError quando não existir", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById("x")).rejects.toBeInstanceOf(NotFoundError);
      await expect(service.getById("x")).rejects.toThrow("Board x not found");
    });
  });

  describe("rename", () => {
    it("deve renomear o board e atualizar no repo", async () => {
      const board = { id: "b1", name: "Old", rename: jest.fn() } as any;
      repo.findById.mockResolvedValue(board);

      const result = await service.rename("b1", { name: "New" });

      expect(repo.findById).toHaveBeenCalledWith("b1");
      expect(board.rename).toHaveBeenCalledWith("New");
      expect(repo.update).toHaveBeenCalledWith(board);
      expect(result).toBe(board);
    });

    it("deve lançar NotFoundError se não existir", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.rename("x", { name: "New" })).rejects.toBeInstanceOf(NotFoundError);
      await expect(service.rename("x", { name: "New" })).rejects.toThrow("Board x not found");

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deve deletar board quando existir", async () => {
      repo.findById.mockResolvedValue({ id: "b1" } as any);
      repo.delete.mockResolvedValue(undefined as any);

      await service.remove("b1");

      expect(repo.findById).toHaveBeenCalledWith("b1");
      expect(repo.delete).toHaveBeenCalledWith("b1");
    });

    it("deve lançar NotFoundError se não existir", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove("x")).rejects.toBeInstanceOf(NotFoundError);
      await expect(service.remove("x")).rejects.toThrow("Board x not found");

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
