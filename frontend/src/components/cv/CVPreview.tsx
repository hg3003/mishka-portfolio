import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface CVPreviewProps {
  cv: any;
}

export default function CVPreview({ cv }: CVPreviewProps) {
  if (!cv) {
    return (
      <div className="bg-swiss-white border border-swiss-gray-200 p-6">
        <p className="text-sm text-swiss-gray-500 text-center">No CV data available</p>
      </div>
    );
  }

  const { personalInfo, experiences, education, skills } = cv;

  // Group skills by category
  const skillsByCategory = (skills || []).reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    SOFTWARE: 'Software',
    TECHNICAL: 'Technical',
    DESIGN: 'Design',
    MANAGEMENT: 'Management',
    COMMUNICATION: 'Communication',
    OTHER: 'Other'
  };

  const proficiencyWidth: Record<string, string> = {
    BASIC: 'w-1/4',
    INTERMEDIATE: 'w-2/4',
    ADVANCED: 'w-3/4',
    EXPERT: 'w-full'
  };

  return (
    <div className="bg-swiss-white border border-swiss-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-swiss-black text-swiss-white p-6">
        <h2 className="text-lg font-bold mb-2">CV Preview</h2>
        <p className="text-xs opacity-80">This is how your CV will appear in portfolios</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Personal Info Section */}
        {personalInfo && (
          <div className="border-b border-swiss-gray-200 pb-6">
            <h3 className="text-2xl font-bold text-swiss-gray-900">
              {personalInfo.name || 'Your Name'}
            </h3>
            <p className="text-sm text-swiss-gray-600 mt-1">
              {personalInfo.professionalTitle || 'Professional Title'}
              {personalInfo.arbNumber && (
                <span className="ml-2">• ARB: {personalInfo.arbNumber}</span>
              )}
            </p>
            
            <div className="mt-4 space-y-1">
              {personalInfo.email && (
                <div className="flex items-center text-xs text-swiss-gray-600">
                  <EnvelopeIcon className="h-3 w-3 mr-2" />
                  {personalInfo.email}
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center text-xs text-swiss-gray-600">
                  <PhoneIcon className="h-3 w-3 mr-2" />
                  {personalInfo.phone}
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center text-xs text-swiss-gray-600">
                  <MapPinIcon className="h-3 w-3 mr-2" />
                  {personalInfo.location}
                </div>
              )}
              {(personalInfo.linkedinUrl || personalInfo.websiteUrl) && (
                <div className="flex items-center text-xs text-swiss-gray-600">
                  <GlobeAltIcon className="h-3 w-3 mr-2" />
                  <div className="flex gap-2">
                    {personalInfo.linkedinUrl && (
                      <span className="text-blue-600">LinkedIn</span>
                    )}
                    {personalInfo.websiteUrl && (
                      <span className="text-blue-600">Website</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {personalInfo.professionalSummary && (
              <div className="mt-4">
                <p className="text-xs text-swiss-gray-700 leading-relaxed">
                  {personalInfo.professionalSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <div className="border-b border-swiss-gray-200 pb-6">
            <div className="flex items-center mb-3">
              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-swiss-gray-600" />
              <h4 className="text-sm font-bold text-swiss-gray-900 uppercase tracking-wider">
                Experience
              </h4>
            </div>
            <div className="space-y-3">
              {experiences
                .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                .slice(0, 3) // Show only first 3 in preview
                .map((exp: any) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-swiss-gray-900">
                        {exp.positionTitle}
                      </p>
                      <p className="text-swiss-gray-600">
                        {exp.companyName}, {exp.location}
                      </p>
                    </div>
                    <p className="text-swiss-gray-500 text-right whitespace-nowrap">
                      {new Date(exp.startDate).getFullYear()} - 
                      {exp.isCurrent ? ' Present' : exp.endDate ? ` ${new Date(exp.endDate).getFullYear()}` : ' Present'}
                    </p>
                  </div>
                  <p className="mt-1 text-swiss-gray-600 line-clamp-2">
                    {exp.description}
                  </p>
                  {exp.keyProjects && exp.keyProjects.length > 0 && (
                    <div className="mt-1">
                      <span className="text-swiss-gray-500">Key Projects: </span>
                      <span className="text-swiss-gray-600">
                        {exp.keyProjects.slice(0, 2).join(', ')}
                        {exp.keyProjects.length > 2 && ` +${exp.keyProjects.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {experiences.length > 3 && (
                <p className="text-xs text-swiss-gray-500 italic">
                  +{experiences.length - 3} more positions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="border-b border-swiss-gray-200 pb-6">
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-4 w-4 mr-2 text-swiss-gray-600" />
              <h4 className="text-sm font-bold text-swiss-gray-900 uppercase tracking-wider">
                Education
              </h4>
            </div>
            <div className="space-y-2">
              {education
                .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                .map((edu: any) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-swiss-gray-900">
                        {edu.degreeType} in {edu.fieldOfStudy}
                      </p>
                      <p className="text-swiss-gray-600">
                        {edu.institutionName}, {edu.location}
                      </p>
                      {edu.grade && (
                        <p className="text-swiss-gray-500 mt-0.5">
                          Grade: {edu.grade}
                        </p>
                      )}
                    </div>
                    <p className="text-swiss-gray-500 text-right whitespace-nowrap">
                      {new Date(edu.startDate).getFullYear()} - 
                      {edu.endDate ? ` ${new Date(edu.endDate).getFullYear()}` : ' Present'}
                    </p>
                  </div>
                  {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                    <p className="mt-1 text-swiss-gray-500">
                      Coursework: {edu.relevantCoursework.slice(0, 3).join(', ')}
                      {edu.relevantCoursework.length > 3 && '...'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <SparklesIcon className="h-4 w-4 mr-2 text-swiss-gray-600" />
              <h4 className="text-sm font-bold text-swiss-gray-900 uppercase tracking-wider">
                Skills
              </h4>
            </div>
            <div className="space-y-3">
              {Object.entries(skillsByCategory).map(([category, categorySkills]: [string, any]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-swiss-gray-700 mb-1">
                    {categoryLabels[category] || category}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {categorySkills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center text-xs">
                        <span className="text-swiss-gray-600 flex-1">
                          {skill.skillName}
                        </span>
                        <div className="w-16 bg-swiss-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-swiss-black ${proficiencyWidth[skill.proficiencyLevel]}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State Messages */}
        {!personalInfo && !experiences?.length && !education?.length && !skills?.length && (
          <div className="text-center py-8">
            <p className="text-sm text-swiss-gray-500">
              Start by adding your personal information
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-swiss-gray-50 px-6 py-3 border-t border-swiss-gray-200">
        <p className="text-xs text-swiss-gray-500 text-center">
          This preview shows how your CV will appear in PDF portfolios
        </p>
      </div>
    </div>
  );
}