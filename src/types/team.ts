/**
 * Team Management Types (Story 7-4)
 */

/**
 * Sales Team Member from Backend API
 * Matches SalesTeamMemberFull from backend
 */
export interface TeamMember {
  lineUserId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'sales';
  createdAt: string;
  status: 'active' | 'inactive';
}

/**
 * Filter options for team list
 */
export interface TeamFilter {
  status: 'active' | 'inactive' | 'all';
  role: 'admin' | 'sales' | 'all';
}

/**
 * Update payload for team member
 */
export interface TeamMemberUpdate {
  email?: string | null;
  phone?: string | null;
  role?: 'admin' | 'sales';
  status?: 'active' | 'inactive';
}

/**
 * API Response for team list
 */
export interface TeamListResponse {
  success: boolean;
  data: TeamMember[];
  total: number;
  error?: { code: string; message: string };
}

/**
 * API Response for single team member
 */
export interface TeamMemberResponse {
  success: boolean;
  data: TeamMember;
  error?: { code: string; message: string };
}
