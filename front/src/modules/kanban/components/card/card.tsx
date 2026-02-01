import React, { useMemo, useState } from "react";
import { Button, Card, Dropdown, Modal, Select, Space, Typography } from "antd";
import { DeleteOutlined, SwapOutlined, MoreOutlined } from "@ant-design/icons";
import type { CardItem, ColumnWithCards, ID } from "../../types/kanban.types";
import { useCards } from "../../hooks/useCards";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      cardId: card.id,
      columnId: card.columnId,
    },
  });

  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "transform 120ms ease" 
      : "transform 220ms cubic-bezier(0.2, 0, 0, 1)",
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    willChange: "transform"
  };

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
      <div ref={setNodeRef} style={dndStyle}>
        <Card
          size="small"
          style={{
            marginBottom: 8,
            boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
          }}
          styles={{ body: { padding: 12 } }}
          title={
            <div
              {...attributes}
              {...listeners}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Text strong ellipsis style={{ flex: 1 }}>
                {card.title}
              </Text>
            </div>
          }
          extra={
            <Dropdown
              menu={{ items: actionsMenu as any }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined />}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
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
      </div>

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
