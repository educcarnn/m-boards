import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  toColumnId!: string;

  @IsInt()
  @Min(0)
  toPosition!: number;
}