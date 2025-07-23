import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="home" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your CRM
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage leads, customers, and production workflow all in one place
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 max-w-7xl mx-auto">
              <Link href="/leads" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-blue-600 text-3xl mb-2">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leads</h3>
                <p className="text-gray-600">Track and manage potential customers</p>
              </Link>
              
              <Link href="/customers" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-green-600 text-3xl mb-2">🤝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
                <p className="text-gray-600">Manage existing customer relationships</p>
              </Link>
              
              <Link href="/activities" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-orange-600 text-3xl mb-2">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activities</h3>
                <p className="text-gray-600">Track interactions and follow-ups</p>
              </Link>
              
              <Link href="/tasks" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-purple-600 text-3xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks</h3>
                <p className="text-gray-600">Assign and track work items</p>
              </Link>
              
              <Link href="/tags" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-pink-600 text-3xl mb-2">🏷️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <p className="text-gray-600">Organize and categorize</p>
              </Link>
              
              <Link href="/dashboard" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="text-indigo-600 text-3xl mb-2">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
                <p className="text-gray-600">View analytics and insights</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
