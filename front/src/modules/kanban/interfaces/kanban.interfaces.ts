import type {
  Board,
  ColumnWithCards,
  ID,
  CreateCardInput,
  MoveCardInput,
} from "../types/kanban.types";

export type KanbanState = {
  boards: Board[];
  selectedBoardId: ID | null;
  columns: ColumnWithCards[];
  isLoadingBoards: boolean;
  isLoadingBoardData: boolean;
  error: Error | null;
};

export type KanbanActions = {
  loadBoards: () => Promise<void>;
  selectBoard: (boardId: ID) => Promise<void>;
  refreshSelectedBoard: () => Promise<void>;
  createCard: (input: CreateCardInput) => Promise<void>;
  deleteCard: (cardId: ID) => Promise<void>;
  moveCard: (input: MoveCardInput) => Promise<void>;
};

export type KanbanContextValue = KanbanState & KanbanActions;
