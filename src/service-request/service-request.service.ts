import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ServiceRequestService {

  constructor(
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepository: Repository<ServiceRequest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createServiceRequestDto: CreateServiceRequestDto, user: any) {
    // Si el usuario es 'user', forzamos que el requester sea él mismo
    if (user.role === 'user') {
      createServiceRequestDto.requesterId = user.userId; // user.userId viene del JWT payload (sub -> userId)
    }

    // PASO 1: Buscar al usuario solicitante (Requester)
    const requester = await this.userRepository.findOneBy({
      id: createServiceRequestDto.requesterId
    });

    if (!requester) {
      throw new BadRequestException('Requester (User) not found');
    }

    // PASO 2: Crear la solicitud relacionando al usuario encontrado
    const serviceRequest = this.serviceRequestRepository.create({
      ...createServiceRequestDto,
      requester, // TypeORM guardará la relación automáticamente
    });

    return await this.serviceRequestRepository.save(serviceRequest);
  }

  async findAll(user: any) {
    const where: any = {};
    if (user.role === 'user') {
      where.requester = { id: user.userId };
    }

    return await this.serviceRequestRepository.find({
      where,
      relations: ['requester', 'receiver'],
    });
  }

  async findOne(id: number) {
    return await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['requester', 'receiver'],
    });
  }

  async update(id: number, updateServiceRequestDto: UpdateServiceRequestDto, user?: any) {
    // 1. Buscamos la solicitud existente
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['requester', 'receiver'],
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service Request not found');
    }

    // AGENT RBAC LOGIC
    if (user.role === 'agent') {
      const isRequester = serviceRequest.requester.id === user.userId;
      const isReceiver = serviceRequest.receiver?.id === user.userId;

      if (!isRequester && !isReceiver) {
        throw new ForbiddenException('You do not have permission to edit this request');
      }

      if (isReceiver && !isRequester) {
        // Can only update status, and postComments if resolved/canceled
        const allowedFields = ['status', 'postComments'];
        const attemptedFields = Object.keys(updateServiceRequestDto);
        const hasForbiddenFields = attemptedFields.some(field => !allowedFields.includes(field));

        if (hasForbiddenFields) {
          // Allow if the forbidden fields are effectively unchanged (e.g. sending same title)
          // For simplicity, strict check:
          // But wait, frontend might send all fields. We should probably just ignore other fields or throw error.
          // Requirement says "can edit ONLY...", implying others are forbidden.
          // Let's filter the DTO to only allowed fields for safety.
        }

        // Actually, let's enforce it by constructing a new payload
        const safePayload: UpdateServiceRequestDto = {};
        if (updateServiceRequestDto.status) safePayload.status = updateServiceRequestDto.status;

        if (updateServiceRequestDto.postComments) {
          const isResolvedOrCanceled = serviceRequest.status === 'completed' || serviceRequest.status === 'canceled' || updateServiceRequestDto.status === 'completed' || updateServiceRequestDto.status === 'canceled';
          if (isResolvedOrCanceled) {
            safePayload.postComments = updateServiceRequestDto.postComments;
          } else {
            // If trying to add comments but not resolved/canceled, maybe ignore or allow?
            // Requirement: "siempre y cuando este haya sido cancelado o resuelto"
            // So if current status or new status is NOT resolved/canceled, ignore comments.
            // But usually comments are added WHEN resolving.
          }
        }

        // Replace DTO with safe payload
        // updateServiceRequestDto = safePayload; // This would be the approach if we want to silently ignore.
        // But let's be strict as per "can edit ONLY".

        // Re-reading requirement: "Los usuarios con el rol "agent" pueden editar únicamente los problems... en donde ellos sean los reporters/requesters"
        // AND "pueden manejar el estado... si el receiver/asignee sea su ID"

        if (hasForbiddenFields) {
          // Let's check if the values are actually changing.
          // For now, let's just throw Forbidden if they try to change title/description etc.
          // But frontend form sends everything.
          // Better approach: We only APPLY the allowed changes.
        }
      }
    }

    // Refined Logic:
    if (user.role === 'agent') {
      const isRequester = serviceRequest.requester.id === user.userId;
      const isReceiver = serviceRequest.receiver?.id === user.userId;

      if (!isRequester && !isReceiver) {
        throw new ForbiddenException('You do not have permission to edit this request');
      }

      if (isReceiver && !isRequester) {
        // Filter DTO to only allow status and postComments (if applicable)
        const { status, postComments, ...others } = updateServiceRequestDto;

        // Check if any other field is being updated to a DIFFERENT value
        // This is complex. 
        // Alternative: Just ignore other fields.

        const newDto: UpdateServiceRequestDto = {};
        if (status) newDto.status = status;

        // Check postComments condition
        const isCompletedOrCanceled = (status === 'completed' || status === 'canceled') || (serviceRequest.status === 'completed' || serviceRequest.status === 'canceled');

        if (postComments && isCompletedOrCanceled) {
          newDto.postComments = postComments;
        }

        // Use the filtered DTO
        updateServiceRequestDto = newDto;
      }
    }

    let receiver;

    // 2. Si el DTO trae un ID de técnico (receiverId), verificamos que exista
    if (updateServiceRequestDto.receiverId) {
      receiver = await this.userRepository.findOneBy({
        id: updateServiceRequestDto.receiverId,
      });

      if (!receiver) {
        throw new BadRequestException('Receiver (User) not found');
      }

      // Opcional: Validar que el usuario tenga rol de 'agent' o 'admin'
      if (receiver.role === 'user') {
        throw new BadRequestException('The receiver must be an agent or admin');
      }
    }

    let requester;
    if (updateServiceRequestDto.requesterId) {
      requester = await this.userRepository.findOneBy({
        id: updateServiceRequestDto.requesterId,
      });

      if (!requester) {
        throw new BadRequestException('Requester (User) not found');
      }
    }

    // 3. Guardamos mezclando los datos anteriores, los nuevos y la relación
    const finalStatus = updateServiceRequestDto.status || serviceRequest.status;
    const isCompletedOrCanceled = finalStatus === 'completed' || finalStatus === 'canceled';

    return await this.serviceRequestRepository.save({
      ...serviceRequest,
      ...updateServiceRequestDto,
      receiver, // Si receiver es undefined, TypeORM ignora esta línea y no borra el existente
      requester,
      assignedDate: receiver ? new Date() : serviceRequest.assignedDate, // Update assignedDate if receiver is set
      completedDate: isCompletedOrCanceled && !serviceRequest.completedDate ? new Date() : serviceRequest.completedDate, // Set completedDate if finishing and not already set
    });
  }

  async remove(id: number) {
    return await this.serviceRequestRepository.softDelete(id);
  }
}
