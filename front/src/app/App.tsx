import React from "react";
import { Providers } from "./providers";
import { KanbanBoard } from "../modules/kanban/components/board/board";

export default function App() {
  return (
    <Providers>
      <KanbanBoard />
    </Providers>
  );
}
