import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class AuthDto {
  @Transform(({ value }: { value: unknown }) => normalizeEmail(value))
  @IsString()
  @Length(3, 254)
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}
