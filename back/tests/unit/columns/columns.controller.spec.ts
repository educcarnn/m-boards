import { Test, TestingModule } from "@nestjs/testing";
import { ColumnsController } from "../../../src/modules/columns/columns.controller";
import { ColumnsService } from "../../../src/modules/columns/columns.service";

describe("ColumnsController", () => {
  let controller: ColumnsController;
  let service: jest.Mocked<ColumnsService>;

  const serviceMock: Partial<jest.Mocked<ColumnsService>> = {
    create: jest.fn(),
    listByBoard: jest.fn(),
    rename: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
    service = module.get(ColumnsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve chamar service.create com o dto", async () => {
      const dto = { boardId: "board-1", name: "Backlog", position: 1 };
      const result = { id: "col-1", ...dto };

      service.create!.mockResolvedValue(result as any);

      const response = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe("listByBoard", () => {
    it("deve chamar service.listByBoard com boardId", async () => {
      const boardId = "board-1";
      const result = [{ id: "col-1", name: "Backlog" }];

      service.listByBoard!.mockResolvedValue(result as any);

      const response = await controller.listByBoard(boardId);

      expect(service.listByBoard).toHaveBeenCalledWith(boardId);
      expect(response).toEqual(result);
    });
  });

  describe("rename", () => {
    it("deve chamar service.rename com id e name", async () => {
      const id = "col-1";
      const name = "Novo nome";
      const result = { id, name };

      service.rename!.mockResolvedValue(result as any);

      const response = await controller.rename(id, name);

      expect(service.rename).toHaveBeenCalledWith(id, name);
      expect(response).toEqual(result);
    });
  });

  describe("remove", () => {
    it("deve chamar service.remove com id", async () => {
      const id = "col-1";
      const result = { ok: true };

      service.remove!.mockResolvedValue(result as any);

      const response = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });
});
