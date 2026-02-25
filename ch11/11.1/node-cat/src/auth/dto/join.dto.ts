import { IsAlphanumeric, IsString, MinLength } from "class-validator";

export class JoinDto {
  @IsString()
  id: string;

  @IsString()
  nick: string;

  @IsAlphanumeric()
  @MinLength(8)
  password: string;
}
