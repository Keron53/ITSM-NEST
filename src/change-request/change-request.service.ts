import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';
import { AppGateway } from '../gateways/app.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeRequest } from './entities/change-request.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChangeRequestService {

  constructor(
    @InjectRepository(ChangeRequest)
    private readonly changeRequestRepository: Repository<ChangeRequest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly appGateway: AppGateway,
  ) { }

  async create(createChangeRequestDto: CreateChangeRequestDto, user?: any) {
    const requester = await this.userRepository.findOneBy({
      id: createChangeRequestDto.requesterId
    });

    if (!requester) {
      throw new BadRequestException('Requester (User) not found');
    }

    let assignee;
    if (createChangeRequestDto.assignedId) {
      assignee = await this.userRepository.findOneBy({ id: createChangeRequestDto.assignedId });
      if (!assignee) throw new BadRequestException('Assignee user not found');
      if (assignee.role === 'user') throw new BadRequestException('Assignee must be an agent or admin');
    }

    let approver;
    if (createChangeRequestDto.approverId) {
      approver = await this.userRepository.findOneBy({ id: createChangeRequestDto.approverId });
      if (!approver) throw new BadRequestException('Approver user not found');
    }

    const changeRequest = this.changeRequestRepository.create({
      ...createChangeRequestDto,
      requester,
      assignee,
      approver,
    });

    const saved = await this.changeRequestRepository.save(changeRequest);
    this.appGateway.server.emit('change_request_updated');
    return saved;
  }

  async findAll() {
    return await this.changeRequestRepository.find({
      relations: ['requester', 'assignee', 'approver'],
    });
  }

  async findOne(id: number) {
    return await this.changeRequestRepository.findOne({
      where: { id },
      relations: ['requester', 'assignee', 'approver'],
    });
  }

  async update(id: number, updateChangeRequestDto: UpdateChangeRequestDto, user?: any) {
    const changeRequest = await this.findOne(id)

    if (!changeRequest) {
      throw new NotFoundException('Change Request not found');
    }

    // AGENT RBAC LOGIC
    if (user && user.role === 'agent') {
      const isRequester = changeRequest.requester.id === user.userId;
      const isAssignee = changeRequest.assignee?.id === user.userId;

      if (!isRequester && !isAssignee) {
        throw new ForbiddenException('You do not have permission to edit this change request');
      }

      if (isAssignee && !isRequester) {
        // Filter DTO to only allow status and closureNotes (if applicable)
        const { status, closureNotes, ...others } = updateChangeRequestDto;

        const newDto: UpdateChangeRequestDto = {};
        if (status) newDto.status = status;

        // Check closureNotes condition
        const isCompletedOrCanceled = (status === 'completed' || status === 'failed' || status === 'rejected' || status === 'approved') || (changeRequest.status === 'completed' || changeRequest.status === 'failed' || changeRequest.status === 'rejected' || changeRequest.status === 'approved');
        // Note: ChangeStatus has many terminal states.
        // Requirement: "siempre y cuando este haya sido cancelado o resuelto"
        // For ChangeRequest, maybe 'completed', 'failed', 'rejected'?
        // Let's assume 'completed', 'failed', 'rejected', 'approved' (maybe?)
        // Let's stick to 'completed' and 'failed' as "resolved/canceled" equivalents for now, or maybe 'rejected' too.
        // Actually, let's look at ChangeStatus enum: REQUESTED, APPROVED, REJECTED, IMPLEMENTATION, COMPLETED, FAILED.
        // "Resuelto" -> COMPLETED. "Cancelado" -> maybe REJECTED or FAILED?
        // I'll include COMPLETED, FAILED, REJECTED.

        if (closureNotes && isCompletedOrCanceled) {
          newDto.closureNotes = closureNotes;
        }

        // Use the filtered DTO
        updateChangeRequestDto = newDto;
      }
    }

    let assignee;
    let approver;

    if (updateChangeRequestDto.assignedId) {
      assignee = await this.userRepository.findOneBy({ id: updateChangeRequestDto.assignedId });
      if (!assignee) throw new BadRequestException('Assignee user not found');

      if (assignee.role === 'user') throw new BadRequestException('Assignee must be an agent or admin');
    }

    if (updateChangeRequestDto.approverId) {
      approver = await this.userRepository.findOneBy({ id: updateChangeRequestDto.approverId });
      if (!approver) throw new BadRequestException('Approver user not found');
    }

    let requester;
    if (updateChangeRequestDto.requesterId) {
      requester = await this.userRepository.findOneBy({ id: updateChangeRequestDto.requesterId });
      if (!requester) throw new BadRequestException('Requester user not found');
    }

    const saved = await this.changeRequestRepository.save({
      ...changeRequest,
      ...updateChangeRequestDto,
      assignee,
      approver,
      requester,
    });
    this.appGateway.server.emit('change_request_updated');
    return saved;
  }

  async remove(id: number) {
    const result = await this.changeRequestRepository.softDelete(id);
    this.appGateway.server.emit('change_request_deleted', id);
    return result;
  }
}
