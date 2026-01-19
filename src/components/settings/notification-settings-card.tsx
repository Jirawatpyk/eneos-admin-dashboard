/**
 * NotificationSettingsCard Component
 * Story 7.3: Notification Settings
 *
 * Displays notification settings with browser permission management
 * and preference toggles.
 *
 * AC#1: Notification Settings Section - full-width card below grid
 * AC#2: Browser Notification Permission - enable button & permission prompt
 * AC#3: Permission Status Display - colored badges (Granted/Denied/Default)
 * AC#4: Notification Preferences - toggleable alerts
 * AC#5: Settings Persistence - localStorage via hook
 * AC#6: Real-time Toggle Feedback - toast on save
 * AC#7: Disabled State When Not Granted - grayed out toggles
 */
'use client';

import { Bell, BellOff, Info, AlertCircle } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { useNotificationPreferences, type NotificationPreferences } from '@/hooks/use-notification-preferences';

/** Debounce delay for toast feedback (ms) */
const TOAST_DEBOUNCE_MS = 500;

/**
 * Notification preference options configuration
 */
const PREFERENCE_OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: 'newLeadAlerts',
    label: 'New Lead Alerts',
    description: 'Get notified when new leads arrive',
  },
  {
    key: 'staleLeadReminders',
    label: 'Stale Lead Reminders',
    description: 'Reminder for leads not contacted within 24 hours',
  },
  {
    key: 'performanceAlerts',
    label: 'Performance Alerts',
    description: 'Warnings when metrics fall below targets',
  },
];

/**
 * Notification settings card component.
 * Displays browser notification permission status and preference toggles.
 *
 * @example
 * ```tsx
 * <NotificationSettingsCard />
 * ```
 */
export function NotificationSettingsCard() {
  const { permission, isSupported, isGranted, requestPermission } =
    useNotificationPermission();
  const { preferences, isLoaded, updatePreference } =
    useNotificationPreferences();
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast({
        title: 'Browser notifications enabled',
        description: 'You will now receive browser alerts.',
      });
    } else if (result === 'denied') {
      toast({
        title: 'Notifications blocked',
        description: 'Check your browser settings to enable notifications.',
        variant: 'destructive',
      });
    }
  };

  // Debounced toast to prevent spam when toggling rapidly (AC#6)
  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreference(key, value);

    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Show toast after debounce delay
    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: 'Notification settings saved',
        description: 'Your preferences have been updated.',
      });
    }, TOAST_DEBOUNCE_MS);
  };

  /**
   * Renders permission status badge with appropriate color (AC#3)
   */
  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-600"
            data-testid="badge-permission-granted"
          >
            Granted
          </Badge>
        );
      case 'denied':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="destructive"
                data-testid="badge-permission-denied"
              >
                Denied
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>To enable, click the lock icon in your browser address bar</p>
            </TooltipContent>
          </Tooltip>
        );
      default:
        return (
          <Badge
            variant="secondary"
            data-testid="badge-permission-default"
          >
            Not Set
          </Badge>
        );
    }
  };

  // Browser doesn't support Notification API
  if (!isSupported) {
    return (
      <Card data-testid="notification-settings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive alerts and reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Browser notifications not supported
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your browser doesn&apos;t support the Notification API.
                Try using Chrome, Firefox, or Edge for notification features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="notification-settings-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure how you receive alerts and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status Section (AC#2, AC#3) */}
        <div
          className="flex items-center justify-between"
          data-testid="permission-status-section"
        >
          <div className="space-y-0.5">
            <Label>Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Allow notifications in your browser
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getPermissionBadge()}
            {!isGranted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestPermission}
                data-testid="btn-enable-notifications"
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        {/* Preference Toggles Section (AC#4, AC#7) */}
        <div className="space-y-4" data-testid="preference-toggles-section">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Alert Preferences</Label>
            {!isGranted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable browser notifications to configure alerts</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Message when not granted (AC#7) */}
          {!isGranted && (
            <p
              className="text-sm text-muted-foreground"
              data-testid="enable-message"
            >
              Enable browser notifications to configure alerts
            </p>
          )}

          {/* Preference toggles */}
          {isLoaded &&
            PREFERENCE_OPTIONS.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between"
                data-testid={`preference-${option.key}`}
              >
                <div className="space-y-0.5">
                  <Label
                    htmlFor={option.key}
                    className={!isGranted ? 'text-muted-foreground' : ''}
                  >
                    {option.label}
                  </Label>
                  <p
                    id={`${option.key}-description`}
                    className="text-sm text-muted-foreground"
                  >
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={option.key}
                  checked={preferences[option.key]}
                  onCheckedChange={(checked) => handleToggle(option.key, checked)}
                  disabled={!isGranted}
                  aria-describedby={`${option.key}-description`}
                  data-testid={`switch-${option.key}`}
                />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
