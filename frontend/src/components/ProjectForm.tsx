import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

// Form validation schema
const projectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200),
  projectType: z.string().min(1, 'Project type is required'),
  location: z.string().min(1, 'Location is required').max(200),
  yearStart: z.number().min(1900).max(2100),
  yearCompletion: z.number().min(1900).max(2100).optional().nullable(),
  clientName: z.string().max(200).optional().nullable(),
  practiceName: z.string().min(1, 'Practice name is required').max(200),
  projectValue: z.number().positive().optional().nullable(),
  projectSize: z.number().positive().optional().nullable(),
  
  role: z.string().min(1, 'Role is required').max(100),
  teamSize: z.number().positive().optional().nullable(),
  responsibilities: z.array(z.string()).default([]),
  
  ribaStages: z.array(z.string()).default([]),
  
  briefDescription: z.string().min(1, 'Brief description is required').max(500),
  detailedDescription: z.string().max(5000).optional().nullable(),
  designApproach: z.string().max(2000).optional().nullable(),
  keyChallenges: z.string().max(2000).optional().nullable(),
  solutionsProvided: z.string().max(2000).optional().nullable(),
  sustainabilityFeatures: z.string().max(2000).optional().nullable(),
  
  softwareUsed: z.array(z.string()).default([]),
  skillsDemonstrated: z.array(z.string()).default([]),
  
  isAcademic: z.boolean().default(false),
  isCompetition: z.boolean().default(false),
  awardsReceived: z.array(z.string()).optional().nullable(),
  featuredPriority: z.number().min(1).max(10).default(5),
  tags: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const projectTypes = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'EDUCATIONAL', label: 'Educational' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'HOSPITALITY', label: 'Hospitality' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'LANDSCAPE', label: 'Landscape' },
  { value: 'MIXED_USE', label: 'Mixed Use' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'RELIGIOUS', label: 'Religious' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'URBAN_PLANNING', label: 'Urban Planning' },
  { value: 'OTHER', label: 'Other' },
];

const ribaStages = [
  { value: 'STAGE_0_STRATEGIC_DEFINITION', label: 'Stage 0 - Strategic Definition' },
  { value: 'STAGE_1_PREPARATION_BRIEF', label: 'Stage 1 - Preparation & Brief' },
  { value: 'STAGE_2_CONCEPT_DESIGN', label: 'Stage 2 - Concept Design' },
  { value: 'STAGE_3_SPATIAL_COORDINATION', label: 'Stage 3 - Spatial Coordination' },
  { value: 'STAGE_4_TECHNICAL_DESIGN', label: 'Stage 4 - Technical Design' },
  { value: 'STAGE_5_MANUFACTURING_CONSTRUCTION', label: 'Stage 5 - Manufacturing & Construction' },
  { value: 'STAGE_6_HANDOVER', label: 'Stage 6 - Handover' },
  { value: 'STAGE_7_USE', label: 'Stage 7 - Use' },
];

const commonSoftware = [
  'AutoCAD', 'Revit', 'Rhino', 'Grasshopper', 'SketchUp', 
  'Photoshop', 'Illustrator', 'InDesign', 'Lumion', 'V-Ray',
  'Enscape', 'ArchiCAD', '3ds Max', 'Navisworks', 'BIM 360'
];

const commonSkills = [
  'Concept Design', 'Technical Detailing', 'BIM Management', 
  'Project Management', 'Client Liaison', 'Site Coordination',
  'Sustainable Design', 'Urban Design', 'Interior Design',
  'Landscape Design', 'Heritage Conservation', 'Parametric Design'
];

