'use client';
import { ChevronDown, Briefcase } from 'lucide-react';
import { useJobMatchStore } from '@/store/useJobMatchStore';
import { useEffect } from 'react';
import { ROLE_TEMPLATES } from '@/lib/roleTemplates';

export default function RoleSelector() {
  const { currentRole, setRole } = useJobMatchStore();

  useEffect(() => {
    if (!currentRole) {
      const role = ROLE_TEMPLATES[0];
      const tasks = role.skills.map(skill => ({ id: `SK_${skill.key}`, title: skill.label, status: 'TODO', weight: skill.weight, verified: false }));
      setRole({ id: role.id, name: role.name, description: role.description, masterSkills: role.skills.map(s => s.label) }, tasks);
    }
  }, [currentRole, setRole]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = ROLE_TEMPLATES.find(r => r.id === e.target.value);
    if (selected) {
      const tasks = selected.skills.map(skill => ({ id: `SK_${skill.key}`, title: skill.label, status: 'TODO', weight: skill.weight, verified: false }));
      setRole({ id: selected.id, name: selected.name, description: selected.description, masterSkills: selected.skills.map(s => s.label) }, tasks);
    }
  };

  return (
    <div className="card">
      <div className="section-title">
        <Briefcase size={20} style={{ color: 'var(--primary)' }} />
        <h3>Target Role</h3>
      </div>
      <p style={{ marginBottom: '1rem' }}>Select the engineering role you are preparing for.</p>
      
      <div className="select-wrapper">
        <select 
          className="select" 
          value={currentRole?.id || ''} 
          onChange={handleChange}
        >
          {ROLE_TEMPLATES.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        <ChevronDown size={18} className="select-icon" />
      </div>

      {currentRole && (
        <div className="master-skills">
          {currentRole.masterSkills.map(skill => (
             <span key={skill} className="skill-tag">{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}
