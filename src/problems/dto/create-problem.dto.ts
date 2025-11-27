import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ProblemCategory, ProblemPriority, ProblemStatus } from "../entities/problem.entity";

export class CreateProblemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    problemArea: string;

    @IsOptional()
    @IsEnum(ProblemCategory, {
        message: 'La categoría debe ser hardware, software, red o seguridad',
    })
    category?: ProblemCategory;

    @IsOptional()
    @IsEnum(ProblemPriority, {
        message: 'La prioridad debe ser low, medium, high o critical',
    })
    priority?: ProblemPriority;

    @IsOptional()
    @IsEnum(ProblemStatus, {
        message: 'El estado debe ser pending, in_progress, resolved, closed o canceled',
    })
    status?: ProblemStatus;

    @IsNotEmpty()
    @IsInt()
    reporterId: number;

    @IsOptional()
    @IsInt()
    assignedId?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    cause: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    implementedSolution: string;
}
