import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Board, ColumnWithCards, ID } from "../types/kanban.types";
import { listBoards } from "../services/boards.service";
import { listColumnsByBoard } from "../services/cards.service";

type BoardContextValue = {
  boards: Board[];
  selectedBoardId: ID | null;
  columns: ColumnWithCards[];
  isLoadingBoards: boolean;
  isLoadingBoardData: boolean;
  error: Error | null;

  loadBoards: () => Promise<void>;
  loadBoardData: (boardId: ID) => Promise<void>;
  selectBoard: (boardId: ID) => Promise<void>;
  refreshSelectedBoard: () => Promise<void>
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithCards[]>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};
;

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: React.PropsWithChildren) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<ID | null>(null);
  const [columns, setColumns] = useState<ColumnWithCards[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [isLoadingBoardData, setIsLoadingBoardData] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBoards = useCallback(async () => {
    setIsLoadingBoards(true);
    setError(null);
    try {
      const data = await listBoards();
      setBoards(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoadingBoards(false);
    }
  }, []);

  const loadBoardData = useCallback(async (boardId: ID) => {
    setIsLoadingBoardData(true);
    setError(null);
    try {
      const cols = await listColumnsByBoard(boardId);
      cols.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      cols.forEach((c) => c.cards.sort((x, y) => (x.position ?? 0) - (y.position ?? 0)));
      setColumns(cols);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoadingBoardData(false);
    }
  }, []);

  const selectBoard = useCallback(
    async (boardId: ID) => {
      setSelectedBoardId(boardId);
      await loadBoardData(boardId);
    },
    [loadBoardData]
  );

  const refreshSelectedBoard = useCallback(async () => {
    if (!selectedBoardId) return;
    await loadBoardData(selectedBoardId);
  }, [selectedBoardId, loadBoardData]);

  const value = useMemo<BoardContextValue>(
    () => ({
      boards,
      selectedBoardId,
      columns,
      isLoadingBoards,
      isLoadingBoardData,
      error,
      loadBoards,
      loadBoardData,
      selectBoard,
      refreshSelectedBoard,
      setColumns,
      setError,
    }),
    [
      boards,
      selectedBoardId,
      columns,
      isLoadingBoards,
      isLoadingBoardData,
      error,
      loadBoards,
      loadBoardData,
      selectBoard,
      refreshSelectedBoard,
    ]
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext deve ser usado dentro de BoardProvider");
  return ctx;
}
