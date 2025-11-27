
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import {
    ChangePriority,
    ChangeStatus,
    ChangeType
} from "../entities/change-request.entity";
export class CreateChangeRequestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description: string;

    @IsString()
    justification?: string;

    @IsOptional()
    @IsEnum(ChangeType, {
        message: 'El tipo debe ser standard, normal o emergency',
    })
    type?: ChangeType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    area: string;

    @IsOptional()
    @IsEnum(ChangePriority)
    priority?: ChangePriority;

    @IsOptional()
    @IsEnum(ChangeStatus)
    status?: ChangeStatus;

    @IsString()
    @IsNotEmpty()
    implementationPlan: string;

    @IsString()
    @IsNotEmpty()
    rollbackPlan: string;

    @IsNotEmpty()
    @IsInt()
    requesterId: number;
    
    @IsOptional()
    @IsInt()
    assignedId?: number;

    @IsOptional()
    @IsInt()
    approverId?: number;
}