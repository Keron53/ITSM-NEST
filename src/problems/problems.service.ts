import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Problem } from './entities/problem.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProblemsService {

  constructor(
    @InjectRepository(Problem)
    private readonly problemsRepository: Repository<Problem>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createProblemDto: CreateProblemDto, user?: any) {
    // If agent, we might want to default reporter to them if not set, but for now let's trust the DTO or logic.
    // However, we updated the controller to pass user, so we must accept it.

    const reporter = await this.userRepository.findOneBy({
      id: createProblemDto.reporterId
    });

    if (!reporter) {
      throw new BadRequestException('Reporter (User) not found');
    }

    const problem = this.problemsRepository.create({
      ...createProblemDto,
      reporter, // Guardamos la relación
    });

    return await this.problemsRepository.save(problem);
  }

  async findAll() {
    return await this.problemsRepository.find({
      relations: ['reporter', 'assignee'],
    });
  }

  async findOne(id: number) {
    return await this.problemsRepository.findOne({
      where: { id },
      relations: ['reporter', 'assignee'],
    });
  }

  async update(id: number, updateProblemDto: UpdateProblemDto, user?: any) {
    const problem = await this.findOne(id);

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    // AGENT RBAC LOGIC
    if (user && user.role === 'agent') {
      const isReporter = problem.reporter.id === user.userId;
      const isAssignee = problem.assignee?.id === user.userId;

      if (!isReporter && !isAssignee) {
        throw new ForbiddenException('You do not have permission to edit this problem');
      }

      if (isAssignee && !isReporter) {
        // Filter DTO to only allow status and closureNotes (if applicable)
        const { status, closureNotes, ...others } = updateProblemDto;

        const newDto: UpdateProblemDto = {};
        if (status) newDto.status = status;

        // Check closureNotes condition
        const isResolvedOrCanceled = (status === 'resolved' || status === 'canceled') || (problem.status === 'resolved' || problem.status === 'canceled');

        if (closureNotes && isResolvedOrCanceled) {
          newDto.closureNotes = closureNotes;
        }

        // Use the filtered DTO
        updateProblemDto = newDto;
      }
    }

    let assignee;

    if (updateProblemDto.assignedId) {
      assignee = await this.userRepository.findOneBy({ id: updateProblemDto.assignedId });

      if (!assignee) {
        throw new BadRequestException('Assignee user not found');
      }

      if (assignee.role === 'user') {
        throw new BadRequestException('The assignee must be an agent or admin');
      }
    }

    let reporter;
    if (updateProblemDto.reporterId) {
      reporter = await this.userRepository.findOneBy({ id: updateProblemDto.reporterId });

      if (!reporter) {
        throw new BadRequestException('Reporter user not found');
      }
    }

    return await this.problemsRepository.save({
      ...problem,
      ...updateProblemDto,
      assignee,
      reporter,
    });
  }

  async remove(id: number) {
    return await this.problemsRepository.softDelete(id);
  }
}
