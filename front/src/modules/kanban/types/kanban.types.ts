export type ID = string;

export type Board = {
  id: ID;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Column = {
  id: ID;
  boardId: ID;
  name: string;
  position?: number;
};

export type CardItem = {
  id: ID;
  columnId: ID;
  title: string;
  description?: string | null;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ColumnWithCards = Column & {
  cards: CardItem[];
};

export type CreateCardInput = {
  boardId: ID;
  columnId: ID;
  title: string;
  description?: string;
  position?: number;
};

export type MoveCardInput = {
  cardId: ID;
  toColumnId: ID;
  position?: number;
};

export type KanbanBoard = Board & {
  columns: ColumnWithCards[];
};

export type KanbanColumn = ColumnWithCards;


