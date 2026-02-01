import { http } from "../../../shared/api/axios";
import type { ID } from "../types/kanban.types";

export type Board = {
  id: string;
  name: string;
};

export async function listBoards(): Promise<Board[]> {
  const { data } = await http.get<Board[]>("/boards");
  return data;
}

export async function getBoard(boardId: ID): Promise<Board> {
  const { data } = await http.get<Board>(`/boards/${boardId}`);
  return data;
}

export async function createBoard(name: string): Promise<Board> {
  const { data } = await http.post<Board>("/boards", { name });
  return data;
}
