// frontend/src/components/cv/SkillsGrid.tsx
import { useQueryClient } from '@tanstack/react-query';
import { useCVData, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../../hooks/useApi';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function SkillsGrid() {
  const { data } = useCVData();
  const skills = data?.data?.skills || [];
  const qc = useQueryClient();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const [editing, setEditing] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const skillsByCat = skills.reduce((acc: any, s: any) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const commonSkills: Record<string, string[]> = {
    SOFTWARE: ['AutoCAD', 'Revit', 'Rhino', 'SketchUp', 'Photoshop', 'Illustrator', 'InDesign', 'Enscape', 'V-Ray', 'Lumion'],
    TECHNICAL: ['BIM', 'Construction Documentation', 'Building Regulations', 'RIBA Plan of Work', 'Site Analysis', 'Detailing'],
    DESIGN: ['Conceptual Design', 'Space Planning', 'Material Selection', 'Sustainable Design', '3D Modeling', 'Rendering'],
  };

  const quickAdd = async (skillName: string, category: string) => {
    if (skills.some((s: any) => s.skillName === skillName)) return;
    const res = await createSkill.mutateAsync({
      skillName, category, proficiencyLevel: 'INTERMEDIATE', yearsExperience: 1, displayOrder: skills.length,
    });
    qc.setQueryData(['cv', 'all'], (prev: any) => prev ? { ...prev, data: { ...prev.data, skills: [ ...(prev.data.skills || []), res.data ] } } : prev);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      const res = await updateSkill.mutateAsync({ id: editing.id, skill: editing.data });
      qc.setQueryData(['cv', 'all'], (prev: any) => prev ? {
        ...prev, data: { ...prev.data, skills: (prev.data.skills || []).map((s: any) => s.id === res.data.id ? res.data : s) }
      } : prev);
    } else {
      const res = await createSkill.mutateAsync(editing.data);
      qc.setQueryData(['cv', 'all'], (prev: any) => prev ? {
        ...prev, data: { ...prev.data, skills: [ ...(prev.data.skills || []), res.data ] }
      } : prev);
    }
    setEditing(null);
    setIsAdding(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await deleteSkill.mutateAsync(id);
    qc.setQueryData(['cv', 'all'], (prev: any) => prev ? { ...prev, data: { ...prev.data, skills: (prev.data.skills || []).filter((s: any) => s.id !== id) } } : prev);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-swiss-gray-900">Skills</h2>
        <button type="button" onClick={() => { setIsAdding(true); setEditing({ data: { category: 'SOFTWARE', skillName: '', proficiencyLevel: 'INTERMEDIATE', yearsExperience: 1, displayOrder: skills.length } }); }} disabled={isAdding} className="inline-flex items-center px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50 disabled:opacity-50">
          <PlusIcon className="mr-1 h-4 w-4" /> Add Skill
        </button>
      </div>

      <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-4">
        <h3 className="text-sm font-medium text-swiss-gray-700 mb-3">Quick Add Common Skills</h3>
        {Object.entries(commonSkills).map(([cat, arr]) => (
          <div key={cat} className="mb-3">
            <p className="text-xs text-swiss-gray-500 mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {arr.map((skill) => {
                const exists = skills.some((s: any) => s.skillName === skill);
                return (
                  <button key={skill} type="button" onClick={() => !exists && quickAdd(skill, cat)} disabled={exists} className={`px-2 py-1 text-xs border ${exists ? 'border-swiss-gray-200 bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed' : 'border-swiss-gray-300 bg-swiss-white text-swiss-gray-700 hover:bg-swiss-gray-50'}`}>
                    {skill}{exists && ' ✓'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isAdding && editing && !editing.id && (
        <div className="bg-swiss-white border border-swiss-gray-200 p-4">
          <SkillForm data={editing.data} onChange={(d: any) => setEditing({ ...editing, data: d })} onSave={save} onCancel={() => { setEditing(null); setIsAdding(false); }} />
        </div>
      )}

      {Object.entries(skillsByCat).map(([category, list]: any) => (
        <div key={category} className="bg-swiss-white border border-swiss-gray-200 p-4">
          <h3 className="text-base font-medium text-swiss-gray-900 mb-3">{category}</h3>
          <div className="space-y-2">
            {list.map((skill: any) =>
              editing?.id === skill.id ? (
                <SkillForm key={skill.id} data={editing.data} onChange={(d: any) => setEditing({ ...editing, data: d })} onSave={save} onCancel={() => setEditing(null)} />
              ) : (
                <div key={skill.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-swiss-gray-900">{skill.skillName}</span>
                    <span className="ml-3 text-xs text-swiss-gray-500">{skill.proficiencyLevel}</span>
                    {skill.yearsExperience != null && <span className="ml-3 text-xs text-swiss-gray-500">{skill.yearsExperience} yrs</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing({ id: skill.id, data: { ...skill } })} className="p-1 text-swiss-gray-500 hover:text-swiss-gray-700"><PencilIcon className="h-4 w-4" /></button>
                    <button type="button" onClick={() => remove(skill.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillForm({ data, onChange, onSave, onCancel }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="swiss-label" htmlFor="skill-name">Skill Name</label>
          <input id="skill-name" name="skillName" className="swiss-input" value={data.skillName} onChange={(e) => onChange({ ...data, skillName: e.target.value })} />
        </div>
        <div>
          <label className="swiss-label" htmlFor="skill-category">Category</label>
          <select id="skill-category" name="category" className="swiss-input" value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value })}>
            <option value="SOFTWARE">Software</option>
            <option value="TECHNICAL">Technical</option>
            <option value="DESIGN">Design</option>
            <option value="MANAGEMENT">Management</option>
            <option value="COMMUNICATION">Communication</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="swiss-label" htmlFor="skill-proficiency">Proficiency Level</label>
          <select id="skill-proficiency" name="proficiencyLevel" className="swiss-input" value={data.proficiencyLevel} onChange={(e) => onChange({ ...data, proficiencyLevel: e.target.value })}>
            <option value="BASIC">Basic</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
        <div>
          <label className="swiss-label" htmlFor="skill-years">Years of Experience</label>
          <input id="skill-years" name="yearsExperience" type="number" min={0} className="swiss-input" value={data.yearsExperience ?? ''} onChange={(e) => onChange({ ...data, yearsExperience: e.target.value === '' ? null : parseInt(e.target.value) })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 text-sm border border-swiss-gray-300 text-swiss-gray-700 bg-swiss-white hover:bg-swiss-gray-50">Cancel</button>
        <button type="button" onClick={onSave} className="px-3 py-1 text-sm bg-swiss-black text-swiss-white hover:bg-swiss-gray-800">Save</button>
      </div>
    </div>
  );
}
