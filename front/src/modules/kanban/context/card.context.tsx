import React, { createContext, useCallback, useContext, useMemo } from "react";
import { message } from "antd";
import type { CardItem, ColumnWithCards, CreateCardInput, ID, MoveCardInput } from "../types/kanban.types";
import { move, create } from "../services/cards.service";
import { useBoardContext } from "./board.context";

type CardContextValue = {
  createCard: (input: CreateCardInput) => Promise<void>;
  deleteCard: (cardId: ID) => Promise<void>;
  moveCard: (input: MoveCardInput) => Promise<void>;
};

const CardContext = createContext<CardContextValue | null>(null);

function removeCardFromColumns(columns: ColumnWithCards[], cardId: ID) {
  return columns.map((col) => ({
    ...col,
    cards: col.cards.filter((c) => c.id !== cardId),
  }));
}

function findCard(columns: ColumnWithCards[], cardId: ID): CardItem | null {
  for (const col of columns) {
    const found = col.cards.find((c) => c.id === cardId);
    if (found) return found;
  }
  return null;
}

function upsertCardInColumn(columns: ColumnWithCards[], columnId: ID, card: CardItem) {
  return columns.map((col) => {
    if (col.id !== columnId) return col;
    const exists = col.cards.some((c) => c.id === card.id);
    return {
      ...col,
      cards: exists ? col.cards.map((c) => (c.id === card.id ? card : c)) : [card, ...col.cards],
    };
  });
}

export function CardProvider({ children }: React.PropsWithChildren) {
  const { selectedBoardId, loadBoardData, setColumns, setError } = useBoardContext();

  const createCard = useCallback(
    async (input: CreateCardInput) => {
      setError(null);
      try {
        const created = await create(input);
        setColumns((prev) => upsertCardInColumn(prev, input.columnId, created));
        message.success("Cartão criado!");
      } catch (e) {
        setError(e as Error);
        message.error((e as Error).message);
      }
    },
    [setColumns, setError]
  );

  const deleteCard = useCallback(
    async (cardId: ID) => {
      setError(null);
      setColumns((prev) => removeCardFromColumns(prev, cardId));

      try {
        await deleteCard(cardId);
        message.success("Cartão excluído!");
      } catch (e) {
        setError(e as Error);
        message.error((e as Error).message);

        if (selectedBoardId) {  
          await loadBoardData(selectedBoardId);
        }
      }
    },
    [selectedBoardId, loadBoardData, setColumns, setError]
  );

  const moveCard = useCallback(
    async (input: MoveCardInput) => {
      setError(null);

      setColumns((prev) => {
        const card = findCard(prev, input.cardId);
        if (!card) return prev;

        const removed = removeCardFromColumns(prev, input.cardId);
        const moved: CardItem = { ...card, columnId: input.toColumnId };
        return upsertCardInColumn(removed, input.toColumnId, moved);
      });

      try {
        await move(input);
        message.success("Cartão movido!");
      } catch (e) {
        setError(e as Error);
        message.error((e as Error).message);

        if (selectedBoardId) {
          await loadBoardData(selectedBoardId);
        }
      }
    },
    [selectedBoardId, loadBoardData, setColumns, setError]
  );

  const value = useMemo<CardContextValue>(
    () => ({
      createCard,
      deleteCard,
      moveCard,
    }),
    [createCard, deleteCard, moveCard]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCardContext() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCardContext deve ser usado dentro de CardProvider");
  return ctx;
}
