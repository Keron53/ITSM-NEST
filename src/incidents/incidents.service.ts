import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { AppGateway } from '../gateways/app.gateway';
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

    private readonly appGateway: AppGateway,
  ) { }

  async create(createIncidentDto: CreateIncidentDto, user: any) {
    // Si el usuario es 'user', forzamos que el reporter sea él mismo
    if (user.role === 'user') {
      createIncidentDto.reporterId = user.userId;
    }

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

    const saved = await this.incidentRepository.save(incident);
    this.appGateway.server.emit('incident_updated');
    return saved;
  }

  async findAll(user: any) {
    const where: any = {};
    if (user.role === 'user') {
      where.reporter = { id: user.userId };
    }

    return await this.incidentRepository.find({
      where,
      relations: ['reporter', 'assignee', 'relatedProblem'],
    });
  }

  async findOne(id: number) {
    return await this.incidentRepository.findOne({
      where: { id },
      relations: ['reporter', 'assignee', 'relatedProblem'],
    });
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto, user?: any) {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['reporter', 'assignee', 'relatedProblem'],
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    // AGENT RBAC LOGIC
    if (user.role === 'agent') {
      const isReporter = incident.reporter.id === user.userId;
      const isAssignee = incident.assignee?.id === user.userId;

      if (!isReporter && !isAssignee) {
        throw new ForbiddenException('You do not have permission to edit this incident');
      }

      if (isAssignee && !isReporter) {
        // Filter DTO to only allow status and closureNotes (if applicable)
        const { status, closureNotes, relatedProblem, ...others } = updateIncidentDto;

        const newDto: UpdateIncidentDto = {};
        if (status) newDto.status = status;

        // Check closureNotes condition
        const isResolvedOrCanceled = (status === 'resolved' || status === 'canceled') || (incident.status === 'resolved' || incident.status === 'canceled');

        if (closureNotes && isResolvedOrCanceled) {
          newDto.closureNotes = closureNotes;
        }
        if (relatedProblem && isResolvedOrCanceled) {
          newDto.relatedProblem = relatedProblem;
        }

        // Use the filtered DTO
        updateIncidentDto = newDto;
      }
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

    let reporter;
    if (updateIncidentDto.reporterId) {
      reporter = await this.userRepository.findOneBy({
        id: updateIncidentDto.reporterId,
      });

      if (!reporter) {
        throw new BadRequestException('Reporter (User) not found');
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

    // 3. Guardamos mezclando los datos anteriores, los nuevos y la relación
    const finalStatus = updateIncidentDto.status || incident.status;
    const isResolved = finalStatus === 'resolved';
    const isCanceled = finalStatus === 'canceled';

    const saved = await this.incidentRepository.save({
      ...incident,
      ...updateIncidentDto,
      assignee,
      reporter,
      relatedProblem,
      resolutionDate: isResolved && !incident.resolutionDate ? new Date() : incident.resolutionDate,
      closeDate: (isResolved || isCanceled) && !incident.closeDate ? new Date() : incident.closeDate,
    });
    this.appGateway.server.emit('incident_updated');
    return saved;
  }

  async remove(id: number) {
    const result = await this.incidentRepository.softDelete(id);
    this.appGateway.server.emit('incident_deleted', id);
    return result;
  }
}
