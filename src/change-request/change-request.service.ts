import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';
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
  ) { }

  async create(createChangeRequestDto: CreateChangeRequestDto) {
    const requester = await this.userRepository.findOneBy({
      id: createChangeRequestDto.requesterId
    });

    if (!requester) {
      throw new BadRequestException('Requester (User) not found');
    }

    const changeRequest = this.changeRequestRepository.create({
      ...createChangeRequestDto,
      requester,
    });

    return await this.changeRequestRepository.save(changeRequest);
  }

  async findAll() {
    return await this.changeRequestRepository.find();
  }

  async findOne(id: number) {
    return await this.changeRequestRepository.findOneBy({ id });
  }

  async update(id: number, updateChangeRequestDto: UpdateChangeRequestDto) {
    const changeRequest = await this.findOne(id)

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

    return await this.changeRequestRepository.save({
      ...changeRequest,
      ...updateChangeRequestDto,
      assignee,
      approver,
    });
  }

  async remove(id: number) {
    return await this.changeRequestRepository.softDelete(id);
  }
}
