import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useProjects } from '../hooks/useProjects';
import Loading from '../components/Loading';

const projectTypes = [
  'ALL',
  'RESIDENTIAL',
  'COMMERCIAL',
  'CULTURAL',
  'EDUCATIONAL',
  'HEALTHCARE',
  'HOSPITALITY',
  'MIXED_USE',
  'PUBLIC',
  'URBAN_PLANNING',
];

export default function Projects() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isAcademic: undefined as boolean | undefined,
    isCompetition: undefined as boolean | undefined,
  });

  const { data, isLoading, error } = useProjects({
    search: search || undefined,
    projectType: selectedType === 'ALL' ? undefined : selectedType,
    ...filters,
  });

  const projects = data?.data || [];
  const pagination = data?.pagination;

  const getProjectIcon = (project: any) => {
    if (project.isAcademic) return <AcademicCapIcon className="h-5 w-5 text-swiss-gray-400" />;
    if (project.isCompetition) return <TrophyIcon className="h-5 w-5 text-swiss-gray-400" />;
    return <BuildingOfficeIcon className="h-5 w-5 text-swiss-gray-400" />;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-swiss-gray-900">Projects</h1>
            <p className="mt-2 text-sm text-swiss-gray-600">
              Manage your architectural portfolio projects
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/projects/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium text-swiss-white bg-swiss-black hover:bg-swiss-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swiss-black"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-swiss-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-swiss-gray-300 bg-swiss-white placeholder-swiss-gray-500 focus:outline-none focus:ring-1 focus:ring-swiss-black focus:border-swiss-black sm:text-sm"
                placeholder="Search projects..."
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${
              showFilters 
                ? 'border-swiss-black bg-swiss-black text-swiss-white' 
                : 'border-swiss-gray-300 bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swiss-black`}
          >
            <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-4 space-y-4">
            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-swiss-gray-700 mb-2">
                Project Type
              </label>
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 text-sm font-medium border ${
                      selectedType === type
                        ? 'border-swiss-black bg-swiss-black text-swiss-white'
                        : 'border-swiss-gray-300 bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isAcademic === true}
                  onChange={(e) => setFilters({
                    ...filters,
                    isAcademic: e.target.checked ? true : undefined
                  })}
                  className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
                />
                <span className="ml-2 text-sm text-swiss-gray-700">Academic Projects Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isCompetition === true}
                  onChange={(e) => setFilters({
                    ...filters,
                    isCompetition: e.target.checked ? true : undefined
                  })}
                  className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
                />
                <span className="ml-2 text-sm text-swiss-gray-700">Competition Entries Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Projects List */}
      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-swiss-gray-500">Error loading projects</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-swiss-white border-2 border-dashed border-swiss-gray-300">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-swiss-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-swiss-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-swiss-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-swiss-white bg-swiss-black hover:bg-swiss-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-swiss-black"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-swiss-white border border-swiss-gray-200">
          <ul className="divide-y divide-swiss-gray-200">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="block hover:bg-swiss-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        {getProjectIcon(project)}
                        <p className="ml-2 text-lg font-medium text-swiss-gray-900 truncate">
                          {project.projectName}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-swiss-gray-500">
                        <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-swiss-gray-400" />
                        {project.projectType.replace('_', ' ')}
                        <MapPinIcon className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4 text-swiss-gray-400" />
                        {project.location}
                        <CalendarIcon className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4 text-swiss-gray-400" />
                        {project.yearStart}
                        {project.yearCompletion && project.yearCompletion !== project.yearStart && 
                          ` - ${project.yearCompletion}`}
                      </div>
                      <p className="mt-2 text-sm text-swiss-gray-600 line-clamp-2">
                        {project.briefDescription}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {project.awardsReceived && project.awardsReceived.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                            <TrophyIcon className="mr-1 h-3 w-3" />
                            Award Winner
                          </span>
                        )}
                        {project.isAcademic && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            Academic
                          </span>
                        )}
                        {project.isCompetition && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                            Competition
                          </span>
                        )}
                        {project.ribaStages && project.ribaStages.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-swiss-gray-100 text-swiss-gray-800">
                            RIBA {project.ribaStages.length} stages
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0 flex items-center">
                      {project._count?.assets ? (
                        <div className="flex items-center text-sm text-swiss-gray-500">
                          <PhotoIcon className="mr-1 h-5 w-5 text-swiss-gray-400" />
                          <span>{project._count.assets}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-swiss-gray-400">No assets</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-swiss-gray-200 bg-swiss-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50">
              Previous
            </button>
            <button className="relative ml-3 inline-flex items-center px-4 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-swiss-gray-700">
                Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total projects)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}