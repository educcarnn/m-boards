export class BoardResponseDto {
  id!: string;
  name!: string;
  createdAt!: string;
  updatedAt!: string;

  static from(domain: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): BoardResponseDto {
    return {
      id: domain.id,
      name: domain.name,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
