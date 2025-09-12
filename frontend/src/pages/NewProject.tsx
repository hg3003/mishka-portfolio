import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCreateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';

export default function NewProject() {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();

  const handleSubmit = async (data: any) => {
    try {
      const result = await createProjectMutation.mutateAsync(data);
      if (result.data?.id) {
        navigate(`/projects/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      // You could add toast notification here
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center text-sm text-swiss-gray-500 hover:text-swiss-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold text-swiss-gray-900">Create New Project</h1>
        <p className="mt-2 text-sm text-swiss-gray-600">
          Add a new project to your portfolio
        </p>
      </div>

      {/* Form */}
      <ProjectForm 
        onSubmit={handleSubmit}
        isSubmitting={createProjectMutation.isPending}
      />
    </div>
  );
}