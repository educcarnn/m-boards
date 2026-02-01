import { useCallback, useEffect, useMemo, useState } from "react";
import type { ID } from "../types/board.types";
import type { Board } from "../services/boards.service";
import { listBoards, getBoard, createBoard } from "../services/boards.service";

type UseBoardsState = {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
};

export function useBoards(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;

  const [state, setState] = useState<UseBoardsState>({
    boards: [],
    currentBoard: null,
    loading: false,
    error: null,
  });

  const fetchBoards = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await listBoards();
      setState((s) => ({ ...s, boards: data, loading: false }));
      return data;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao listar boards",
      }));
      return [];
    }
  }, []);

  const fetchBoard = useCallback(async (boardId: ID) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await getBoard(boardId);
      setState((s) => ({ ...s, currentBoard: data, loading: false }));
      return data;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao buscar board",
      }));
      return null;
    }
  }, []);

  const addBoard = useCallback(async (name: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const created = await createBoard(name);
      setState((s) => ({
        ...s,
        boards: [created, ...s.boards],
        currentBoard: s.currentBoard?.id === created.id ? created : s.currentBoard,
        loading: false,
      }));
      return created;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao criar board",
      }));
      throw e;
    }
  }, []);

  const setCurrentBoard = useCallback((board: Board | null) => {
    setState((s) => ({ ...s, currentBoard: board }));
  }, []);

  useEffect(() => {
    if (autoFetch) fetchBoards();
  }, [autoFetch, fetchBoards]);

  return useMemo(
    () => ({
      boards: state.boards,
      currentBoard: state.currentBoard,
      loadingBoards: state.loading,
      boardsError: state.error,
      fetchBoards,
      fetchBoard,
      addBoard,
      setCurrentBoard,
    }),
    [state, fetchBoards, fetchBoard, addBoard, setCurrentBoard]
  );
}
