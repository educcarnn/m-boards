import React, { useEffect, useMemo, useState } from "react";
import { Button, Layout, Select, Space, Spin, Typography, Modal, Form, Input, Card as AntCard } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useBoards } from "../../hooks/useBoards";
import { useCards } from "../../hooks/useCards";
import type { Board, KanbanColumn as KanbanColumnType, ID } from "../../types/kanban.types";
import { KanbanColumn } from "../column/column";
import { ErrorMessage } from "../../../../shared/components/ErrorMessage";
import { AddColumnCard } from "../column/addColumn";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type CreateBoardForm = { name: string };
type CreateColumnForm = { name: string };

export function KanbanBoard() {
  const { boards, loadingBoards, boardsError, fetchBoards, addBoard } = useBoards({ autoFetch: true });

  const [selectedBoardId, setSelectedBoardId] = useState<ID | null>(null);
  const { columns, loadingCards, cardsError, fetchColumns, createColumn, createCard, moveCard } =
    useCards(selectedBoardId);

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardForm] = Form.useForm<CreateBoardForm>();

  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [columnForm] = Form.useForm<CreateColumnForm>();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    if (boards.length && !selectedBoardId) setSelectedBoardId(boards[0].id as ID);
  }, [boards, selectedBoardId]);

  useEffect(() => {
    if (selectedBoardId) fetchColumns();
  }, [selectedBoardId, fetchColumns]);

  const boardOptions = useMemo(
    () => boards.map((b: Board) => ({ label: b.name, value: b.id })),
    [boards]
  );

  const error = boardsError ?? cardsError;
  const isLoadingBoards = loadingBoards;
  const isLoadingBoardData = loadingCards;

  const refresh = async () => {
    if (selectedBoardId) {
      await fetchColumns();
      return;
    }
    await fetchBoards();
  };

  const findColumnByCardId = (cardId: string) => {
    for (const col of columns) {
      if (col.cards?.some((c) => c.id === cardId)) return col;
    }
    return null;
  };

  const findCardById = (cardId: string) => {
    for (const col of columns) {
      const found = col.cards?.find((c) => c.id === cardId);
      if (found) return found;
    }
    return null;
  };

  const getCardIndexInColumn = (columnId: string, cardId: string) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return -1;
    return (col.cards ?? []).findIndex((c) => c.id === cardId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    document.body.style.cursor = "grabbing";
    setActiveCardId(String(event.active.id));
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    document.body.style.cursor = "";
    setActiveCardId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    document.body.style.cursor = "";
    setActiveCardId(null);

    if (!over) return;

    const activeCardIdLocal = String(active.id);
    const overId = String(over.id);

    const fromColumn = findColumnByCardId(activeCardIdLocal);
    if (!fromColumn) return;

    let toColumnId: string | null = null;

    if (overId.startsWith("column-")) {
      toColumnId = overId.replace("column-", "");
    } else {
      const overColumn = findColumnByCardId(overId);
      toColumnId = overColumn?.id ?? null;
    }

    if (!toColumnId) return;

    let toPosition = 0;

    if (overId.startsWith("column-")) {
      const destCol = columns.find((c) => c.id === toColumnId);
      toPosition = (destCol?.cards?.length ?? 0);
    } else {
      const idx = getCardIndexInColumn(toColumnId, overId);
      toPosition = idx >= 0 ? idx : 0;
    }

    if (fromColumn.id === toColumnId) {
      const fromIndex = getCardIndexInColumn(fromColumn.id, activeCardIdLocal);
      if (fromIndex === toPosition) return;
    }

    try {
      await moveCard({ cardId: activeCardIdLocal, toColumnId, position: toPosition });

      setTimeout(() => {
        fetchColumns();
      }, 120);
    } catch {
      await fetchColumns();
    }
  };

  const overlayCard = activeCardId ? findCardById(activeCardId) : null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setIsCreateBoardOpen(true)}>
            Novo quadro
          </Button>

          <Select
            loading={isLoadingBoards}
            placeholder="Selecione um quadro"
            options={boardOptions}
            value={selectedBoardId ?? undefined}
            onChange={(id) => setSelectedBoardId(id as ID)}
            style={{ width: 280 }}
          />

          <Button onClick={refresh}>Atualizar</Button>
        </Space>
      </Header>

      <Content style={{ padding: 16 }}>
        {error && <ErrorMessage error={error} />}

        {!selectedBoardId ? (
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              border: "1px dashed rgba(0,0,0,0.2)",
            }}
          >
            <Title level={5} style={{ marginTop: 0 }}>
              Selecione um quadro
            </Title>
            <Text type="secondary">
              Assim que você escolher um board, eu carrego as colunas e os cartões.
            </Text>
          </div>
        ) : (
          <Spin spinning={isLoadingBoardData}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 8,
                  alignItems: "flex-start",
                }}
              >
                <AddColumnCard onClick={() => setIsCreateColumnOpen(true)} />

                {columns.map((col: KanbanColumnType) => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    allColumns={columns}
                    createCard={createCard}
                    onChanged={async () => {
                      await fetchColumns();
                    }}
                  />
                ))}
              </div>

              <DragOverlay
                dropAnimation={{
                  duration: 220,
                  easing: "cubic-bezier(0.2, 0, 0, 1)",
                }}
              >
                {overlayCard ? (
                  <div style={{ width: 320 }}>
                    <AntCard size="small" styles={{ body: { padding: 12 } }}>
                      <Text strong ellipsis>
                        {overlayCard.title}
                      </Text>
                      {overlayCard.description ? (
                        <Paragraph style={{ marginBottom: 0, marginTop: 8 }} ellipsis={{ rows: 3 }}>
                          {overlayCard.description}
                        </Paragraph>
                      ) : (
                        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                          Sem descrição
                        </Text>
                      )}
                    </AntCard>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </Spin>
        )}
      </Content>

      <Modal
        open={isCreateBoardOpen}
        title="Novo quadro"
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={isCreatingBoard}
        onCancel={() => {
          setIsCreateBoardOpen(false);
          boardForm.resetFields();
        }}
        onOk={async () => {
          const values = await boardForm.validateFields();
          setIsCreatingBoard(true);
          try {
            const created = await addBoard(values.name);
            setSelectedBoardId(created.id as ID);
            setIsCreateBoardOpen(false);
            boardForm.resetFields();
          } finally {
            setIsCreatingBoard(false);
          }
        }}
      >
        <Form layout="vertical" form={boardForm}>
          <Form.Item
            label="Nome do quadro"
            name="name"
            rules={[
              { required: true, message: "Informe o nome do quadro" },
              { min: 2, message: "Mínimo 2 caracteres" },
            ]}
          >
            <Input placeholder="Ex: Empresa XYZ" maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isCreateColumnOpen}
        title="Nova coluna"
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={isCreatingColumn}
        onCancel={() => {
          setIsCreateColumnOpen(false);
          columnForm.resetFields();
        }}
        onOk={async () => {
          const values = await columnForm.validateFields();
          setIsCreatingColumn(true);
          try {
            await createColumn(values.name);
            setIsCreateColumnOpen(false);
            columnForm.resetFields();
          } finally {
            setIsCreatingColumn(false);
          }
        }}
      >
        <Form layout="vertical" form={columnForm}>
          <Form.Item
            label="Nome da coluna"
            name="name"
            rules={[
              { required: true, message: "Informe o nome da coluna" },
              { min: 2, message: "Mínimo 2 caracteres" },
            ]}
          >
            <Input placeholder="Ex: Backlog" maxLength={40} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
