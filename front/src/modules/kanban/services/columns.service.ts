import { http } from "../../../shared/api/axios";
import type { ID, ColumnWithCards } from "../types/kanban.types";

export type CreateColumnInput = {
  boardId: ID;
  name: string;
  position: number;
};

export async function createColumn(input: CreateColumnInput): Promise<ColumnWithCards> {
  const { data } = await http.post<any>("/columns", input);
  return {
    id: data.id,
    boardId: data.boardId,
    name: data.name,
    position: data.position,
    cards: [],
  };
}

export async function listColumnsByBoard(boardId: ID): Promise<ColumnWithCards[]> {
  const { data } = await http.get<any[]>(`/columns/board/${boardId}`);

  return data.map((col) => ({
    id: col.id,
    boardId: col.boardId,
    name: col.name,
    position: col.position,
    cards: Array.isArray(col.cards) ? col.cards : [],
  }));
}
