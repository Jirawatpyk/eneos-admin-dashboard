import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome to ENEOS Sales Dashboard
      </h1>
      <p className="text-gray-600 mb-4">
        Hello, {session?.user?.name || 'User'}! You have successfully logged in.
      </p>
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <h2 className="text-green-800 font-semibold mb-2">Authentication Status</h2>
        <ul className="text-sm text-green-700 space-y-1">
          <li>Email: {session?.user?.email}</li>
          <li>Session Active: Yes</li>
        </ul>
      </div>
      <p className="text-sm text-gray-500 mt-6">
        Dashboard features will be implemented in upcoming stories.
      </p>
    </div>
  );
}
