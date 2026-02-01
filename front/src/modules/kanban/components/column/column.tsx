import React, { useState } from "react";
import { Button, Card, Form, Input, Modal, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnWithCards, CreateCardInput } from "../../types/kanban.types";
import { KanbanCard } from "../card/card";

const { Text } = Typography;

type Props = {
  column: ColumnWithCards;
  allColumns: ColumnWithCards[];
  createCard: (input: Omit<CreateCardInput, "boardId">) => Promise<any>;
  onChanged?: () => void | Promise<void>;
};

type CreateCardForm = {
  title: string;
  description?: string;
};

export function KanbanColumn({ column, allColumns, createCard, onChanged }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm<CreateCardForm>();

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
          <Button size="small" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Adicionar
          </Button>
        }
        style={{ width: 320, borderRadius: 12, flex: "0 0 auto" }}
        styles={{ body: { padding: 12 } }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} columns={allColumns} onChanged={onChanged} />
          ))}
        </div>
      </Card>

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
            await createCard({ columnId: column.id, title: values.title, description: values.description });
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
