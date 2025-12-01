import { IsNotEmpty, IsString, IsEnum, MaxLength, IsOptional, IsInt } from "class-validator";
import { IncidentCategory, IncidentPriority, IncidentStatus, RelatedDevices } from "../entities/incident.entity";

export class CreateIncidentDto {

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
    incidentArea: string;

    @IsEnum(IncidentCategory)
    @IsNotEmpty()
    category: IncidentCategory;

    @IsEnum(IncidentPriority)
    @IsNotEmpty()
    priority: IncidentPriority;

    @IsEnum(RelatedDevices)
    @IsNotEmpty()
    relatedDevice: RelatedDevices;

    @IsEnum(IncidentStatus)
    @IsOptional()
    status?: IncidentStatus;

    @IsNotEmpty()
    @IsInt()
    reporterId: number;

    @IsOptional()
    @IsInt()
    assignedId?: number;

    @IsOptional()
    @IsInt()
    relatedProblem?: number;

    @IsOptional()
    @IsString()
    closureNotes?: string;
}
