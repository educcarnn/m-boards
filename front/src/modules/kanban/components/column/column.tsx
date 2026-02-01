import React, { useMemo, useState } from "react";
import { Button, Card, Form, Input, Modal, Space, Typography, Tooltip, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnWithCards } from "../../types/board.types";
import { KanbanCard } from "../card/card";
import { CreateCardInput } from "../../types/card.type";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const { Text } = Typography;

type Props = {
  column: ColumnWithCards;
  allColumns: ColumnWithCards[];
  createCard: (input: Omit<CreateCardInput, "boardId">) => Promise<any>;
  renameColumn: (columnId: string, name: string) => Promise<any>;
  deleteColumn: (columnId: string) => Promise<any>; 
  onChanged?: () => void | Promise<void>;
};

type CreateCardForm = {
  title: string;
  description?: string;
};

type RenameColumnForm = {
  name: string;
};

export function KanbanColumn({
  column,
  allColumns,
  createCard,
  renameColumn,
  deleteColumn,
  onChanged,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm<CreateCardForm>();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameForm] = Form.useForm<RenameColumnForm>();

  const cardIds = useMemo(() => column.cards.map((c) => c.id), [column.cards]);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  const openRename = () => {
    setIsRenameOpen(true);
    renameForm.setFieldsValue({ name: column.name });
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: "Excluir coluna?",
      content:
        column.cards?.length
          ? `Essa coluna tem ${column.cards.length} card(s). Se você excluir, pode perder os cards`
          : "Tem certeza que deseja excluir esta coluna?",
      okText: "Excluir",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteColumn(String(column.id));
          message.success("Coluna excluída.");
          await onChanged?.();
        } catch (err) {
          message.error("Não foi possível excluir a coluna.");
          throw err;
        }
      },
    });
  };

  return (
    <>
      <Card
        size="small"
        title={
          <Space direction="vertical" size={0}>
            <Text strong>{column.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {column.cards.length} card(s)
            </Text>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Editar coluna">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openRename();
                }}
              />
            </Tooltip>

            <Tooltip title="Excluir coluna">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
              />
            </Tooltip>

            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              Adicionar
            </Button>
          </Space>
        }
        style={{
          width: 320,
          borderRadius: 12,
          flex: "0 0 auto",
          outline: isOver ? "2px solid rgba(24,144,255,0.6)" : "none",
          outlineOffset: 2,
        }}
        styles={{ body: { padding: 12 } }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 20 }}
          >
            {column.cards.map((card) => (
              <KanbanCard key={card.id} card={card} columns={allColumns} onChanged={onChanged} />
            ))}
          </div>
        </SortableContext>
      </Card>

      <Modal
        open={isRenameOpen}
        title="Editar coluna"
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={isRenaming}
        onCancel={() => {
          setIsRenameOpen(false);
          renameForm.resetFields();
        }}
        onOk={async () => {
          const values = await renameForm.validateFields();
          const nextName = (values.name ?? "").trim();

          setIsRenaming(true);
          try {
            await renameColumn(String(column.id), nextName);
            await onChanged?.();
            setIsRenameOpen(false);
            renameForm.resetFields();
          } finally {
            setIsRenaming(false);
          }
        }}
      >
        <Form layout="vertical" form={renameForm}>
          <Form.Item
            label="Nome da coluna"
            name="name"
            rules={[
              { required: true, message: "Informe o nome" },
              { min: 2, message: "Mínimo 2 caracteres" },
              { max: 40, message: "Máximo 40 caracteres" },
            ]}
          >
            <Input placeholder="Ex: Em andamento" maxLength={40} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isModalOpen}
        title={`Novo cartão em "${column.name}"`}
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={isCreating}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={async () => {
          const values = await form.validateFields();
          setIsCreating(true);

          try {
            const nextPosition =
              (column.cards.reduce((max, c) => Math.max(max, c.position ?? 0), 0) || 0) + 1;

            await createCard({
              columnId: column.id,
              title: values.title,
              description: values.description,
              position: nextPosition,
            });

            await onChanged?.();
            setIsModalOpen(false);
            form.resetFields();
          } finally {
            setIsCreating(false);
          }
        }}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: "Informe o título" }]}
          >
            <Input placeholder="Ex: Ajustar endpoint /cards/move" maxLength={80} />
          </Form.Item>

          <Form.Item label="Descrição" name="description">
            <Input.TextArea placeholder="Opcional" rows={4} maxLength={400} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
