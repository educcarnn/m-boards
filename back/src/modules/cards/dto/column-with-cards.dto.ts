export type CardDto = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ColumnWithCardsDto = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  cards: CardDto[];
};
