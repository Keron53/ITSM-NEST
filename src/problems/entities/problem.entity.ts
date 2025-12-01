import { Incident } from "src/incidents/entities/incident.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum ProblemCategory {
    HARDWARE = 'hardware',
    SOFTWARE = 'software',
    NETWORK = 'network',
    ACCESS = 'access',
    DATABASE = 'database',
    APPLICATION = 'application',
    OTHER = 'other',
}

export enum ProblemPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum ProblemStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
    CANCELED = 'canceled',
}

@Entity()
export class Problem {

    @PrimaryGeneratedColumn({ name: 'problem_id' })
    id: number;

    @Column({ length: 60 })
    title: string;

    @Column({ length: 200 })
    description: string;

    @Column({ name: 'problem_area', length: 60 })
    problemArea: string;

    @Column({
        type: 'enum',
        enum: ProblemCategory,
        default: ProblemCategory.HARDWARE,
    })
    category: ProblemCategory;

    @Column({
        type: 'enum',
        enum: ProblemPriority,
        default: ProblemPriority.LOW,
    })
    priority: ProblemPriority;

    @Column({
        type: 'enum',
        enum: ProblemStatus,
        default: ProblemStatus.PENDING,
    })
    status: ProblemStatus;

    @Column({ length: 200 })
    cause: string;

    @ManyToOne(() => User, (user) => user.problemsReported)
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => User, (user) => user.problemsAssigned)
    @JoinColumn({ name: 'assigned_id' })
    assignee: User;

    @Column({ name: 'implemented_solution', length: 200, nullable: true })
    implementedSolution: string;

    @CreateDateColumn({ name: 'report_date', type: 'timestamp' })
    reportDate: Date;

    @Column({ name: 'resolution_date', type: 'timestamp', nullable: true })
    resolutionDate: Date;

    @Column({ name: 'close_date', type: 'timestamp', nullable: true })
    closeDate: Date;

    @Column({ name: 'closure_notes', type: 'text', nullable: true })
    closureNotes: string;

    //Relaciones hacia Incidentes
    @OneToMany(() => Incident, (incident) => incident.relatedProblem)
    incidentsAssigned: Incident[];

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
