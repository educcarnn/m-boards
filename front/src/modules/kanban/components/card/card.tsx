import React, { useMemo, useState } from "react";
import { Button, Card, Dropdown, Modal, Select, Space, Typography } from "antd";
import { DeleteOutlined, SwapOutlined, MoreOutlined } from "@ant-design/icons";
import type { CardItem, ColumnWithCards, ID } from "../../types/kanban.types";
import { useCards } from "../../hooks/useCards";

const { Text, Paragraph } = Typography;

type Props = {
  card: CardItem;
  columns: ColumnWithCards[];
  onChanged?: () => Promise<void> | void;
};

export function KanbanCard({ card, columns, onChanged }: Props) {
  const { removeCard, moveCard, loadingCards } = useCards(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [toColumnId, setToColumnId] = useState<ID | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const moveOptions = useMemo(
    () =>
      columns
        .filter((c) => c.id !== card.columnId)
        .map((c) => ({ label: c.name, value: c.id })),
    [columns, card.columnId]
  );

  const actionsMenu = useMemo(
    () => [
      {
        key: "move",
        label: "Mover",
        icon: <SwapOutlined />,
        onClick: () => setIsMoveOpen(true),
      },
      {
        key: "delete",
        label: "Excluir",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: "Excluir cartão?",
            content: "Essa ação não pode ser desfeita.",
            okText: "Excluir",
            okButtonProps: { danger: true },
            cancelText: "Cancelar",
            onOk: async () => {
              setIsDeleting(true);
              try {
                await removeCard(card.id);
                await onChanged?.();
              } finally {
                setIsDeleting(false);
              }
            },
          });
        },
      },
    ],
    [card.id, removeCard, onChanged]
  );

  return (
    <>
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        styles={{ body: { padding: 12 } }}
        title={<Text strong ellipsis>{card.title}</Text>}
        extra={
          <Dropdown
            menu={{ items: actionsMenu as any }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Dropdown>
        }
        loading={isDeleting}
      >
        {card.description ? (
          <Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 3 }}>
            {card.description}
          </Paragraph>
        ) : (
          <Text type="secondary">Sem descrição</Text>
        )}
      </Card>

      <Modal
        open={isMoveOpen}
        onCancel={() => {
          setIsMoveOpen(false);
          setToColumnId(null);
        }}
        title="Mover cartão"
        okText="Mover"
        cancelText="Cancelar"
        confirmLoading={loadingCards}
        onOk={async () => {
          if (!toColumnId) return;
          await moveCard({ cardId: card.id, toColumnId, position: card.position });
          await onChanged?.();
          setIsMoveOpen(false);
          setToColumnId(null);
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Destino</Text>
          <Select
            placeholder="Selecione a coluna"
            options={moveOptions}
            value={toColumnId ?? undefined}
            onChange={(v) => setToColumnId(v)}
            style={{ width: "100%" }}
          />
        </Space>
      </Modal>
    </>
  );
}
