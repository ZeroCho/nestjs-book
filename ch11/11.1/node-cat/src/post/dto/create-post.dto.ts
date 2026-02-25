import { IsString, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  content: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  url?: string;
}
