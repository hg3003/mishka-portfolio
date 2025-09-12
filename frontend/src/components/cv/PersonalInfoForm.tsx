// frontend/src/components/cv/PersonalInfoForm.tsx
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCVData, useUpdatePersonalInfo } from '../../hooks/useApi';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function PersonalInfoForm() {
  const { data } = useCVData();
  const current = data?.data?.personalInfo ?? null; // avoid creating {} every render
  const [formData, setFormData] = useState<any>(current ?? {}); // fallback to {}
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const updatePersonal = useUpdatePersonalInfo();
  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData(current ?? {}); // fallback to {}
    setHasChanges(false);
  }, [current]); // depend on stable object (null or server object)

  const onChange = (k: string, v: string) => {
    setFormData((p: any) => ({ ...p, [k]: v }));
    setHasChanges(true);
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      const merged = { ...current, ...formData };
      const res = await updatePersonal.mutateAsync(merged);
      queryClient.setQueryData(['cv', 'all'], (prev: any) =>
        prev ? { ...prev, data: { ...prev.data, personalInfo: res.data } } : prev
      );
      setHasChanges(false);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    } finally {
      setIsSaving(false);
    }
  };

  const requiredOk =
    Boolean((formData?.name || '').trim()) &&
    Boolean((formData?.professionalTitle || '').trim()) &&
    Boolean((formData?.email || '').trim()) &&
    Boolean((formData?.location || '').trim());

  return (
    <div className="bg-swiss-white border border-swiss-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-swiss-gray-900">Personal Information</h2>
          {savedIndicator && <span className="inline-flex items-center text-xs text-green-700"><CheckIcon className="h-3 w-3 mr-1" /> Saved</span>}
          {hasChanges && <span className="text-xs text-swiss-gray-500">Unsaved changes</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || !requiredOk || isSaving}
          className={`inline-flex items-center px-3 py-1 text-sm border ${
            !hasChanges || !requiredOk || isSaving
              ? 'border-swiss-gray-200 bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed'
              : 'border-swiss-black bg-swiss-black text-swiss-white hover:bg-swiss-gray-800'
          }`}
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="swiss-label" htmlFor="pi-name">Name</label>
          <input id="pi-name" name="name" autoComplete="name" className="swiss-input" value={formData?.name || ''} onChange={(e) => onChange('name', e.target.value)} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="pi-title">Professional Title</label>
          <input id="pi-title" name="professionalTitle" autoComplete="organization-title" className="swiss-input" value={formData?.professionalTitle || ''} onChange={(e) => onChange('professionalTitle', e.target.value)} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="pi-email">Email</label>
          <input id="pi-email" name="email" type="email" autoComplete="email" className="swiss-input" value={formData?.email || ''} onChange={(e) => onChange('email', e.target.value)} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="pi-phone">Phone</label>
          <input id="pi-phone" name="phone" autoComplete="tel" className="swiss-input" value={formData?.phone || ''} onChange={(e) => onChange('phone', e.target.value)} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="pi-location">Location</label>
          <input id="pi-location" name="location" autoComplete="address-level2" className="swiss-input" value={formData?.location || ''} onChange={(e) => onChange('location', e.target.value)} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="pi-arb">ARB Number</label>
          <input id="pi-arb" name="arbNumber" className="swiss-input" value={formData?.arbNumber || ''} onChange={(e) => onChange('arbNumber', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="swiss-label" htmlFor="pi-linkedin">LinkedIn URL</label>
          <input id="pi-linkedin" name="linkedinUrl" autoComplete="url" className="swiss-input" value={formData?.linkedinUrl || ''} onChange={(e) => onChange('linkedinUrl', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="swiss-label" htmlFor="pi-website">Website URL</label>
          <input id="pi-website" name="websiteUrl" autoComplete="url" className="swiss-input" value={formData?.websiteUrl || ''} onChange={(e) => onChange('websiteUrl', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="swiss-label" htmlFor="pi-summary">Professional Summary</label>
          <textarea id="pi-summary" name="professionalSummary" rows={4} className="swiss-input" value={formData?.professionalSummary || ''} onChange={(e) => onChange('professionalSummary', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="swiss-label" htmlFor="pi-objectives">Career Objectives</label>
          <textarea id="pi-objectives" name="careerObjectives" rows={3} className="swiss-input" value={formData?.careerObjectives || ''} onChange={(e) => onChange('careerObjectives', e.target.value)} />
        </div>
      </div>
    </div>
  );
}