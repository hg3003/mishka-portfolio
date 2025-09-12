import { Link } from 'react-router-dom';
import { 
  FolderIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  PhotoIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useStats, useProjects, usePortfolios, useCVData } from '../hooks/useApi';

export default function Dashboard() {
  const { data: statsData } = useStats();
  const { data: projectsData } = useProjects({ limit: 3 });
  const { data: portfoliosData } = usePortfolios();
  const { data: cvData } = useCVData();
  
  const stats = statsData?.data;
  const recentProjects = projectsData?.data || [];
  const portfolios = portfoliosData?.data || [];
  const cv = cvData?.data;

  const quickActions = [
    {
      name: 'New Project',
      description: 'Add a new architectural project',
      href: '/projects/new',
      icon: FolderIcon,
      iconBackground: 'bg-swiss-black',
    },
    {
      name: 'Upload Assets',
      description: 'Add images and drawings',
      href: '/projects',
      icon: PhotoIcon,
      iconBackground: 'bg-swiss-gray-600',
    },
    {
      name: 'Update CV',
      description: 'Edit your experience and skills',
      href: '/cv',
      icon: DocumentTextIcon,
      iconBackground: 'bg-swiss-gray-700',
    },
    {
      name: 'Create Portfolio',
      description: 'Generate a new portfolio PDF',
      href: '/portfolios/create',
      icon: BookOpenIcon,
      iconBackground: 'bg-swiss-black',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-swiss-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-swiss-gray-600">
          Welcome back, {cv?.personalInfo?.name || 'Architect'}
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Overview</h2>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative bg-swiss-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 border border-swiss-gray-200 overflow-hidden">
              <dt>
                <div className="absolute bg-swiss-black p-3">
                  <FolderIcon className="h-6 w-6 text-swiss-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-swiss-gray-500 truncate">Total Projects</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-swiss-gray-900">{stats.projects}</p>
              </dd>
            </div>

            <div className="relative bg-swiss-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 border border-swiss-gray-200 overflow-hidden">
              <dt>
                <div className="absolute bg-swiss-gray-600 p-3">
                  <PhotoIcon className="h-6 w-6 text-swiss-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-swiss-gray-500 truncate">Total Assets</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-swiss-gray-900">{stats.assets}</p>
              </dd>
            </div>

            <div className="relative bg-swiss-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 border border-swiss-gray-200 overflow-hidden">
              <dt>
                <div className="absolute bg-swiss-gray-700 p-3">
                  <BookOpenIcon className="h-6 w-6 text-swiss-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-swiss-gray-500 truncate">Portfolios</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-swiss-gray-900">{stats.portfolios}</p>
              </dd>
            </div>

            <div className="relative bg-swiss-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 border border-swiss-gray-200 overflow-hidden">
              <dt>
                <div className="absolute bg-swiss-black p-3">
                  <DocumentTextIcon className="h-6 w-6 text-swiss-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-swiss-gray-500 truncate">CV Items</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-swiss-gray-900">
                  {stats.experiences + stats.education + stats.skills}
                </p>
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="relative group bg-swiss-white p-6 border border-swiss-gray-200 hover:border-swiss-gray-400 transition-colors"
            >
              <div>
                <span
                  className={`${action.iconBackground} inline-flex p-3 text-swiss-white`}
                >
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-swiss-gray-900">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-swiss-gray-500">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-swiss-gray-300 group-hover:text-swiss-gray-400"
                aria-hidden="true"
              >
                <ArrowRightIcon className="h-6 w-6" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-swiss-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm font-medium text-swiss-black hover:text-swiss-gray-700">
              View all
              <ArrowRightIcon className="inline ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="bg-swiss-white border border-swiss-gray-200">
            <ul className="divide-y divide-swiss-gray-200">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`} className="block hover:bg-swiss-gray-50 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-swiss-gray-900 truncate">
                          {project.projectName}
                        </p>
                        <p className="text-sm text-swiss-gray-500">
                          {project.projectType} • {project.location} • {project.yearStart}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center">
                        {project._count?.assets ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-swiss-gray-100 text-swiss-gray-800">
                            {project._count.assets} assets
                          </span>
                        ) : null}
                        <ArrowRightIcon className="ml-2 h-5 w-5 text-swiss-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recent Portfolios */}
      {portfolios.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-swiss-gray-900">Recent Portfolios</h2>
            <Link to="/portfolios" className="text-sm font-medium text-swiss-black hover:text-swiss-gray-700">
              View all
              <ArrowRightIcon className="inline ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="bg-swiss-white border border-swiss-gray-200">
            <ul className="divide-y divide-swiss-gray-200">
              {portfolios.slice(0, 3).map((portfolio) => (
                <li key={portfolio.id}>
                  <Link to={`/portfolios/${portfolio.id}`} className="block hover:bg-swiss-gray-50 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-swiss-gray-900 truncate">
                          {portfolio.portfolioName}
                        </p>
                        <p className="text-sm text-swiss-gray-500">
                          {portfolio.portfolioType} • {portfolio._count?.projects || 0} projects
                          {portfolio.cvIncluded && ' • CV included'}
                        </p>
                      </div>
                      <div className="ml-4">
                        <ArrowRightIcon className="h-5 w-5 text-swiss-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}