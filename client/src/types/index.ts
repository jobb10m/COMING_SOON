export type Role = 'ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  profile?: {
    firstName?: string;
    lastName?: string;
  } | null;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  photoUrl?: string | null;
  isSuspended: boolean;
  createdAt: string;
  user?: { email: string; isActive: boolean };
  assignedTrainer?: { firstName: string; lastName: string } | null;
  memberships?: Array<{
    id: string;
    status: string;
    endDate: string;
    plan: { name: string; price: string };
  }>;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  trainersCount: number;
  attendanceToday: number;
  expiringMemberships: number;
  monthlyRevenue: number;
  recentPayments: Array<{
    id: string;
    amount: string;
    paidAt: string;
    member: { firstName: string; lastName: string };
  }>;
  upcomingClasses: Array<{
    id: string;
    name: string;
    startTime: string;
    trainer: { firstName: string; lastName: string };
  }>;
}
