import { http } from "../../../shared/api/axios";
import type {
  ColumnWithCards,
  CreateCardInput,
  CardItem,
  MoveCardInput,
  ID,
} from "../types/kanban.types";


export async function listColumnsByBoard(boardId: ID): Promise<ColumnWithCards[]> {
  const { data } = await http.get<any[]>(`/columns/board/${boardId}`);
  return data.map((col) => ({
    id: col.id,
    boardId: col.boardId ?? boardId,
    name: col.name ?? col.title ?? "Sem nome",
    position: col.position,
    cards: Array.isArray(col.cards)
      ? col.cards.map((c: any) => ({
          id: c.id,
          columnId: c.columnId ?? col.id,
          title: c.title ?? c.name ?? "Sem título",
          description: c.description ?? null,
          position: c.position,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
      : [],
  }));
}

export async function create(input: CreateCardInput): Promise<CardItem> {
  const { data } = await http.post<CardItem>("/cards", input);
  return data;
}
export async function remove(cardId: ID): Promise<void> {
  await http.delete(`/cards/${cardId}`);
}

export async function move(input: MoveCardInput): Promise<void> {
  await http.patch(`/cards/${input.cardId}/move`, {
    toColumnId: input.toColumnId,
    position: input.position,
  });
}
