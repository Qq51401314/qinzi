export enum Role {
  PARENT = 'PARENT',
  CHILD = 'CHILD'
}

export enum TaskStatus {
  PENDING = 'PENDING',           
  WAITING_VERIFICATION = 'WAITING_VERIFICATION', 
  COMPLETED = 'COMPLETED',       
  FAILED = 'FAILED'              
}

export type TimeSlot = 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  points?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  createdBy: string;
  status: TaskStatus;
  pointsReward: number;
  deadline?: string;
  referenceImage?: string;
  categoryIcon?: string;
  timeSlot?: TimeSlot; 
  
  // Verification / Completion data
  completedAt?: string;
  verifiedAt?: string;
  proofImage?: string; // Final archive media (image or video)
  proofMediaType?: 'image' | 'video'; // New: Type of parent's archive media
  
  childProofImage?: string; // Media submitted by child
  childProofMediaType?: 'image' | 'video'; // New: Type of child's media
  
  childFeedback?: string; 
  feedback?: string; 
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  members: User[];
  rewards?: Reward[];
}