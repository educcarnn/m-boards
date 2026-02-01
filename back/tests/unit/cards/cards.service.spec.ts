import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";

import { CardsService } from "../../../src/modules/cards/cards.service";
import { CardsRepository } from "../../../src/modules/cards/cards.repository";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("../../../src/modules/cards/card.entity", () => {
  return {
    Card: {
      create: jest.fn(),
    },
  };
});

import { Card } from "../../../src/modules/cards/card.entity";

describe("CardsService", () => {
  let service: CardsService;
  let repo: jest.Mocked<CardsRepository>;

  const repoMock: jest.Mocked<Partial<CardsRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findManyByColumn: jest.fn(),
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: CardsRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    repo = module.get(CardsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("deve criar um card e persistir no repo", async () => {
      (randomUUID as jest.Mock).mockReturnValue("uuid-card-1");

      const dto = {
        boardId: "board-1",
        columnId: "col-1",
        title: "Card 1",
        description: "Desc",
        position: 1,
      };

      const fakeCard = {
        toJSON: jest.fn().mockReturnValue({
          id: "uuid-card-1",
          boardId: "board-1",
          columnId: "col-1",
          title: "Card 1",
          description: "Desc",
          position: 1,
        }),
      };

      (Card.create as jest.Mock).mockReturnValue(fakeCard);

      const result = await service.create(dto as any);

      expect(randomUUID).toHaveBeenCalled();
      expect(Card.create).toHaveBeenCalledWith({
        id: "uuid-card-1",
        boardId: "board-1",
        columnId: "col-1",
        title: "Card 1",
        description: "Desc",
        position: 1,
      });

      expect(repo.create).toHaveBeenCalledWith(fakeCard);
      expect(result).toEqual({
        id: "uuid-card-1",
        boardId: "board-1",
        columnId: "col-1",
        title: "Card 1",
        description: "Desc",
        position: 1,
      });
    });

    it("deve salvar description como null quando não vier", async () => {
      (randomUUID as jest.Mock).mockReturnValue("uuid-card-2");

      const dto = {
        boardId: "board-1",
        columnId: "col-1",
        title: "Card 2",
        position: 2,
      };

      const fakeCard = {
        toJSON: jest.fn().mockReturnValue({
          id: "uuid-card-2",
          boardId: "board-1",
          columnId: "col-1",
          title: "Card 2",
          description: null,
          position: 2,
        }),
      };

      (Card.create as jest.Mock).mockReturnValue(fakeCard);

      const result = await service.create(dto as any);

      expect(Card.create).toHaveBeenCalledWith({
        id: "uuid-card-2",
        boardId: "board-1",
        columnId: "col-1",
        title: "Card 2",
        description: null,
        position: 2,
      });
      expect(result.description).toBeNull();
    });
  });

  describe("update", () => {
    it("deve atualizar title/description e persistir", async () => {
      const cardId = "card-1";
      const dto = { title: "Novo título", description: "Nova desc" };

      const cardEntity = {
        updateDetails: jest.fn(),
        toJSON: jest.fn().mockReturnValue({
          id: cardId,
          title: "Novo título",
          description: "Nova desc",
        }),
      };

      repo.findById!.mockResolvedValue(cardEntity as any);

      const result = await service.update(cardId, dto as any);

      expect(repo.findById).toHaveBeenCalledWith(cardId);
      expect(cardEntity.updateDetails).toHaveBeenCalledWith({
        title: "Novo título",
        description: "Nova desc",
      });
      expect(repo.update).toHaveBeenCalledWith(cardEntity);
      expect(result).toEqual({
        id: cardId,
        title: "Novo título",
        description: "Nova desc",
      });
    });

    it("deve passar description como undefined quando não vier (não alterar)", async () => {
      const cardId = "card-1";
      const dto = { title: "Novo título" };

      const cardEntity = {
        updateDetails: jest.fn(),
        toJSON: jest.fn().mockReturnValue({ id: cardId, title: "Novo título" }),
      };

      repo.findById!.mockResolvedValue(cardEntity as any);

      await service.update(cardId, dto as any);

      expect(cardEntity.updateDetails).toHaveBeenCalledWith({
        title: "Novo título",
        description: undefined,
      });
      expect(repo.update).toHaveBeenCalledWith(cardEntity);
    });

    it("deve lançar NotFoundException se não existir", async () => {
      repo.findById!.mockResolvedValue(null as any);

      await expect(service.update("x", { title: "t" } as any)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.update("x", { title: "t" } as any)).rejects.toThrow("Card not found");

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deve remover e retornar ok", async () => {
      const cardId = "card-1";

      repo.findById!.mockResolvedValue({ id: cardId } as any);
      repo.delete!.mockResolvedValue(undefined as any);

      const result = await service.remove(cardId);

      expect(repo.findById).toHaveBeenCalledWith(cardId);
      expect(repo.delete).toHaveBeenCalledWith(cardId);
      expect(result).toEqual({ ok: true });
    });

    it("deve lançar NotFoundException se não existir", async () => {
      repo.findById!.mockResolvedValue(null as any);

      await expect(service.remove("x")).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.remove("x")).rejects.toThrow("Card not found");

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe("move", () => {
    const mkCard = (id: string, col: string, pos = 0) => ({
      id,
      columnId: col,
      position: pos,
      moveTo: jest.fn(function (this: any, { toColumnId, toPosition }: any) {
        this.columnId = toColumnId;
        this.position = toPosition;
      }),
      toJSON: jest.fn().mockReturnValue({ id, columnId: col, position: pos }),
    });

    it("deve mover dentro da mesma coluna e atualizar updateMany apenas da lista", async () => {
      const cardId = "card-2";
      const fromCol = "col-1";

      const card = mkCard(cardId, fromCol, 1);
      const c1 = mkCard("card-1", fromCol, 0);
      const c3 = mkCard("card-3", fromCol, 2);

      repo.findById!.mockResolvedValue(card as any);
      repo.findManyByColumn!.mockResolvedValue([c1 as any, card as any, c3 as any]);

      (card.toJSON as jest.Mock).mockReturnValue({ id: cardId, columnId: fromCol, position: 0 });

      const result = await service.move(cardId, { toColumnId: fromCol, toPosition: 0 } as any);

      expect(repo.findById).toHaveBeenCalledWith(cardId);
      expect(repo.findManyByColumn).toHaveBeenCalledTimes(1);
      expect(repo.findManyByColumn).toHaveBeenCalledWith(fromCol);

      expect(repo.updateMany).toHaveBeenCalledTimes(1);
      const updatedList = (repo.updateMany as jest.Mock).mock.calls[0][0] as any[];
      expect(updatedList).toHaveLength(3);

      const byId: Record<string, any> = Object.fromEntries(updatedList.map((x) => [x.id, x]));
      expect(byId["card-2"].columnId).toBe(fromCol);
      expect(byId["card-2"].position).toBe(0);
      expect(byId["card-1"].position).toBe(1);
      expect(byId["card-3"].position).toBe(2);

      expect(result).toEqual({ id: cardId, columnId: fromCol, position: 0 });
    });

    it("deve lançar NotFoundException se card não existir", async () => {
      repo.findById!.mockResolvedValue(null as any);

      await expect(service.move("x", { toColumnId: "col-2", toPosition: 0 } as any)).rejects.toBeInstanceOf(
        NotFoundException
      );
      await expect(service.move("x", { toColumnId: "col-2", toPosition: 0 } as any)).rejects.toThrow("Card not found");

      expect(repo.findManyByColumn).not.toHaveBeenCalled();
      expect(repo.updateMany).not.toHaveBeenCalled();
    });

    it("deve clamp de toPosition quando maior que o tamanho da lista de destino", async () => {
      const cardId = "card-2";
      const fromCol = "col-1";

      const card = mkCard(cardId, fromCol, 0);
      const c1 = mkCard("card-1", fromCol, 0);
      const c3 = mkCard("card-3", fromCol, 1);

      repo.findById!.mockResolvedValue(card as any);
      repo.findManyByColumn!.mockResolvedValue([card as any, c1 as any, c3 as any]);

      (card.toJSON as jest.Mock).mockReturnValue({ id: cardId, columnId: fromCol, position: 2 });

      const result = await service.move(cardId, { toColumnId: fromCol, toPosition: 999 } as any);

      const updatedList = (repo.updateMany as jest.Mock).mock.calls[0][0] as any[];
      const moved = updatedList.find((x) => x.id === cardId);
      expect(moved.position).toBe(2);

      expect(result).toEqual({ id: cardId, columnId: fromCol, position: 2 });
    });

    it("deve clamp de toPosition quando negativo", async () => {
      const cardId = "card-2";
      const fromCol = "col-1";

      const card = mkCard(cardId, fromCol, 1);
      const c1 = mkCard("card-1", fromCol, 0);
      const c3 = mkCard("card-3", fromCol, 2);

      repo.findById!.mockResolvedValue(card as any);
      repo.findManyByColumn!.mockResolvedValue([c1 as any, card as any, c3 as any]);

      (card.toJSON as jest.Mock).mockReturnValue({ id: cardId, columnId: fromCol, position: 0 });

      const result = await service.move(cardId, { toColumnId: fromCol, toPosition: -10 } as any);

      const updatedList = (repo.updateMany as jest.Mock).mock.calls[0][0] as any[];
      const moved = updatedList.find((x) => x.id === cardId);
      expect(moved.position).toBe(0);

      expect(result).toEqual({ id: cardId, columnId: fromCol, position: 0 });
    });
  });
});
