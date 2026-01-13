import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { KPICardsGrid, LeadTrendChartContainer, StatusDistributionContainer } from '@/components/dashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session?.user?.name || 'User'}
        </p>
      </div>

      {/* KPI Cards - Story 2.1 */}
      <KPICardsGrid period="month" />

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Trend Chart - Story 2.2 */}
        <LeadTrendChartContainer period="month" />

        {/* Status Distribution Chart - Story 2.3 */}
        <StatusDistributionContainer period="month" />
      </div>
    </div>
  );
}
