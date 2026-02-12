/**
 * AddMemberModal (Invite User) Component Tests (Story 13-1)
 * AC-4: Invite User form with Name, Email, Role fields
 * - No phone field (can be added later via edit)
 * - No @eneos.co.th restriction — admin invite-only is the security gate
 * - Role: admin | viewer (default: viewer)
 * - Success differentiates authInviteSent true/false
 * - Duplicate email error handling
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks
const mockMutateAsync = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/use-team-management', () => ({
  useInviteTeamMember: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

import { AddMemberModal } from '@/components/settings/add-member-modal';

describe('AddMemberModal — Invite User (Story 13-1)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('should render Name, Email, Role fields when open', () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('should NOT render a phone field', () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.queryByTestId('phone-input')).not.toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AddMemberModal open={false} onClose={mockOnClose} />);

    expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
  });

  it('should show "Invite User" title', () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.getByText('Invite User')).toBeInTheDocument();
  });

  it('should show "Send Invitation" button text', () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Send Invitation');
  });

  // --- Validation ---

  it('should show error for name too short', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'A');

    expect(screen.getByTestId('name-error')).toHaveTextContent('minimum 2');
  });

  it('should show error for invalid email format', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('email-input'), 'not-an-email');

    expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
  });

  it('should accept any email domain (no @eneos.co.th restriction)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('email-input'), 'user@gmail.com');

    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });

  it('should accept @eneos.co.th email', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('email-input'), 'test@eneos.co.th');

    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });

  // --- Submit ---

  it('should submit invite with default viewer role and show invitation sent toast', async () => {
    mockMutateAsync.mockResolvedValue({
      success: true,
      data: {
        member: { name: 'Test User', email: 'test@example.com', role: 'viewer' },
        authInviteSent: true,
      },
    });

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        role: 'viewer',
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Invitation sent',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show "User created" toast when authInviteSent is false', async () => {
    mockMutateAsync.mockResolvedValue({
      success: true,
      data: {
        member: { name: 'Test User', email: 'test@example.com', role: 'viewer' },
        authInviteSent: false,
      },
    });

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'User created',
        })
      );
    });
  });

  // --- Duplicate email ---

  it('should show "User already exists" toast on duplicate email', async () => {
    mockMutateAsync.mockRejectedValue(new Error('User already exists'));

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Dup User');
    await user.type(screen.getByTestId('email-input'), 'dup@example.com');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'User already exists',
          variant: 'destructive',
        })
      );
    });
  });

  it('should show generic error toast on unexpected error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Fail User');
    await user.type(screen.getByTestId('email-input'), 'fail@example.com');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to invite user',
          variant: 'destructive',
        })
      );
    });
  });

  // --- Cancel ---

  it('should call onClose when cancel is clicked', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('cancel-button'));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
