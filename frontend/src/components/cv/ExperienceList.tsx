// frontend/src/components/cv/ExperienceList.tsx
import { useId, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCVData, useCreateExperience, useUpdateExperience, useDeleteExperience } from '../../hooks/useApi';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ExperienceList() {
  const { data } = useCVData();
  const experiences = (data?.data?.experiences || []).slice().sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  const [editing, setEditing] = useState<any | null>(null); // { id?, data }
  const [isAdding, setIsAdding] = useState(false);
  const createExp = useCreateExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();
  const qc = useQueryClient();

  const save = async () => {
    if (!editing) return;

    const payload = { ...editing.data };
    // Gate required fields before calling API (prevents 400)
    const requiredOk =
      Boolean(String(payload.companyName || '').trim()) &&
      Boolean(String(payload.positionTitle || '').trim()) &&
      Boolean(String(payload.location || '').trim()) &&
      Boolean(String(payload.startDate || '').trim()) &&
      Boolean(String(payload.description || '').trim());

    if (!requiredOk) {
      alert('Please complete Company, Position, Location, Start Date, and Description.');
      return;
    }

    try {
      let res: any;
      if (editing.id) {
        res = await updateExp.mutateAsync({ id: editing.id, experience: payload });
        qc.setQueryData(['cv', 'all'], (prev: any) => {
          if (!prev) return prev;
          const updated = (prev.data?.experiences || []).map((e: any) => (e.id === res.data.id ? res.data : e));
          return { ...prev, data: { ...prev.data, experiences: updated } };
        });
      } else {
        res = await createExp.mutateAsync(payload);
        qc.setQueryData(['cv', 'all'], (prev: any) => {
          if (!prev) return prev;
          const updated = [...(prev.data?.experiences || []), res.data];
          return { ...prev, data: { ...prev.data, experiences: updated } };
        });
      }
      setEditing(null);
      setIsAdding(false);
    } catch (e) {
      console.error('Failed to save experience', e);
      alert('Save failed. Check required fields and try again.');
    }
  };

  const reorder = async (id: string, dir: 'up' | 'down') => {
    const list = experiences.slice();
    const idx = list.findIndex((e) => e.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === list.length - 1)) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    try {
      await Promise.all(list.map((e, i) => updateExp.mutateAsync({ id: e.id, experience: { displayOrder: i } })));
      qc.setQueryData(['cv', 'all'], (prev: any) =>
        prev ? { ...prev, data: { ...prev.data, experiences: list.map((e, i) => ({ ...e, displayOrder: i })) } } : prev
      );
    } catch (e) {
      console.error('Failed to reorder experiences', e);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    try {
      await deleteExp.mutateAsync(id);
      qc.setQueryData(['cv', 'all'], (prev: any) =>
        prev ? { ...prev, data: { ...prev.data, experiences: (prev.data.experiences || []).filter((e: any) => e.id !== id) } } : prev
      );
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditing({
      data: {
        companyName: '',
        positionTitle: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD (API will normalize)
        endDate: '',
        isCurrent: false,
        description: '',
        keyProjects: [],
        keyAchievements: [],
        displayOrder: experiences.length,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-swiss-gray-900">Work Experience</h2>
        <button
          type="button"
          onClick={startAdd}
          disabled={isAdding}
          className="inline-flex items-center px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50 disabled:opacity-50"
        >
          <PlusIcon className="mr-1 h-4 w-4" /> Add Experience
        </button>
      </div>

      {isAdding && editing && !editing.id && (
        <div className="bg-swiss-white border border-swiss-gray-200 p-4">
          <ExperienceForm
            data={editing.data}
            onChange={(d: any) => setEditing({ ...editing, data: d })}
            onSave={save}
            onCancel={() => {
              setEditing(null);
              setIsAdding(false);
            }}
          />
        </div>
      )}

      {experiences.map((exp: any, index: number) => (
        <div key={exp.id} className="bg-swiss-white border border-swiss-gray-200 p-4">
          {editing?.id === exp.id ? (
            <ExperienceForm
              data={editing.data}
              onChange={(d: any) => setEditing({ ...editing, data: d })}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium text-swiss-gray-900">
                  {exp.positionTitle} at {exp.companyName}
                </h3>
                <p className="text-sm text-swiss-gray-500 mt-1">
                  {exp.location} • {new Date(exp.startDate).toLocaleDateString()} -
                  {exp.isCurrent ? ' Present' : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString()}` : ' Present'}
                </p>
                <p className="text-sm text-swiss-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                {!!exp.keyProjects?.length && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-swiss-gray-700">Key Projects:</p>
                    <ul className="mt-1 list-disc list-inside text-sm text-swiss-gray-600">
                      {exp.keyProjects.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!exp.keyAchievements?.length && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-swiss-gray-700">Key Achievements:</p>
                    <ul className="mt-1 list-disc list-inside text-sm text-swiss-gray-600">
                      {exp.keyAchievements.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  type="button"
                  onClick={() => reorder(exp.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => reorder(exp.id, 'down')}
                  disabled={index === experiences.length - 1}
                  className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing({ id: exp.id, data: { ...exp } })}
                  className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => remove(exp.id)} className="p-1 text-red-500 hover:text-red-700">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceForm({ data, onChange, onSave, onCancel }: any) {
  const uid = useId();
  const [keyProject, setKeyProject] = useState('');
  const [keyAchievement, setKeyAchievement] = useState('');

  const addKeyProject = () => {
    if (keyProject.trim()) {
      onChange({ ...data, keyProjects: [...(data.keyProjects || []), keyProject.trim()] });
      setKeyProject('');
    }
  };
  const addKeyAchievement = () => {
    if (keyAchievement.trim()) {
      onChange({ ...data, keyAchievements: [...(data.keyAchievements || []), keyAchievement.trim()] });
      setKeyAchievement('');
    }
  };
  const removeKeyProject = (i: number) => {
    const arr = [...(data.keyProjects || [])];
    arr.splice(i, 1);
    onChange({ ...data, keyProjects: arr });
  };
  const removeKeyAchievement = (i: number) => {
    const arr = [...(data.keyAchievements || [])];
    arr.splice(i, 1);
    onChange({ ...data, keyAchievements: arr });
  };

  const requiredOk = useMemo(() => {
    return (
      Boolean(String(data.companyName || '').trim()) &&
      Boolean(String(data.positionTitle || '').trim()) &&
      Boolean(String(data.location || '').trim()) &&
      Boolean(String(data.startDate || '').trim()) &&
      Boolean(String(data.description || '').trim())
    );
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="swiss-label" htmlFor={`${uid}-company`}>Company Name</label>
          <input
            id={`${uid}-company`}
            name="companyName"
            className="swiss-input"
            value={data.companyName}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
          />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-title`}>Position Title</label>
          <input
            id={`${uid}-title`}
            name="positionTitle"
            className="swiss-input"
            value={data.positionTitle}
            onChange={(e) => onChange({ ...data, positionTitle: e.target.value })}
          />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-location`}>Location</label>
          <input
            id={`${uid}-location`}
            name="location"
            className="swiss-input"
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
          />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-start`}>Start Date</label>
          <input
            id={`${uid}-start`}
            name="startDate"
            type="date"
            className="swiss-input"
            value={(data.startDate || '').split('T')[0]}
            onChange={(e) => onChange({ ...data, startDate: e.target.value + 'T00:00:00Z' })}
          />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-end`}>End Date</label>
          <input
            id={`${uid}-end`}
            name="endDate"
            type="date"
            className="swiss-input"
            value={(data.endDate || '').split('T')[0] || ''}
            onChange={(e) => onChange({ ...data, endDate: e.target.value ? e.target.value + 'T00:00:00Z' : '' })}
            disabled={data.isCurrent}
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center" htmlFor={`${uid}-current`}>
            <input
              id={`${uid}-current`}
              name="isCurrent"
              type="checkbox"
              className="h-4 w-4 text-swiss-black focus:ring-swiss-black border-swiss-gray-300"
              checked={data.isCurrent}
              onChange={(e) =>
                onChange({ ...data, isCurrent: e.target.checked, endDate: e.target.checked ? '' : data.endDate })
              }
            />
            <span className="ml-2 text-sm text-swiss-gray-700">Current Position</span>
          </label>
        </div>
      </div>

      <div>
        <label className="swiss-label" htmlFor={`${uid}-desc`}>Description</label>
        <textarea
          id={`${uid}-desc`}
          name="description"
          rows={4}
          className="swiss-input"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
        />
      </div>

      <div>
        <label className="swiss-label" htmlFor={`${uid}-kp-input`}>Key Projects</label>
        <div className="space-y-2">
          {data.keyProjects?.map((p: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm flex-1">{p}</span>
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeKeyProject(i)}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              id={`${uid}-kp-input`}
              name="keyProjectInput"
              className="swiss-input flex-1"
              value={keyProject}
              onChange={(e) => setKeyProject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyProject())}
              placeholder="Add a key project"
            />
            <button
              type="button"
              onClick={addKeyProject}
              className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="swiss-label" htmlFor={`${uid}-ka-input`}>Key Achievements</label>
        <div className="space-y-2">
          {data.keyAchievements?.map((a: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm flex-1">{a}</span>
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeKeyAchievement(i)}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              id={`${uid}-ka-input`}
              name="keyAchievementInput"
              className="swiss-input flex-1"
              value={keyAchievement}
              onChange={(e) => setKeyAchievement(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyAchievement())}
              placeholder="Add a key achievement"
            />
            <button
              type="button"
              onClick={addKeyAchievement}
              className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!requiredOk}
          className={`px-3 py-1 text-sm ${
            !requiredOk ? 'bg-swiss-gray-200 text-swiss-gray-500 cursor-not-allowed' : 'bg-swiss-black text-swiss-white hover:bg-swiss-gray-800'
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
}