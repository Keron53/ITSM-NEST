import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum RequestPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum RequestStatus {
    PENDING = 'pending',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELED = 'canceled',
}

@Entity()
export class ServiceRequest {

    @PrimaryGeneratedColumn({ name: 'request_id' })
    id: number;

    @Column({ length: 60 })
    title: string;

    @Column({ length: 200 })
    description: string;

    @Column({ name: 'origin_area', length: 60 })
    originArea: string;

    @Column({ name: 'destination_area', length: 60, nullable: true })
    destinationArea: string;

    @Column({
        type: 'enum',
        enum: RequestPriority,
        default: RequestPriority.LOW,
    })
    priority: RequestPriority;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
    })
    status: RequestStatus;

    @ManyToOne(() => User, (user) => user.serviceRequestsCreated)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @ManyToOne(() => User, (user) => user.serviceRequestsAssigned)
    @JoinColumn({ name: 'reciever_id' })
    receiver: User;

    @CreateDateColumn({ name: 'request_date', type: 'timestamp' })
    requestDate: Date;

    @Column({ name: 'assigned_date', type: 'timestamp', nullable: true })
    assignedDate: Date;

    @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
    completedDate: Date;

    @Column({ name: 'post_comments', type: 'text', nullable: true })
    postComments: string;
}
