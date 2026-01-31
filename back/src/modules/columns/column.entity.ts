export type ColumnProps = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Column {
  private props: ColumnProps;

  private constructor(props: ColumnProps) {
    this.props = props;
    this.validate();
  }

  static create(input: Omit<ColumnProps, "createdAt" | "updatedAt">) {
    const now = new Date();
    return new Column({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ColumnProps) {
    return new Column(props);
  }

  private validate() {
    if (!this.props.name || this.props.name.trim().length < 2) {
      throw new Error("Column name must have at least 2 characters.");
    }

    if (this.props.position < 0) {
      throw new Error("Column position must be >= 0.");
    }

    if (!this.props.boardId) {
      throw new Error("boardId is required.");
    }
  }

  get id() {
    return this.props.id;
  }

  get boardId() {
    return this.props.boardId;
  }

  get name() {
    return this.props.name;
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

  rename(name: string) {
    this.props.name = name;
    this.touch();
    this.validate();
  }

  move(position: number) {
    this.props.position = position;
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