import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../entities/user.entity";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(60)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(60)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(60)
    password: string;

    @IsOptional()
    @IsEnum(UserRole, {
        message: 'El rol debe ser uno de los siguientes: admin, agent, user',
    })
    role?: UserRole;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    department?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    phone?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

}
