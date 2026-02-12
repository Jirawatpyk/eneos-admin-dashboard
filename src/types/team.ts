/**
 * Team Management Types (Story 7-4 + 7-4b)
 */

/**
 * Sales Team Member from Backend API
 * Matches SalesTeamMemberFull from backend
 * Story 7-4b: lineUserId can be null for manually added members
 */
export interface TeamMember {
  lineUserId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'sales' | 'viewer';
  createdAt: string;
  status: 'active' | 'inactive';
}

/**
 * Filter options for team list
 */
export interface TeamFilter {
  status: 'active' | 'inactive' | 'all';
  role: 'admin' | 'sales' | 'viewer' | 'all';
}

/**
 * Update payload for team member
 */
export interface TeamMemberUpdate {
  email?: string | null;
  phone?: string | null;
  role?: 'admin' | 'viewer';
  status?: 'active' | 'inactive';
}

/**
 * Create payload for new team member (Story 7-4b)
 */
export interface CreateTeamMemberInput {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sales';
}

/**
 * Invite payload for new user (Story 13-1)
 */
export interface InviteTeamMemberInput {
  email: string;
  name: string;
  role: 'admin' | 'viewer';
}

/**
 * API Response for invite
 */
export interface InviteTeamMemberResponse {
  success: boolean;
  data: {
    member: TeamMember;
    authInviteSent: boolean;
  };
  error?: { code: string; message: string };
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

/**
 * Unlinked LINE Account (Story 7-4b AC#9, #13)
 * Represents a LINE account that hasn't been linked to a dashboard member
 */
export interface UnlinkedLINEAccount {
  lineUserId: string;
  name: string;
  createdAt: string;
}

/**
 * Link LINE Account Input (Story 7-4b AC#11)
 * Request payload for linking a LINE account to a dashboard member
 */
export interface LinkLINEAccountInput {
  email: string; // Dashboard member's email (identifier)
  targetLineUserId: string; // LINE account to link
}

/**
 * Unlinked Dashboard Member (Story 7-4b AC#14)
 * Dashboard member without LINE account (for reverse linking)
 */
export interface UnlinkedDashboardMember {
  lineUserId: null;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'viewer';
  createdAt: string;
  status: 'active' | 'inactive';
}

/**
 * Reverse Link Input (Story 7-4b AC#14)
 * Link from LINE account side to dashboard member
 */
export interface ReverseLinkInput {
  lineUserId: string; // LINE account's ID
  targetEmail: string; // Dashboard member's email to link to
}
