import { useCallback, useMemo, useState } from "react";
import type {
  ColumnWithCards,
  ID,
} from "../types/board.types";
import { create, remove, move } from "../services/cards.service";
import { listColumnsByBoard, createColumn as createColumnService } from "../services/columns.service";
import { CreateCardInput, MoveCardInput } from "../types/card.type";

type State = {
  columns: ColumnWithCards[];
  loading: boolean;
  error: string | null;
};

type CreateCardUIInput = Omit<CreateCardInput, "boardId">;

export function useCards(boardId: ID | null) {
  const [state, setState] = useState<State>({
    columns: [],
    loading: false,
    error: null,
  });

  const fetchColumns = useCallback(async () => {
    if (!boardId) {
      setState((s) => ({ ...s, columns: [] }));
      return [];
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await listColumnsByBoard(boardId);
      setState((s) => ({ ...s, columns: data, loading: false }));
      return data;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao carregar colunas",
      }));
      return [];
    }
  }, [boardId]);

  const createColumn = useCallback(
    async (name: string) => {
      if (!boardId) throw new Error("boardId não definido");

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        await createColumnService({
          boardId,
          name,
          position: state.columns.length,
        });

        const data = await fetchColumns();
        setState((s) => ({ ...s, loading: false }));
        return data;
      } catch (e: any) {
        setState((s) => ({
          ...s,
          loading: false,
          error: e?.message ?? "Erro ao criar coluna",
        }));
        throw e;
      }
    },
    [boardId, fetchColumns, state.columns.length]
  );

const createCard = useCallback(
  async (input: CreateCardUIInput) => {
    if (!boardId) throw new Error("boardId não definido");
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const payload: CreateCardInput = { ...input, boardId };
      const created = await create(payload);
      await fetchColumns();
      setState((s) => ({ ...s, loading: false }));
      return created;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao criar card",
      }));
      throw e;
    }
  },
  [boardId, fetchColumns]
);

  const removeCard = useCallback(
    async (cardId: ID) => {
      await remove(cardId);
      await fetchColumns();
    },
    [fetchColumns]
  );

  const moveCard = useCallback(
    async (input: MoveCardInput) => {
      await move(input);
      await fetchColumns();
    },
    [fetchColumns]
  );

  return useMemo(
    () => ({
      columns: state.columns,
      loadingCards: state.loading,
      cardsError: state.error,
      fetchColumns,
      createColumn,
      createCard,
      removeCard,
      moveCard,
    }),
    [state, fetchColumns, createColumn, createCard, removeCard, moveCard]
  );
}
