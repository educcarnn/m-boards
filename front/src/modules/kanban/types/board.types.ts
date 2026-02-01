import { CardItem } from "./card.type";
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

export type KanbanBoard = Board & {
  columns: ColumnWithCards[];
};

export type ColumnWithCards = Column & {
  cards: CardItem[];
};

export type KanbanColumn = ColumnWithCards;


