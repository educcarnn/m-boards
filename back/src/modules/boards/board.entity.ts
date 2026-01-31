import { DomainError } from "src/shared/errors/domain-error";

export type BoardProps = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Board {
  private constructor(private props: BoardProps) {}

  static create(params: { id: string; name: string; now?: Date }): Board {
    const now = params.now ?? new Date();
    const name = Board.normalizeName(params.name);

    Board.validateName(name);

    return new Board({
      id: params.id,
      name,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: BoardProps): Board {
    Board.validateName(props.name);
    return new Board({ ...props });
  }

  rename(newName: string, now: Date = new Date()): void {
    const name = Board.normalizeName(newName);
    Board.validateName(name);

    this.props.name = name;
    this.props.updatedAt = now;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static normalizeName(name: string): string {
    return (name ?? '').trim();
  }

  private static validateName(name: string): void {
    if (!name) throw new DomainError('Board name is required');
    if (name.length < 2)
      throw new DomainError('Board name must be at least 2 characters');
    if (name.length > 80)
      throw new DomainError('Board name must be at most 80 characters');
  }
}
