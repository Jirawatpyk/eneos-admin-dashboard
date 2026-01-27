/**
 * AddMemberModal Component Tests (Story 7-4b Task 15.1)
 * AC#1, AC#2: Form with Name, Email, Phone, Role fields
 * AC#3: Email domain validation (@eneos.co.th)
 * AC#4: Name validation (min 2 chars)
 * AC#5: Phone format validation (Thai format, optional)
 * AC#6: Duplicate email error handling
 * AC#7: Success handling
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks
const mockMutateAsync = vi.fn();
const mockToast = vi.fn();

vi.mock('@/hooks/use-team-management', () => ({
  useCreateTeamMember: vi.fn(() => ({
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

describe('AddMemberModal (Task 15.1)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC#2: Renders form fields correctly
  it('should render all form fields when open (AC#2)', () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AddMemberModal open={false} onClose={mockOnClose} />);

    expect(screen.queryByTestId('add-member-modal')).not.toBeInTheDocument();
  });

  // AC#3: Email domain validation
  it('should show error for non-eneos email domain (AC#3)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('email-input'), 'test@gmail.com');

    expect(screen.getByTestId('email-error')).toHaveTextContent('@eneos.co.th');
  });

  it('should not show error for valid eneos email (AC#3)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('email-input'), 'test@eneos.co.th');

    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });

  // AC#4: Name validation
  it('should show error for name too short (AC#4)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'A');

    expect(screen.getByTestId('name-error')).toHaveTextContent('minimum 2');
  });

  // AC#5: Phone format validation
  it('should show error for invalid phone format (AC#5)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('phone-input'), '123');

    expect(screen.getByTestId('phone-error')).toHaveTextContent('Thai phone');
  });

  it('should not show error for empty phone (optional) (AC#5)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);

    expect(screen.queryByTestId('phone-error')).not.toBeInTheDocument();
  });

  it('should accept valid Thai phone format (AC#5)', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('phone-input'), '0812345678');

    expect(screen.queryByTestId('phone-error')).not.toBeInTheDocument();
  });

  // AC#7: Submit with valid data
  it('should submit with valid data and show success toast (AC#7)', async () => {
    mockMutateAsync.mockResolvedValue({ success: true });

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@eneos.co.th');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@eneos.co.th',
        phone: undefined,
        role: 'sales',
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Member added successfully',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  // AC#6: Duplicate email error
  it('should show error toast on duplicate email (AC#6)', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Email already exists'));

    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'dup@eneos.co.th');

    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Email already exists',
          variant: 'destructive',
        })
      );
    });
  });

  // Cancel action
  it('should call onClose when cancel is clicked', async () => {
    render(<AddMemberModal open={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('cancel-button'));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
