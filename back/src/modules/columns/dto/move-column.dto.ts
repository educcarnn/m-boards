import { IsInt, IsUUID, Min } from "class-validator";

export class MoveColumnDto {
  @IsUUID()
  boardId!: string;

  @IsInt()
  @Min(0)
  toPosition!: number;
}
