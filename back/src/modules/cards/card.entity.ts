export type CardProps = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Card {
  private props: CardProps;

  private constructor(props: CardProps) {
    this.props = props;
    this.validate();
  }

  static create(input: Omit<CardProps, "createdAt" | "updatedAt">) {
    const now = new Date();
    return new Card({ ...input, createdAt: now, updatedAt: now });
  }

  static restore(props: CardProps) {
    return new Card(props);
  }

  private validate() {
    if (!this.props.title || this.props.title.trim().length < 2) {
      throw new Error("Card title must have at least 2 characters.");
    }
    if (this.props.position < 0) {
      throw new Error("Card position must be >= 0.");
    }
    if (!this.props.boardId) throw new Error("boardId is required.");
    if (!this.props.columnId) throw new Error("columnId is required.");
  }

  get id() {
    return this.props.id;
  }
  get boardId() {
    return this.props.boardId;
  }
  get columnId() {
    return this.props.columnId;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description ?? null;
  }
  get position() {
    return this.props.position;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  updateDetails(input: { title?: string; description?: string | null }) {
    if (input.title !== undefined) this.props.title = input.title;
    if (input.description !== undefined) this.props.description = input.description;
    this.touch();
    this.validate();
  }

  moveTo(input: { toColumnId: string; toPosition: number }) {
    if (!input.toColumnId) throw new Error("toColumnId is required.");
    if (input.toPosition < 0) throw new Error("toPosition must be >= 0.");

    this.props.columnId = input.toColumnId;
    this.props.position = input.toPosition;

    this.touch();
    this.validate();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props };
  }
}
