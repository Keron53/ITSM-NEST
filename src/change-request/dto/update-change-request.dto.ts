import { PartialType } from '@nestjs/mapped-types';
import { CreateChangeRequestDto } from './create-change-request.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateChangeRequestDto extends PartialType(CreateChangeRequestDto) {
    @IsOptional()
    @IsString()
    closureNotes?: string;
}
