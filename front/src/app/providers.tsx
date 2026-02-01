import React from "react";
import { ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import { BoardProvider } from "../modules/kanban/context/board.context";
import { CardProvider } from "../modules/kanban/context/card.context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={ptBR}>
      <BoardProvider>
        <CardProvider>{children}</CardProvider>
      </BoardProvider>
    </ConfigProvider>
  );
}
