import { Test, TestingModule } from "@nestjs/testing";

import { BoardsController } from "../../../src/modules/boards/boards.controller";
import { BoardsService } from "../../../src/modules/boards/boards.service";

jest.mock("../../../src/modules/boards/dto/board-response.dto", () => {
  return {
    BoardResponseDto: {
      from: jest.fn((board: any) => ({ id: board.id, name: board.name })),
    },
  };
});

import { BoardResponseDto } from "../../../src/modules/boards/dto/board-response.dto";

describe("BoardsController", () => {
  let controller: BoardsController;
  let service: jest.Mocked<BoardsService>;

  const serviceMock: Partial<jest.Mocked<BoardsService>> = {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    rename: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
    service = module.get(BoardsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve chamar service.create e retornar BoardResponseDto", async () => {
      const dto = { name: "Meu board" };
      const board = { id: "b1", name: "Meu board" };

      service.create!.mockResolvedValue(board as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith({ name: dto.name });
      expect(BoardResponseDto.from).toHaveBeenCalledWith(board);
      expect(result).toEqual({ id: "b1", name: "Meu board" });
    });
  });

  describe("list", () => {
    it("deve chamar service.list e mapear com BoardResponseDto.from", async () => {
      const boards = [
        { id: "b1", name: "A" },
        { id: "b2", name: "B" },
      ];

      service.list!.mockResolvedValue(boards as any);

      const result = await controller.list();

      expect(service.list).toHaveBeenCalled();
      expect(BoardResponseDto.from).toHaveBeenCalledTimes(boards.length);
      expect(result).toEqual([
        { id: "b1", name: "A" },
        { id: "b2", name: "B" },
      ]);
    });
  });

  describe("get", () => {
    it("deve chamar service.getById e retornar BoardResponseDto", async () => {
      const board = { id: "b1", name: "A" };

      service.getById!.mockResolvedValue(board as any);

      const result = await controller.get("b1");

      expect(service.getById).toHaveBeenCalledWith("b1");
      expect(BoardResponseDto.from).toHaveBeenCalledWith(board);
      expect(result).toEqual({ id: "b1", name: "A" });
    });
  });

  describe("rename", () => {
    it("deve chamar service.rename e retornar BoardResponseDto", async () => {
      const id = "b1";
      const dto = { name: "Novo" };
      const board = { id, name: "Novo" };

      service.rename!.mockResolvedValue(board as any);

      const result = await controller.rename(id, dto as any);

      expect(service.rename).toHaveBeenCalledWith(id, { name: dto.name });
      expect(BoardResponseDto.from).toHaveBeenCalledWith(board);
      expect(result).toEqual({ id: "b1", name: "Novo" });
    });
  });

  describe("remove", () => {
    it("deve chamar service.remove e retornar ok true", async () => {
      service.remove!.mockResolvedValue(undefined as any);

      const result = await controller.remove("b1");

      expect(service.remove).toHaveBeenCalledWith("b1");
      expect(result).toEqual({ ok: true });
    });
  });
});