export default function ProjectForm({ initialData, onSubmit, isSubmitting }: ProjectFormProps) {
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [awardInput, setAwardInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      projectType: '',
      location: '',
      yearStart: new Date().getFullYear(),
      practiceName: '',
      role: '',
      briefDescription: '',
      featuredPriority: 5,
      isAcademic: false,
      isCompetition: false,
      responsibilities: [],
      ribaStages: [],
      softwareUsed: [],
      skillsDemonstrated: [],
      tags: [],
      awardsReceived: [],
      ...initialData,
    },
  });

  const watchedResponsibilities = watch('responsibilities');
  const watchedRibaStages = watch('ribaStages');
  const watchedSoftware = watch('softwareUsed');
  const watchedSkills = watch('skillsDemonstrated');
  const watchedTags = watch('tags');
  const watchedAwards = watch('awardsReceived');

  const addItem = (field: any, value: string) => {
    if (value.trim()) {
      const current = watch(field) || [];
      if (!current.includes(value.trim())) {
        setValue(field, [...current, value.trim()]);
      }
    }
  };

  const removeItem = (field: any, index: number) => {
    const current = watch(field) || [];
    setValue(field, current.filter((_, i) => i !== index));
  };

  const toggleArrayItem = (field: any, value: string) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter(v => v !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="swiss-label">Project Name *</label>
            <input
              {...register('projectName')}
              type="text"
              className="swiss-input"
              placeholder="e.g., Thames Riverside Housing"
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Project Type *</label>
            <select {...register('projectType')} className="swiss-input">
              <option value="">Select type...</option>
              {projectTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.projectType && (
              <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Location *</label>
            <input
              {...register('location')}
              type="text"
              className="swiss-input"
              placeholder="e.g., London, UK"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Start Year *</label>
            <input
              {...register('yearStart', { valueAsNumber: true })}
              type="number"
              className="swiss-input"
              min="1900"
              max="2100"
            />
            {errors.yearStart && (
              <p className="mt-1 text-sm text-red-600">{errors.yearStart.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Completion Year</label>
            <input
              {...register('yearCompletion', { valueAsNumber: true, setValueAs: v => v === '' ? null : v })}
              type="number"
              className="swiss-input"
              min="1900"
              max="2100"
            />
          </div>

          <div>
            <label className="swiss-label">Client Name</label>
            <input
              {...register('clientName')}
              type="text"
              className="swiss-input"
              placeholder="e.g., Berkeley Group"
            />
          </div>

          <div>
            <label className="swiss-label">Practice Name *</label>
            <input
              {...register('practiceName')}
              type="text"
              className="swiss-input"
              placeholder="e.g., Foster + Partners"
            />
            {errors.practiceName && (
              <p className="mt-1 text-sm text-red-600">{errors.practiceName.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Project Value (£)</label>
            <input
              {...register('projectValue', { valueAsNumber: true, setValueAs: v => v === '' ? null : v })}
              type="number"
              className="swiss-input"
              min="0"
            />
          </div>

          <div>
            <label className="swiss-label">Project Size (m²)</label>
            <input
              {...register('projectSize', { valueAsNumber: true, setValueAs: v => v === '' ? null : v })}
              type="number"
              className="swiss-input"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Role & Involvement */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Role & Involvement</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="swiss-label">Your Role *</label>
            <input
              {...register('role')}
              type="text"
              className="swiss-input"
              placeholder="e.g., Architectural Assistant Part 2"
            />
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Team Size</label>
            <input
              {...register('teamSize', { valueAsNumber: true, setValueAs: v => v === '' ? null : v })}
              type="number"
              className="swiss-input"
              min="1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="swiss-label">Key Responsibilities</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('responsibilities', responsibilityInput);
                    setResponsibilityInput('');
                  }
                }}
                className="swiss-input flex-1"
                placeholder="Add a responsibility and press Enter"
              />
              <button
                type="button"
                onClick={() => {
                  addItem('responsibilities', responsibilityInput);
                  setResponsibilityInput('');
                }}
                className="swiss-button"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedResponsibilities?.map((resp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-swiss-gray-100 text-swiss-gray-800"
                >
                  {resp}
                  <button
                    type="button"
                    onClick={() => removeItem('responsibilities', index)}
                    className="ml-2 text-swiss-gray-500 hover:text-swiss-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIBA Stages */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">RIBA Stages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ribaStages.map(stage => (
            <label key={stage.value} className="flex items-center">
              <input
                type="checkbox"
                checked={watchedRibaStages?.includes(stage.value) || false}
                onChange={() => toggleArrayItem('ribaStages', stage.value)}
                className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
              />
              <span className="ml-2 text-sm text-swiss-gray-700">{stage.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Project Description</h2>
        
        <div className="space-y-6">
          <div>
            <label className="swiss-label">Brief Description *</label>
            <textarea
              {...register('briefDescription')}
              rows={3}
              className="swiss-input"
              placeholder="A concise overview of the project (max 500 characters)"
              maxLength={500}
            />
            {errors.briefDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.briefDescription.message}</p>
            )}
          </div>

          <div>
            <label className="swiss-label">Detailed Description</label>
            <textarea
              {...register('detailedDescription')}
              rows={6}
              className="swiss-input"
              placeholder="Comprehensive project description"
            />
          </div>

          <div>
            <label className="swiss-label">Design Approach</label>
            <textarea
              {...register('designApproach')}
              rows={4}
              className="swiss-input"
              placeholder="Describe your design philosophy and approach"
            />
          </div>

          <div>
            <label className="swiss-label">Key Challenges</label>
            <textarea
              {...register('keyChallenges')}
              rows={4}
              className="swiss-input"
              placeholder="What were the main challenges faced?"
            />
          </div>

          <div>
            <label className="swiss-label">Solutions Provided</label>
            <textarea
              {...register('solutionsProvided')}
              rows={4}
              className="swiss-input"
              placeholder="How did you address the challenges?"
            />
          </div>

          <div>
            <label className="swiss-label">Sustainability Features</label>
            <textarea
              {...register('sustainabilityFeatures')}
              rows={4}
              className="swiss-input"
              placeholder="Environmental and sustainable design aspects"
            />
          </div>
        </div>
      </div>

      {/* Skills & Software */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Skills & Software</h2>
        
        <div className="space-y-6">
          <div>
            <label className="swiss-label">Software Used</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonSoftware.map(software => (
                <button
                  key={software}
                  type="button"
                  onClick={() => toggleArrayItem('softwareUsed', software)}
                  className={`px-3 py-1 text-sm border ${
                    watchedSoftware?.includes(software)
                      ? 'border-swiss-black bg-swiss-black text-swiss-white'
                      : 'border-swiss-gray-300 bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                  }`}
                >
                  {software}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="swiss-label">Skills Demonstrated</label>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleArrayItem('skillsDemonstrated', skill)}
                  className={`px-3 py-1 text-sm border ${
                    watchedSkills?.includes(skill)
                      ? 'border-swiss-black bg-swiss-black text-swiss-white'
                      : 'border-swiss-gray-300 bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <h2 className="text-lg font-medium text-swiss-gray-900 mb-4">Additional Information</h2>
        
        <div className="space-y-6">
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                {...register('isAcademic')}
                type="checkbox"
                className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
              />
              <span className="ml-2 text-sm text-swiss-gray-700">Academic Project</span>
            </label>
            
            <label className="flex items-center">
              <input
                {...register('isCompetition')}
                type="checkbox"
                className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
              />
              <span className="ml-2 text-sm text-swiss-gray-700">Competition Entry</span>
            </label>
          </div>

          <div>
            <label className="swiss-label">Awards Received</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={awardInput}
                onChange={(e) => setAwardInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('awardsReceived', awardInput);
                    setAwardInput('');
                  }
                }}
                className="swiss-input flex-1"
                placeholder="Add an award and press Enter"
              />
              <button
                type="button"
                onClick={() => {
                  addItem('awardsReceived', awardInput);
                  setAwardInput('');
                }}
                className="swiss-button"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedAwards?.map((award, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-800"
                >
                  {award}
                  <button
                    type="button"
                    onClick={() => removeItem('awardsReceived', index)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="swiss-label">Featured Priority (1-10)</label>
            <input
              {...register('featuredPriority', { valueAsNumber: true })}
              type="number"
              className="swiss-input w-32"
              min="1"
              max="10"
            />
            <p className="mt-1 text-xs text-swiss-gray-500">Lower number = higher priority</p>
          </div>

          <div>
            <label className="swiss-label">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('tags', tagInput);
                    setTagInput('');
                  }
                }}
                className="swiss-input flex-1"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={() => {
                  addItem('tags', tagInput);
                  setTagInput('');
                }}
                className="swiss-button"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-swiss-gray-100 text-swiss-gray-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeItem('tags', index)}
                    className="ml-2 text-swiss-gray-500 hover:text-swiss-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="px-6 py-2 border border-swiss-gray-300 text-sm font-medium text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 border border-transparent text-sm font-medium text-swiss-white bg-swiss-black hover:bg-swiss-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  );
}