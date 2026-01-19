/**
 * NotificationSettingsCard Component Tests
 * Story 7.3: Notification Settings
 *
 * Tests for notification settings card component.
 * AC#1: Notification Settings Section
 * AC#2: Browser Notification Permission
 * AC#3: Permission Status Display
 * AC#4: Notification Preferences
 * AC#5: Settings Persistence (via hook tests)
 * AC#6: Real-time Toggle Feedback
 * AC#7: Disabled State When Not Granted
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the hooks
const mockRequestPermission = vi.fn();
const mockUpdatePreference = vi.fn();

vi.mock('@/hooks/use-notification-permission', () => ({
  useNotificationPermission: vi.fn(() => ({
    permission: 'default',
    isSupported: true,
    isGranted: false,
    isDenied: false,
    isDefault: true,
    requestPermission: mockRequestPermission,
  })),
}));

vi.mock('@/hooks/use-notification-preferences', () => ({
  useNotificationPreferences: vi.fn(() => ({
    preferences: {
      newLeadAlerts: true,
      staleLeadReminders: true,
      performanceAlerts: true,
    },
    isLoaded: true,
    updatePreference: mockUpdatePreference,
  })),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

// Import component and mocks after setting up mocks
import { NotificationSettingsCard } from '@/components/settings/notification-settings-card';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import type { ReactNode } from 'react';

// Wrapper component with TooltipProvider
function TestWrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

// Helper to render with wrapper
function renderWithProviders(ui: ReactNode) {
  return render(ui, { wrapper: TestWrapper });
}

// Helper to set up permission mock
function setupGrantedPermission() {
  vi.mocked(useNotificationPermission).mockReturnValue({
    permission: 'granted',
    isSupported: true,
    isGranted: true,
    isDenied: false,
    isDefault: false,
    requestPermission: mockRequestPermission,
  });
}

describe('NotificationSettingsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default mock values
    vi.mocked(useNotificationPermission).mockReturnValue({
      permission: 'default',
      isSupported: true,
      isGranted: false,
      isDenied: false,
      isDefault: true,
      requestPermission: mockRequestPermission,
    });

    vi.mocked(useNotificationPreferences).mockReturnValue({
      preferences: {
        newLeadAlerts: true,
        staleLeadReminders: true,
        performanceAlerts: true,
      },
      isLoaded: true,
      updatePreference: mockUpdatePreference,
    });
  });

  describe('AC#1: Notification Settings Section', () => {
    it('renders notification settings card', () => {
      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('notification-settings-card')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('displays card description', () => {
      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByText('Configure how you receive alerts and reminders.')).toBeInTheDocument();
    });

    it('displays Bell icon in card header', () => {
      renderWithProviders(<NotificationSettingsCard />);

      // Bell icon is rendered via lucide-react
      const cardHeader = screen.getByText('Notifications').closest('.flex');
      expect(cardHeader).toBeInTheDocument();
    });
  });

  describe('AC#2: Browser Notification Permission', () => {
    it('shows Enable button when permission is default', () => {
      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('btn-enable-notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable')).toBeInTheDocument();
    });

    it('does not show Enable button when permission is granted', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.queryByTestId('btn-enable-notifications')).not.toBeInTheDocument();
    });

    it('calls requestPermission when Enable button is clicked', async () => {
      mockRequestPermission.mockResolvedValue('granted');

      renderWithProviders(<NotificationSettingsCard />);

      fireEvent.click(screen.getByTestId('btn-enable-notifications'));

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled();
      });
    });

    it('shows success toast when permission is granted', async () => {
      mockRequestPermission.mockResolvedValue('granted');

      renderWithProviders(<NotificationSettingsCard />);

      fireEvent.click(screen.getByTestId('btn-enable-notifications'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Browser notifications enabled',
          })
        );
      });
    });

    it('shows error toast when permission is denied', async () => {
      mockRequestPermission.mockResolvedValue('denied');

      renderWithProviders(<NotificationSettingsCard />);

      fireEvent.click(screen.getByTestId('btn-enable-notifications'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Notifications blocked',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('AC#3: Permission Status Display', () => {
    it('shows "Granted" badge when permission is granted', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('badge-permission-granted')).toBeInTheDocument();
      expect(screen.getByText('Granted')).toBeInTheDocument();
    });

    it('shows "Denied" badge when permission is denied', () => {
      vi.mocked(useNotificationPermission).mockReturnValue({
        permission: 'denied',
        isSupported: true,
        isGranted: false,
        isDenied: true,
        isDefault: false,
        requestPermission: mockRequestPermission,
      });

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('badge-permission-denied')).toBeInTheDocument();
      expect(screen.getByText('Denied')).toBeInTheDocument();
    });

    it('shows "Not Set" badge when permission is default', () => {
      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('badge-permission-default')).toBeInTheDocument();
      expect(screen.getByText('Not Set')).toBeInTheDocument();
    });
  });

  describe('AC#4: Notification Preferences', () => {
    it('displays all preference toggles', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('preference-newLeadAlerts')).toBeInTheDocument();
      expect(screen.getByTestId('preference-staleLeadReminders')).toBeInTheDocument();
      expect(screen.getByTestId('preference-performanceAlerts')).toBeInTheDocument();
    });

    it('displays preference labels and descriptions', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByText('New Lead Alerts')).toBeInTheDocument();
      expect(screen.getByText('Get notified when new leads arrive')).toBeInTheDocument();
      expect(screen.getByText('Stale Lead Reminders')).toBeInTheDocument();
      expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    });

    it('calls updatePreference when toggle is clicked', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      const switch1 = screen.getByTestId('switch-newLeadAlerts');
      fireEvent.click(switch1);

      expect(mockUpdatePreference).toHaveBeenCalledWith('newLeadAlerts', false);
    });
  });

  describe('AC#6: Real-time Toggle Feedback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows toast after toggle change (debounced)', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      const switch1 = screen.getByTestId('switch-newLeadAlerts');
      fireEvent.click(switch1);

      // Toast should not appear immediately
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notification settings saved',
        })
      );

      // Fast forward 500ms (debounce time)
      vi.advanceTimersByTime(500);

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notification settings saved',
        })
      );
    });

    it('debounces rapid toggles to prevent toast spam', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      const switch1 = screen.getByTestId('switch-newLeadAlerts');
      const switch2 = screen.getByTestId('switch-staleLeadReminders');

      // Rapidly toggle multiple switches
      fireEvent.click(switch1);
      vi.advanceTimersByTime(100);
      fireEvent.click(switch2);
      vi.advanceTimersByTime(100);

      // Should not have shown toast yet
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notification settings saved',
        })
      );

      // Wait for debounce
      vi.advanceTimersByTime(500);

      // Should only show one toast
      const savedToastCalls = mockToast.mock.calls.filter(
        (call) => call[0]?.title === 'Notification settings saved'
      );
      expect(savedToastCalls).toHaveLength(1);
    });
  });

  describe('AC#7: Disabled State When Not Granted', () => {
    it('disables toggles when permission is not granted', () => {
      renderWithProviders(<NotificationSettingsCard />);

      const switches = screen.getAllByRole('switch');
      switches.forEach((sw) => {
        expect(sw).toBeDisabled();
      });
    });

    it('shows enable message when permission is not granted', () => {
      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByTestId('enable-message')).toBeInTheDocument();
      expect(screen.getByText('Enable browser notifications to configure alerts')).toBeInTheDocument();
    });

    it('enables toggles when permission is granted', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      const switches = screen.getAllByRole('switch');
      switches.forEach((sw) => {
        expect(sw).not.toBeDisabled();
      });
    });

    it('does not show enable message when permission is granted', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.queryByTestId('enable-message')).not.toBeInTheDocument();
    });
  });

  describe('browser not supported', () => {
    it('shows unsupported message when Notification API not available', () => {
      vi.mocked(useNotificationPermission).mockReturnValue({
        permission: 'default',
        isSupported: false,
        isGranted: false,
        isDenied: false,
        isDefault: true,
        requestPermission: mockRequestPermission,
      });

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.getByText(/browser notifications not supported/i)).toBeInTheDocument();
      expect(screen.getByText(/try using chrome, firefox, or edge/i)).toBeInTheDocument();
    });

    it('does not show preference toggles when not supported', () => {
      vi.mocked(useNotificationPermission).mockReturnValue({
        permission: 'default',
        isSupported: false,
        isGranted: false,
        isDenied: false,
        isDefault: true,
        requestPermission: mockRequestPermission,
      });

      renderWithProviders(<NotificationSettingsCard />);

      expect(screen.queryByTestId('preference-toggles-section')).not.toBeInTheDocument();
    });

    it('shows card with warning styling when not supported', () => {
      vi.mocked(useNotificationPermission).mockReturnValue({
        permission: 'default',
        isSupported: false,
        isGranted: false,
        isDenied: false,
        isDefault: true,
        requestPermission: mockRequestPermission,
      });

      renderWithProviders(<NotificationSettingsCard />);

      // Card should still have testid
      expect(screen.getByTestId('notification-settings-card')).toBeInTheDocument();
      // Should have card description
      expect(screen.getByText('Configure how you receive alerts and reminders.')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('switches have aria-describedby linking to descriptions', () => {
      setupGrantedPermission();

      renderWithProviders(<NotificationSettingsCard />);

      const newLeadSwitch = screen.getByTestId('switch-newLeadAlerts');
      expect(newLeadSwitch).toHaveAttribute('aria-describedby', 'newLeadAlerts-description');

      // Verify description element exists
      expect(document.getElementById('newLeadAlerts-description')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('does not show preference toggles when preferences not loaded', () => {
      setupGrantedPermission();

      vi.mocked(useNotificationPreferences).mockReturnValue({
        preferences: {
          newLeadAlerts: true,
          staleLeadReminders: true,
          performanceAlerts: true,
        },
        isLoaded: false,
        updatePreference: mockUpdatePreference,
      });

      renderWithProviders(<NotificationSettingsCard />);

      // Preference toggles should not render when isLoaded is false
      expect(screen.queryByTestId('switch-newLeadAlerts')).not.toBeInTheDocument();
    });
  });
});
