import { Problem } from "src/problems/entities/problem.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum IncidentCategory {
    HARDWARE = 'hardware',
    SOFTWARE = 'software',
    NETWORK = 'network',
    ACCESS = 'access',
    DATABASE = 'database',
    APPLICATION = 'application',
    OTHER = 'other',
}

export enum IncidentPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum IncidentStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
    CANCELED = 'canceled',
}

export enum RelatedDevices {
    PRINTER = 'printer',
    ROUTER = 'router',
    SWITCH = 'switch',
    COMPUTER = 'computer',
    LAPTOP = 'laptop',
    SERVER = 'server',
    OTHER = 'other',
}

@Entity()
export class Incident {

    @PrimaryGeneratedColumn({ name: 'incident_id' })
    id: number;

    @Column({ length: 60 })
    title: string;

    @Column({ length: 200 })
    description: string;

    @Column({ name: 'incident_area', length: 60 })
    incidentArea: string;

    @Column({
        type: 'enum',
        enum: IncidentCategory,
        default: IncidentCategory.HARDWARE,
    })
    category: IncidentCategory;

    @Column({
        type: 'enum',
        enum: IncidentPriority,
        default: IncidentPriority.LOW,
    })
    priority: IncidentPriority;

    @Column({
        type: 'enum',
        enum: IncidentStatus,
        default: IncidentStatus.PENDING,
    })
    status: IncidentStatus;

    @Column({
        type: 'enum',
        enum: RelatedDevices,
        default: RelatedDevices.COMPUTER,
    })
    relatedDevice: RelatedDevices;

    //RELACIONES
    @ManyToOne(() => User, (user) => user.incidentReported)
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => User, (user) => user.incidentAssigned)
    @JoinColumn({ name: 'assigned_id' })
    assignee: User;

    @ManyToOne(() => Problem, (problem) => problem.incidentsAssigned)
    @JoinColumn({ name: 'related_problem_id' })
    relatedProblem: Problem;

    @CreateDateColumn({ name: 'report_date', type: 'timestamp' })
    reportDate: Date;

    @Column({ name: 'resolution_date', type: 'timestamp', nullable: true })
    resolutionDate: Date;

    @Column({ name: 'close_date', type: 'timestamp', nullable: true })
    closeDate: Date;

    @Column({ name: 'closure_notes', type: 'text', nullable: true })
    closureNotes: string;

}
