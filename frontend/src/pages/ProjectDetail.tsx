import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  DocumentIcon,
  StarIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  useUploadAsset,
  useDeleteAsset,
  useSetHeroImage,
  useUpdateAsset
} from '../hooks/useAssets';
import { 
  useProject, 
  useDeleteProject, 
} from '../hooks/useProjects';
import Loading from '../components/Loading';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data, isLoading, error } = useProject(id!);
  const deleteProjectMutation = useDeleteProject();
  const uploadAssetMutation = useUploadAsset();
  const deleteAssetMutation = useDeleteAsset();
  const setHeroImageMutation = useSetHeroImage();
  const updateAssetMutation = useUpdateAsset();

  const project = data?.data;

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProjectMutation.mutateAsync(id!);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadAssetMutation.mutateAsync({ projectId: id!, file });
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAssetMutation.mutateAsync(assetId);
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const handleSetHeroImage = async (assetId: string) => {
    try {
      await setHeroImageMutation.mutateAsync(assetId);
    } catch (error) {
      console.error('Failed to set hero image:', error);
    }
  };

  const startEditingAsset = (asset: any) => {
    setEditingAsset(asset.id);
    setEditForm({
      title: asset.title || '',
      caption: asset.caption || '',
    });
  };

  const saveAssetEdit = async () => {
    if (!editingAsset) return;
    
    try {
      await updateAssetMutation.mutateAsync({
        id: editingAsset,
        asset: editForm
      });
      setEditingAsset(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };

  if (isLoading) return <Loading />;
  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-swiss-gray-500">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block text-swiss-black hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const getAssetUrl = (asset: any) => {
    if (asset.url) return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${asset.url}`;
    if (asset.mimeType?.startsWith('image/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/projects/optimized/${asset.fileName}`;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/projects/originals/${asset.fileName}`;
  };

  const getThumbnailUrl = (asset: any) => {
    if (asset.thumbnailUrl) return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${asset.thumbnailUrl}`;
    if (asset.mimeType?.startsWith('image/')) {
      const thumbName = asset.fileName.replace(/\.[^.]+$/, '_thumb.jpeg');
      return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/projects/thumbnails/${thumbName}`;
    }
    return getAssetUrl(asset);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-swiss-gray-500 hover:text-swiss-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-swiss-gray-900">{project.projectName}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-swiss-gray-600">
              <span>{project.projectType.replace('_', ' ')}</span>
              <span>•</span>
              <span>{project.location}</span>
              <span>•</span>
              <span>{project.yearStart}{project.yearCompletion && ` - ${project.yearCompletion}`}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
            >
              <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDeleteProject}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium text-red-700 bg-swiss-white hover:bg-red-50"
            >
              <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Project Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-swiss-white border border-swiss-gray-200 p-6">
          <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Project Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-swiss-gray-700">Brief Description</h3>
              <p className="mt-1 text-sm text-swiss-gray-900">{project.briefDescription}</p>
            </div>
            
            {project.detailedDescription && (
              <div>
                <h3 className="text-sm font-medium text-swiss-gray-700">Detailed Description</h3>
                <p className="mt-1 text-sm text-swiss-gray-900 whitespace-pre-wrap">{project.detailedDescription}</p>
              </div>
            )}
            
            {project.designApproach && (
              <div>
                <h3 className="text-sm font-medium text-swiss-gray-700">Design Approach</h3>
                <p className="mt-1 text-sm text-swiss-gray-900">{project.designApproach}</p>
              </div>
            )}
            
            {project.keyChallenges && (
              <div>
                <h3 className="text-sm font-medium text-swiss-gray-700">Key Challenges</h3>
                <p className="mt-1 text-sm text-swiss-gray-900">{project.keyChallenges}</p>
              </div>
            )}
            
            {project.solutionsProvided && (
              <div>
                <h3 className="text-sm font-medium text-swiss-gray-700">Solutions Provided</h3>
                <p className="mt-1 text-sm text-swiss-gray-900">{project.solutionsProvided}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-swiss-white border border-swiss-gray-200 p-6">
          <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Project Information</h2>
          
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-swiss-gray-700">Client</dt>
              <dd className="mt-1 text-swiss-gray-900">{project.clientName || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-swiss-gray-700">Practice</dt>
              <dd className="mt-1 text-swiss-gray-900">{project.practiceName}</dd>
            </div>
            <div>
              <dt className="font-medium text-swiss-gray-700">Role</dt>
              <dd className="mt-1 text-swiss-gray-900">{project.role}</dd>
            </div>
            {project.teamSize && (
              <div>
                <dt className="font-medium text-swiss-gray-700">Team Size</dt>
                <dd className="mt-1 text-swiss-gray-900">{project.teamSize} people</dd>
              </div>
            )}
            {project.projectValue && (
              <div>
                <dt className="font-medium text-swiss-gray-700">Project Value</dt>
                <dd className="mt-1 text-swiss-gray-900">£{project.projectValue.toLocaleString()}</dd>
              </div>
            )}
            {project.projectSize && (
              <div>
                <dt className="font-medium text-swiss-gray-700">Project Size</dt>
                <dd className="mt-1 text-swiss-gray-900">{project.projectSize.toLocaleString()} m²</dd>
              </div>
            )}
            {project.ribaStages && project.ribaStages.length > 0 && (
              <div>
                <dt className="font-medium text-swiss-gray-700">RIBA Stages</dt>
                <dd className="mt-1 text-swiss-gray-900">
                  {project.ribaStages.map((stage: string) => 
                    stage.replace('STAGE_', '').replace(/_/g, ' ')
                  ).join(', ')}
                </dd>
              </div>
            )}
            {project.softwareUsed && project.softwareUsed.length > 0 && (
              <div>
                <dt className="font-medium text-swiss-gray-700">Software Used</dt>
                <dd className="mt-1">
                  <div className="flex flex-wrap gap-1">
                    {project.softwareUsed.map((software: string) => (
                      <span key={software} className="inline-block px-2 py-1 text-xs bg-swiss-gray-100 text-swiss-gray-800">
                        {software}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Assets Section */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-swiss-gray-900">Project Assets</h2>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center px-3 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50 cursor-pointer">
              <CloudArrowUpIcon className="-ml-1 mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Assets'}
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {project.assets && project.assets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {project.assets.map((asset) => (
              <div key={asset.id} className="relative group">
                <div className="aspect-square bg-swiss-gray-100 overflow-hidden border border-swiss-gray-200">
                  {asset.mimeType?.startsWith('image/') ? (
                    <img
                      src={getThumbnailUrl(asset)}
                      alt={asset.title || asset.fileName}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedAsset(asset)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-swiss-gray-200 transition-colors"
                      onClick={() => window.open(getAssetUrl(asset), '_blank')}
                    >
                      <DocumentIcon className="h-12 w-12 text-swiss-gray-400" />
                      <span className="mt-2 text-xs text-swiss-gray-500 text-center px-2">
                        {asset.fileName}
                      </span>
                    </div>
                  )}
                  
                  {/* Hero Badge */}
                  {asset.isHeroImage && (
                    <div className="absolute top-2 left-2">
                      <StarSolidIcon className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Asset Info */}
                {editingAsset === asset.id ? (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                      className="w-full px-2 py-1 text-xs border border-swiss-gray-300 focus:outline-none focus:ring-1 focus:ring-swiss-black"
                    />
                    <input
                      type="text"
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      placeholder="Caption"
                      className="w-full px-2 py-1 text-xs border border-swiss-gray-300 focus:outline-none focus:ring-1 focus:ring-swiss-black"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={saveAssetEdit}
                        className="flex-1 px-2 py-1 text-xs bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
                      >
                        <CheckIcon className="h-3 w-3 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAsset(null)}
                        className="px-2 py-1 text-xs bg-swiss-gray-200 text-swiss-gray-700 hover:bg-swiss-gray-300"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {asset.title && (
                      <p className="text-xs font-medium text-swiss-gray-900 truncate">{asset.title}</p>
                    )}
                    {asset.caption && (
                      <p className="text-xs text-swiss-gray-500 truncate">{asset.caption}</p>
                    )}
                    {!asset.title && !asset.caption && (
                      <p className="text-xs text-swiss-gray-400 truncate">{asset.fileName}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-1">
                    {asset.mimeType?.startsWith('image/') && !asset.isHeroImage && (
                      <button
                        onClick={() => handleSetHeroImage(asset.id)}
                        className="p-1 bg-swiss-white border border-swiss-gray-300 hover:bg-swiss-gray-50"
                        title="Set as hero image"
                      >
                        <StarIcon className="h-4 w-4 text-swiss-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => startEditingAsset(asset)}
                      className="p-1 bg-swiss-white border border-swiss-gray-300 hover:bg-swiss-gray-50"
                      title="Edit details"
                    >
                      <PencilIcon className="h-4 w-4 text-swiss-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 bg-swiss-white border border-red-300 hover:bg-red-50"
                      title="Delete asset"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-swiss-gray-50 border-2 border-dashed border-swiss-gray-300">
            <PhotoIcon className="mx-auto h-12 w-12 text-swiss-gray-400" />
            <p className="mt-2 text-sm text-swiss-gray-500">No assets uploaded yet</p>
            <label className="mt-4 inline-flex items-center px-3 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50 cursor-pointer">
              <CloudArrowUpIcon className="-ml-1 mr-2 h-4 w-4" />
              Upload First Asset
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedAsset && selectedAsset.mimeType?.startsWith('image/') && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <button
            onClick={() => setSelectedAsset(null)}
            className="absolute top-4 right-4 text-white hover:text-swiss-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={getAssetUrl(selectedAsset)}
            alt={selectedAsset.title || selectedAsset.fileName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {(selectedAsset.title || selectedAsset.caption) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              {selectedAsset.title && <h3 className="text-lg font-medium">{selectedAsset.title}</h3>}
              {selectedAsset.caption && <p className="text-sm mt-1">{selectedAsset.caption}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}