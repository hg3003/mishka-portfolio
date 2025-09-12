import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import Loading from '../components/Loading';

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProject(id!);
  const updateProjectMutation = useUpdateProject();

  const handleSubmit = async (formData: any) => {
    try {
      await updateProjectMutation.mutateAsync({ id: id!, project: formData });
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      // You could add toast notification here
    }
  };

  if (isLoading) return <Loading />;
  
  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-swiss-gray-500">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 inline-block text-swiss-black hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const project = data.data;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="inline-flex items-center text-sm text-swiss-gray-500 hover:text-swiss-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Project
        </button>
        
        <h1 className="text-3xl font-bold text-swiss-gray-900">Edit Project</h1>
        <p className="mt-2 text-sm text-swiss-gray-600">
          {project.projectName}
        </p>
      </div>

      {/* Form */}
      <ProjectForm 
        initialData={project}
        onSubmit={handleSubmit}
        isSubmitting={updateProjectMutation.isPending}
      />
    </div>
  );
}