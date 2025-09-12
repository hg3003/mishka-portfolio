// frontend/src/components/cv/EducationList.tsx
import { useId, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCVData, useCreateEducation, useUpdateEducation, useDeleteEducation } from '../../hooks/useApi';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function EducationList() {
  const { data } = useCVData();
  const education = (data?.data?.education || []).slice().sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  const [editing, setEditing] = useState<any | null>(null); // { id?, data }
  const [isAdding, setIsAdding] = useState(false);
  const createEdu = useCreateEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();
  const qc = useQueryClient();

  const sanitize = (d: any) => {
    const out: any = {
      institutionName: (d.institutionName || '').trim(),
      degreeType: (d.degreeType || '').trim(),
      fieldOfStudy: (d.fieldOfStudy || '').trim(),
      location: (d.location || '').trim(),
      startDate: (d.startDate || '').split('T')[0],
      displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : education.length,
    };
    if (d.endDate && String(d.endDate).trim()) out.endDate = String(d.endDate).split('T')[0];
    if (d.grade && String(d.grade).trim()) out.grade = String(d.grade).trim();
    if (Array.isArray(d.relevantCoursework)) {
      const arr = d.relevantCoursework.map((x: any) => String(x).trim()).filter(Boolean);
      if (arr.length) out.relevantCoursework = arr;
    }
    return out;
  };

  const save = async () => {
  if (!editing) return;

  // Build sanitized payload exactly as before
  const payload = sanitize(editing.data);

  // Validate required fields and log what's missing
  const missing: string[] = [];
  if (!payload.institutionName) missing.push('institutionName');
  if (!payload.degreeType) missing.push('degreeType');
  if (!payload.fieldOfStudy) missing.push('fieldOfStudy');
  if (!payload.location) missing.push('location');
  if (!payload.startDate) missing.push('startDate');

  if (missing.length > 0) {
    console.warn('[Education Save] Missing required fields:', missing);
    alert(
      'Please complete all required fields:\n' +
      missing.join(', ')
    );
    return;
  }

  // Helpful debug group
  const method = editing.id ? 'PUT' : 'POST';
  const url = editing.id ? `/api/cv/education/${editing.id}` : '/api/cv/education';
  console.groupCollapsed(
    `[Education Save] ${method} ${url} @ ${new Date().toISOString()}`
  );
  try {
    console.log('Raw form (editing.data):', editing?.data);
    console.log('Sanitized payload:', payload);

    let res: any;
    if (editing.id) {
      res = await updateEdu.mutateAsync({ id: editing.id, education: payload });
      // Update cache (unchanged)
      qc.setQueryData(['cv', 'all'], (prev: any) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                education: (prev.data.education || []).map((e: any) =>
                  e.id === res.data.id ? res.data : e
                ),
              },
            }
          : prev
      );
    } else {
      res = await createEdu.mutateAsync(payload);
      qc.setQueryData(['cv', 'all'], (prev: any) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                education: [...(prev.data.education || []), res.data],
              },
            }
          : prev
      );
    }

    console.info('[Education Save] Success:', res?.data || res);
    setEditing(null);
    setIsAdding(false);
  } catch (e: any) {
    // Extract common Axios bits
    const status = e?.response?.status;
    const server = e?.response?.data;
    const details = server?.details;

    console.error('[Education Save] Error object:', e);
    console.error('[Education Save] HTTP status:', status);
    if (server) console.error('[Education Save] Server response:', server);
    if (details) {
      // If Zod error array present, print a readable table
      try {
        console.table(details);
      } catch {
        console.error('[Education Save] details:', details);
      }
    }

    alert(
      `Save failed (${status ?? 'no status'}): ${server?.error || e?.message || 'Unknown error'}${
        details ? `\nDetails:\n${JSON.stringify(details, null, 2)}` : ''
      }`
    );
  } finally {
    console.groupEnd();
  }
};

  const reorder = async (id: string, dir: 'up' | 'down') => {
    const list = education.slice();
    const idx = list.findIndex((e) => e.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === list.length - 1)) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    try {
      await Promise.all(list.map((e, i) => updateEdu.mutateAsync({ id: e.id, education: { displayOrder: i } })));
      qc.setQueryData(['cv', 'all'], (prev: any) =>
        prev ? { ...prev, data: { ...prev.data, education: list.map((e, i) => ({ ...e, displayOrder: i })) } } : prev
      );
    } catch (e) {
      console.error('Failed to reorder education', e);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this education entry?')) return;
    try {
      await deleteEdu.mutateAsync(id);
      qc.setQueryData(['cv', 'all'], (prev: any) => prev ? {
        ...prev, data: { ...prev.data, education: (prev.data.education || []).filter((e: any) => e.id !== id) }
      } : prev);
    } catch (e) {
      console.error('Failed to delete education', e);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditing({
      data: {
        institutionName: '',
        degreeType: '',
        fieldOfStudy: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        grade: '',
        relevantCoursework: [],
        displayOrder: education.length,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-swiss-gray-900">Education</h2>
        <button type="button" onClick={startAdd} disabled={isAdding} className="inline-flex items-center px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50 disabled:opacity-50">
          <PlusIcon className="mr-1 h-4 w-4" /> Add Education
        </button>
      </div>

      {isAdding && editing && !editing.id && (
        <div className="bg-swiss-white border border-swiss-gray-200 p-4">
          <EducationForm data={editing.data} onChange={(d: any) => setEditing({ ...editing, data: d })} onSave={save} onCancel={() => { setEditing(null); setIsAdding(false); }} />
        </div>
      )}

      {education.map((edu: any, index: number) => (
        <div key={edu.id} className="bg-swiss-white border border-swiss-gray-200 p-4">
          {editing?.id === edu.id ? (
            <EducationForm data={editing.data} onChange={(d: any) => setEditing({ ...editing, data: d })} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium text-swiss-gray-900">{edu.degreeType} in {edu.fieldOfStudy}</h3>
                <p className="text-sm text-swiss-gray-500 mt-1">{edu.institutionName}, {edu.location}</p>
                <p className="text-sm text-swiss-gray-500">
                  {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? ` ${new Date(edu.endDate).toLocaleDateString()}` : ' Present'}
                </p>
                {edu.grade && <p className="text-sm text-swiss-gray-700 mt-2">Grade: {edu.grade}</p>}
                {!!edu.relevantCoursework?.length && (
                  <p className="mt-1 text-sm text-swiss-gray-600">Coursework: {edu.relevantCoursework.join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  type="button"
                  onClick={() => reorder(edu.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => reorder(edu.id, 'down')}
                  disabled={index === education.length - 1}
                  className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditing({ id: edu.id, data: { ...edu } })} className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700"><PencilIcon className="h-4 w-4" /></button>
                <button type="button" onClick={() => remove(edu.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationForm({ data, onChange, onSave, onCancel }: any) {
  const uid = useId();
  const [coursework, setCoursework] = useState('');

  const addCourse = () => {
    if (coursework.trim()) {
      onChange({ ...data, relevantCoursework: [...(data.relevantCoursework || []), coursework.trim()] });
      setCoursework('');
    }
  };
  const removeCourse = (i: number) => {
    const arr = [...(data.relevantCoursework || [])]; arr.splice(i, 1);
    onChange({ ...data, relevantCoursework: arr });
  };

  const requiredOk = useMemo(() => {
    return Boolean(String(data.institutionName || '').trim()) &&
           Boolean(String(data.degreeType || '').trim()) &&
           Boolean(String(data.fieldOfStudy || '').trim()) &&
           Boolean(String(data.location || '').trim()) &&
           Boolean(String(data.startDate || '').trim());
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="swiss-label" htmlFor={`${uid}-institution`}>Institution Name</label>
          <input id={`${uid}-institution`} name="institutionName" className="swiss-input" value={data.institutionName} onChange={(e) => onChange({ ...data, institutionName: e.target.value })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-degree`}>Degree Type</label>
          <select id={`${uid}-degree`} name="degreeType" className="swiss-input" value={data.degreeType} onChange={(e) => onChange({ ...data, degreeType: e.target.value })}>
            <option value="">Select degree type</option>
            <option value="Part 1">Part 1</option>
            <option value="Part 2">Part 2</option>
            <option value="Part 3">Part 3</option>
            <option value="BA Architecture">BA Architecture</option>
            <option value="MArch">MArch</option>
            <option value="BSc Architecture">BSc Architecture</option>
            <option value="MSc Architecture">MSc Architecture</option>
            <option value="Diploma">Diploma</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-field`}>Field of Study</label>
          <input id={`${uid}-field`} name="fieldOfStudy" className="swiss-input" value={data.fieldOfStudy} onChange={(e) => onChange({ ...data, fieldOfStudy: e.target.value })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-location`}>Location</label>
          <input id={`${uid}-location`} name="location" className="swiss-input" value={data.location} onChange={(e) => onChange({ ...data, location: e.target.value })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-start`}>Start Date</label>
          <input id={`${uid}-start`} name="startDate" type="date" className="swiss-input" value={data.startDate?.split('T')[0]} onChange={(e) => onChange({ ...data, startDate: e.target.value + 'T00:00:00Z' })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-end`}>End Date</label>
          <input id={`${uid}-end`} name="endDate" type="date" className="swiss-input" value={data.endDate?.split('T')[0] || ''} onChange={(e) => onChange({ ...data, endDate: e.target.value ? e.target.value + 'T00:00:00Z' : '' })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor={`${uid}-grade`}>Grade</label>
          <input id={`${uid}-grade`} name="grade" className="swiss-input" value={data.grade || ''} onChange={(e) => onChange({ ...data, grade: e.target.value })} placeholder="e.g., First Class Honours" />
        </div>
      </div>

      <div>
        <label className="swiss-label" htmlFor={`${uid}-cw-input`}>Relevant Coursework</label>
        <div className="space-y-2">
          {data.relevantCoursework?.map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm flex-1">{c}</span>
              <button type="button" onClick={() => removeCourse(i)} className="text-red-500 hover:text-red-700"><XMarkIcon className="h-4 w-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input id={`${uid}-cw-input`} name="courseworkInput" className="swiss-input flex-1" value={coursework} onChange={(e) => setCoursework(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCourse())} placeholder="Add relevant coursework" />
            <button type="button" onClick={addCourse} className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50">Add</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50">Cancel</button>
        <button type="button" onClick={onSave} disabled={!requiredOk} className={`px-3 py-1 text-sm ${!requiredOk ? 'bg-swiss-gray-200 text-swiss-gray-500 cursor-not-allowed' : 'bg-swiss-black text-swiss-white hover:bg-swiss-gray-800'}`}>Save</button>
      </div>
    </div>
  );
}
