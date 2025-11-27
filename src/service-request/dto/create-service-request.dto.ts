import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { RequestPriority, RequestStatus } from "../entities/service-request.entity";

export class CreateServiceRequestDto {
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
    originArea: string;

    @IsString()
    @IsOptional()
    @MaxLength(60)
    destinationArea: string;

    @IsOptional()
    @IsEnum(RequestPriority, {
        message: 'La prioridad debe ser válida (low, medium, high, critical)',
    })
    priority?: RequestPriority;

    @IsOptional()
    @IsEnum(RequestStatus)
    status?: RequestStatus;

    @IsNotEmpty()
    @IsInt()
    requesterId: number;

    @IsOptional()
    @IsInt()
    receiverId?: number;
}
