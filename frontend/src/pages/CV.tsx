// frontend/src/pages/CV.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCVData } from '../hooks/useApi';
import CVPreview from '../components/cv/CVPreview';
import PersonalInfoForm from '../components/cv/PersonalInfoForm';
import ExperienceList from '../components/cv/ExperienceList';
import EducationList from '../components/cv/EducationList';
import SkillsGrid from '../components/cv/SkillsGrid';
import Loading from '../components/Loading';
import {
  UserCircleIcon, BriefcaseIcon, AcademicCapIcon, SparklesIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { cvApi } from '../services/cv';
import { API_URL } from '../lib/api';

export default function CV() {
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');
  const [showPreview, setShowPreview] = useState(true);
  const { data, isLoading } = useCVData();
  const generateMutation = useMutation({ mutationFn: cvApi.generate });

  const counts = {
    experiences: data?.data?.experiences?.length || 0,
    education: data?.data?.education?.length || 0,
    skills: data?.data?.skills?.length || 0,
  };

  if (isLoading) return <Loading />;

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserCircleIcon },
    { id: 'experience', name: 'Experience', icon: BriefcaseIcon, count: counts.experiences },
    { id: 'education', name: 'Education', icon: AcademicCapIcon, count: counts.education },
    { id: 'skills', name: 'Skills', icon: SparklesIcon, count: counts.skills },
  ] as const;

  return (
    <div className="flex gap-6">
      <div className={showPreview ? 'flex-1' : 'w-full'}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-swiss-gray-900">CV Management</h1>
            <p className="mt-2 text-sm text-swiss-gray-600">Manage your professional info, experience, education, and skills</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
            >
              {showPreview ? (<><EyeSlashIcon className="mr-2 h-4 w-4" />Hide Preview</>) : (<><EyeIcon className="mr-2 h-4 w-4" />Show Preview</>)}
            </button>
            <button
              type="button"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="inline-flex items-center px-3 py-2 text-sm border border-swiss-gray-900 text-swiss-white bg-swiss-black hover:opacity-90 disabled:opacity-50"
              title="Generate standalone CV PDF"
            >
              {generateMutation.isPending ? 'Generating…' : 'Generate CV PDF'}
            </button>
            {generateMutation.isSuccess && generateMutation.data?.data?.filePath && (
              <a
                className="text-sm underline ml-2"
                href={`${API_URL}${generateMutation.data.data.filePath}`}
                target="_blank"
                rel="noreferrer"
              >
                Download latest CV
              </a>
            )}
          </div>
        </div>

        <div className="border-b border-swiss-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === t.id ? 'border-swiss-black text-swiss-gray-900' : 'border-transparent text-swiss-gray-500 hover:text-swiss-gray-700 hover:border-swiss-gray-300'
                  }`}
                >
                  <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === t.id ? 'text-swiss-gray-900' : 'text-swiss-gray-400 group-hover:text-swiss-gray-500'}`} />
                  {t.name}
                  {typeof t.count === 'number' && (
                    <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${activeTab === t.id ? 'bg-swiss-gray-100 text-swiss-gray-900' : 'bg-swiss-gray-100 text-swiss-gray-600'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'personal' && <PersonalInfoForm />}
          {activeTab === 'experience' && <ExperienceList />}
          {activeTab === 'education' && <EducationList />}
          {activeTab === 'skills' && <SkillsGrid />}
        </div>
      </div>

      {showPreview && <div className="w-96 sticky top-6 h-fit"><CVPreview cv={data?.data} /></div>}
    </div>
  );
}
