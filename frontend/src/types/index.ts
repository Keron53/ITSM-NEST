export const UserRole = {
    ADMIN: 'admin',
    AGENT: 'agent',
    USER: 'user',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    phone?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export const IncidentCategory = {
    HARDWARE: 'hardware',
    SOFTWARE: 'software',
    NETWORK: 'network',
    ACCESS: 'access',
    DATABASE: 'database',
    APPLICATION: 'application',
    OTHER: 'other',
} as const;

export type IncidentCategory = typeof IncidentCategory[keyof typeof IncidentCategory];

export const IncidentPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type IncidentPriority = typeof IncidentPriority[keyof typeof IncidentPriority];

export const IncidentStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    CANCELED: 'canceled',
} as const;

export type IncidentStatus = typeof IncidentStatus[keyof typeof IncidentStatus];

export const RelatedDevices = {
    PRINTER: 'printer',
    ROUTER: 'router',
    SWITCH: 'switch',
    COMPUTER: 'computer',
    LAPTOP: 'laptop',
    SERVER: 'server',
    OTHER: 'other',
} as const;

export type RelatedDevices = typeof RelatedDevices[keyof typeof RelatedDevices];

export interface Incident {
    id: number;
    title: string;
    description: string;
    incidentArea: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    status: IncidentStatus;
    relatedDevice: RelatedDevices;
    reporter: User;
    assignee?: User;
    relatedProblem?: Problem;
    reportDate: string;
    resolutionDate?: string;
    closeDate?: string;
    closureNotes?: string;
}

export const ProblemCategory = {
    HARDWARE: 'hardware',
    SOFTWARE: 'software',
    NETWORK: 'network',
    ACCESS: 'access',
    DATABASE: 'database',
    APPLICATION: 'application',
    OTHER: 'other',
} as const;

export type ProblemCategory = typeof ProblemCategory[keyof typeof ProblemCategory];

export const ProblemPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type ProblemPriority = typeof ProblemPriority[keyof typeof ProblemPriority];

export const ProblemStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    CANCELED: 'canceled',
} as const;

export type ProblemStatus = typeof ProblemStatus[keyof typeof ProblemStatus];

export interface Problem {
    id: number;
    title: string;
    description: string;
    problemArea: string;
    category: ProblemCategory;
    priority: ProblemPriority;
    status: ProblemStatus;
    cause: string;
    reporter: User;
    assignee?: User;
    implementedSolution?: string;
    reportDate: string;
    resolutionDate?: string;
    closeDate?: string;
    closureNotes?: string;
}

export const ChangeType = {
    STANDARD: 'standard',
    NORMAL: 'normal',
    EMERGENCY: 'emergency',
} as const;

export type ChangeType = typeof ChangeType[keyof typeof ChangeType];

export const ChangePriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type ChangePriority = typeof ChangePriority[keyof typeof ChangePriority];

export const ChangeStatus = {
    REQUESTED: 'requested',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IMPLEMENTATION: 'implementation',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const;

export type ChangeStatus = typeof ChangeStatus[keyof typeof ChangeStatus];

export interface ChangeRequest {
    id: number;
    title: string;
    description: string;
    justification?: string;
    type: ChangeType;
    area: string;
    priority: ChangePriority;
    status: ChangeStatus;
    requester: User;
    assignee?: User;
    approver?: User;
    implementationPlan: string;
    rollbackPlan: string;
    requestDate: string;
    approvedDate?: string;
    implementationDate?: string;
    completedDate?: string;
    closureNotes?: string;
}

export const RequestPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type RequestPriority = typeof RequestPriority[keyof typeof RequestPriority];

export const RequestStatus = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export interface ServiceRequest {
    id: number;
    title: string;
    description: string;
    originArea: string;
    destinationArea?: string;
    priority: RequestPriority;
    status: RequestStatus;
    requester: User;
    receiver?: User;
    requestDate: string;
    assignedDate?: string;
    completedDate?: string;
    postComments?: string;
}
