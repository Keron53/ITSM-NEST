
import { ChangeRequest } from "src/change-request/entities/change-request.entity";
import { Incident } from "src/incidents/entities/incident.entity";
import { Problem } from "src/problems/entities/problem.entity";
import { ServiceRequest } from "src/service-request/entities/service-request.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import * as bcrypt from 'bcrypt';

export enum UserRole {
    ADMIN = 'admin',
    AGENT = 'agent',
    USER = 'user',
}

@Entity()
export class User {

    @PrimaryGeneratedColumn({ name: 'user_id' })
    id: number;

    @Column({ length: 60, unique: true })
    email: string;

    @Column({ length: 60 })
    name: string;

    @Column({ length: 60 })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ length: 60, nullable: true })
    department: string;

    @Column({ length: 10, nullable: true })
    phone: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    //Relaciones hacia Solicitudes
    @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.requester)
    serviceRequestsCreated: ServiceRequest[];

    @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.receiver)
    serviceRequestsAssigned: ServiceRequest[];

    //Relaciones hacia Change Requests
    @OneToMany(() => ChangeRequest, (change) => change.requester)
    changesRequested: ChangeRequest[];

    @OneToMany(() => ChangeRequest, (change) => change.assignee)
    changesAssigned: ChangeRequest[];

    @OneToMany(() => ChangeRequest, (change) => change.approver)
    changesApproved: ChangeRequest[];

    //relaciones hacia problemas
    @OneToMany(() => Problem, (problem) => problem.reporter)
    problemsReported: Problem[];

    @OneToMany(() => Problem, (problem) => problem.assignee)
    problemsAssigned: Problem[];

    //relaciones hacia incidentes
    @OneToMany(() => Incident, (incident) => incident.reporter)
    incidentReported: Incident[];

    @OneToMany(() => Incident, (incident) => incident.assignee)
    incidentAssigned: Incident[];

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            console.log('Hashing password for user');
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
}
