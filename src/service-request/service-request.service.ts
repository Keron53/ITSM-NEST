import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createServiceRequestDto: CreateServiceRequestDto) {
    // PASO 1: Buscar al usuario solicitante (Requester)
    // Asumo que en tu DTO ahora recibes un 'requesterId'
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

  async findAll() {
    return await this.serviceRequestRepository.find({
      relations: ['requester', 'receiver'],
    });
  }

  async findOne(id: number) {
    return await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['requester', 'receiver'],
    });
  }

  async update(id: number, updateServiceRequestDto: UpdateServiceRequestDto) {
    // 1. Buscamos la solicitud existente
    const serviceRequest = await this.serviceRequestRepository.findOneBy({ id });

    if (!serviceRequest) {
      throw new NotFoundException('Service Request not found');
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
    return await this.serviceRequestRepository.save({
      ...serviceRequest,
      ...updateServiceRequestDto,
      receiver, // Si receiver es undefined, TypeORM ignora esta línea y no borra el existente
      requester,
    });
  }

  async remove(id: number) {
    return await this.serviceRequestRepository.softDelete(id);
  }
}
