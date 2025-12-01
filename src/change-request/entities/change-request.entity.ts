import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum ChangePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum ChangeStatus {
    REQUESTED = 'requested',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IMPLEMENTATION = 'implementation',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum ChangeType {
    STANDARD = 'standard',
    NORMAL = 'normal',
    EMERGENCY = 'emergency',
}

@Entity()
export class ChangeRequest {

    @PrimaryGeneratedColumn({ name: 'change_id' })
    id: number;

    @Column({ length: 60 })
    title: string;

    @Column({ length: 200 })
    description: string;

    @Column({ type: 'text', nullable: true })
    justification: string;

    @Column({
        type: 'enum',
        enum: ChangeType,
        default: ChangeType.NORMAL,
    })
    type: ChangeType;

    @Column({ length: 60 })
    area: string;

    @Column({
        type: 'enum',
        enum: ChangePriority,
        default: ChangePriority.LOW,
    })
    priority: ChangePriority;

    @Column({
        type: 'enum',
        enum: ChangeStatus,
        default: ChangeStatus.REQUESTED,
    })
    status: ChangeStatus;

    @ManyToOne(() => User, (user) => user.changesRequested)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @ManyToOne(() => User, (user) => user.changesAssigned)
    @JoinColumn({ name: 'assigned_id' })
    assignee: User;

    @ManyToOne(() => User, (user) => user.changesApproved)
    @JoinColumn({ name: 'approver_id' })
    approver: User;

    @Column({ name: 'implementation_plan', type: 'text' })
    implementationPlan: string;

    @Column({ name: 'rollback_plan', type: 'text' })
    rollbackPlan: string;

    @CreateDateColumn({ name: 'request_date', type: 'timestamp' })
    requestDate: Date;

    @Column({ name: 'approved_date', type: 'timestamp', nullable: true })
    approvedDate: Date;

    @Column({ name: 'implementation_date', type: 'timestamp', nullable: true })
    implementationDate: Date;

    @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
    completedDate: Date;

    @Column({ name: 'closure_notes', type: 'text', nullable: true })
    closureNotes: string;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
