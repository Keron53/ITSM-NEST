import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(createProblemDto: CreateProblemDto) {
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
    return await this.problemsRepository.find();
  }

  async findOne(id: number) {
    return await this.problemsRepository.findOneBy({ id });
  }

  async update(id: number, updateProblemDto: UpdateProblemDto) {
    const problem = await this.findOne(id);

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

    return await this.problemsRepository.save({
      ...problem,
      ...updateProblemDto,
      assignee,
    });
  }

  async remove(id: number) {
    return await this.problemsRepository.softDelete(id);
  }
}
