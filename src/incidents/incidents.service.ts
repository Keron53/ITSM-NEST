import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Problem } from 'src/problems/entities/problem.entity';

@Injectable()
export class IncidentsService {

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
  ) { }

  async create(createIncidentDto: CreateIncidentDto) {
    const reporter = await this.userRepository.findOneBy({
      id: createIncidentDto.reporterId
    });

    if (!reporter) {
      throw new BadRequestException('Reporter (User) not found');
    }

    let assignee;
    if (createIncidentDto.assignedId) {
      assignee = await this.userRepository.findOneBy({
        id: createIncidentDto.assignedId
      });

      if (!assignee) {
        throw new BadRequestException('Assignee (User) not found');
      }
    }

    let relatedProblem;
    if (createIncidentDto.relatedProblem) {
      relatedProblem = await this.problemRepository.findOneBy({
        id: createIncidentDto.relatedProblem
      });

      if (!relatedProblem) {
        throw new BadRequestException('Related Problem not found');
      }
    }

    const incident = this.incidentRepository.create({
      title: createIncidentDto.title,
      description: createIncidentDto.description,
      incidentArea: createIncidentDto.incidentArea,
      category: createIncidentDto.category,
      priority: createIncidentDto.priority,
      relatedDevice: createIncidentDto.relatedDevice,
      closureNotes: createIncidentDto.closureNotes,
      reporter,
      assignee,
      relatedProblem,
    });

    return await this.incidentRepository.save(incident);
  }

  async findAll() {
    return await this.incidentRepository.find();
  }

  async findOne(id: number) {
    return await this.incidentRepository.findOneBy({ id });
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto) {
    const incident = await this.incidentRepository.findOneBy({ id });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    let assignee;

    if (updateIncidentDto.assignedId) {
      assignee = await this.userRepository.findOneBy({
        id: updateIncidentDto.assignedId,
      });

      if (!assignee) {
        throw new BadRequestException('Assignee (User) not found');
      }
    }

    let relatedProblem;

    if (updateIncidentDto.relatedProblem) {
      relatedProblem = await this.problemRepository.findOneBy({
        id: updateIncidentDto.relatedProblem,
      });

      if (!relatedProblem) {
        throw new BadRequestException('Related Problem not found');
      }
    }

    return await this.incidentRepository.save({
      ...incident,
      ...updateIncidentDto,
      assignee,
      relatedProblem,
    });
  }

  async remove(id: number) {
    return await this.incidentRepository.delete(id);
  }
}
