import React from "react";
import { Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type Props = {
  onClick: () => void;
};

export function AddColumnCard({ onClick }: Props) {
  return (
    <Card
      size="small"
      style={{
        width: 320,
        height: 60,             
        borderRadius: 12,
        border: "1px dashed rgba(0,0,0,0.25)",
        background: "rgba(0,0,0,0.02)",
        flex: "0 0 auto",
        alignSelf: "flex-start", 
      }}
      styles={{ body: { padding: 12, height: "100%" } }}
    >
      <Button
        type="text"
        icon={<PlusOutlined />}
        onClick={onClick}
        style={{ width: "100%", textAlign: "left" }}
      >
        Adicionar uma coluna
      </Button>
    </Card>
  );
}
