import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  HomeIcon, 
  FolderIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useStats } from '../hooks/useApi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'CV', href: '/cv', icon: DocumentTextIcon },
  { name: 'Portfolios', href: '/portfolios', icon: BookOpenIcon },
  { name: 'Settings', href: '/settings', icon: DocumentTextIcon },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: statsData } = useStats();
  const stats = statsData?.data;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-swiss-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-swiss-black bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-swiss-white transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-swiss-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-swiss-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold">Portfolio System</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-swiss-gray-200 text-swiss-black'
                      : 'text-swiss-gray-600 hover:bg-swiss-gray-100 hover:text-swiss-black'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          {stats && (
            <div className="flex-shrink-0 flex border-t border-swiss-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <div className="text-xs text-swiss-gray-500 uppercase tracking-wider mb-2">Database</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-swiss-gray-500">Projects:</span>
                    <span className="ml-1 font-medium">{stats.projects}</span>
                  </div>
                  <div>
                    <span className="text-swiss-gray-500">Assets:</span>
                    <span className="ml-1 font-medium">{stats.assets}</span>
                  </div>
                  <div>
                    <span className="text-swiss-gray-500">Portfolios:</span>
                    <span className="ml-1 font-medium">{stats.portfolios}</span>
                  </div>
                  <div>
                    <span className="text-swiss-gray-500">Total:</span>
                    <span className="ml-1 font-medium">{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-swiss-white border-r border-swiss-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold tracking-tight">Architecture Portfolio</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-swiss-black text-swiss-white'
                      : 'text-swiss-gray-600 hover:bg-swiss-gray-100 hover:text-swiss-black'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Quick Actions */}
            <div className="px-2 space-y-1 border-t border-swiss-gray-200 pt-4 mt-4">
              <Link
                to="/projects/new"
                className="group flex items-center px-2 py-2 text-sm font-medium text-swiss-gray-600 hover:bg-swiss-gray-100 hover:text-swiss-black"
              >
                <PlusIcon className="mr-3 h-5 w-5" />
                New Project
              </Link>
              <Link
                to="/portfolios/create"
                className="group flex items-center px-2 py-2 text-sm font-medium text-swiss-gray-600 hover:bg-swiss-gray-100 hover:text-swiss-black"
              >
                <BookOpenIcon className="mr-3 h-5 w-5" />
                Create Portfolio
              </Link>
              <Link
                to="/settings"
                className="group flex items-center px-2 py-2 text-sm font-medium text-swiss-gray-600 hover:bg-swiss-gray-100 hover:text-swiss-black"
              >
                <DocumentTextIcon className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </div>
          </div>
          {stats && (
            <div className="flex-shrink-0 flex border-t border-swiss-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-swiss-gray-400 mr-2" />
                  <div className="text-xs text-swiss-gray-500 uppercase tracking-wider">Statistics</div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-500">Projects:</span>
                    <span className="font-medium">{stats.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-500">Assets:</span>
                    <span className="font-medium">{stats.assets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-500">Portfolios:</span>
                    <span className="font-medium">{stats.portfolios}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-500">CV Items:</span>
                    <span className="font-medium">{stats.experiences + stats.education + stats.skills}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-swiss-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center text-swiss-gray-500 hover:text-swiss-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-swiss-black"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}