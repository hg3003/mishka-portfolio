import React from 'react';
import type { RenderablePortfolio } from '../../../../shared/types/renderable';
import { getAssetUrl } from '../../lib/api';

// Same decision function as in PDF template
const shouldUseTwoPageSpread = (project: any): boolean => {
  const imageCount = (project.images?.length || 0) + (project.hero ? 1 : 0);
  const hasDetailedInfo = project.detailedDescription || project.designApproach || project.sustainabilityFeatures;
  const hasMultipleData = (project.projectValue != null) ||
                          (project.responsibilities && project.responsibilities.length > 2) ||
                          (project.ribaStages && project.ribaStages.length > 0);
  return imageCount > 3 || (hasDetailedInfo && hasMultipleData);
};

export const SwissMinimalPreview: React.FC<{ data: RenderablePortfolio }> = ({ data }) => {
  const mm = (v: number) => `${v * 3.7795}px`; // 1mm≈3.78px
  let currentPage = 1;

  const url = (p?: string | null) => (p ? getAssetUrl(p) : undefined);

  const sizes = {
    hero: data.settings?.heroHeightMm ?? 200,
    strip: data.settings?.stripHeightMm ?? 120,
    tech: data.settings?.techHeightMm ?? 120,
    thumb: data.settings?.thumbHeightMm ?? 40,
  };
  
  const m = (data as any).margins || { top: 15, bottom: 15, left: 15, right: 15 };
  const colors = data.colorScheme || { primary: '#000', secondary: '#666', accent: '#DC2626', text: '#000', light: '#F5F5F5' };

  return (
    <div className="space-y-6 swiss-print" style={{
      ['--accent' as any]: colors.accent,
      ['--text-color' as any]: colors.text,
      ['--secondary' as any]: colors.secondary,
      ['--primary' as any]: colors.primary,
      ['--light' as any]: colors.light,
    }}>
      {/* Cover */}
      <div
        className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break"
        style={{ width: mm(210), height: mm(297), paddingTop: mm(m.top), paddingBottom: mm(m.bottom), paddingLeft: mm(m.left), paddingRight: mm(m.right) }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-4xl swiss-cover-title tracking-tight">PORTFOLIO</div>
          <div className="text-lg swiss-cover-subtitle">{data.personalHeader || data.portfolioName}</div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center text-xs swiss-year">
          {new Date(data.createdAt).getFullYear()}
        </div>
        <div className="absolute left-0 right-0" style={{ bottom: mm(10) }}>
          <div className="swiss-accent-bar" />
        </div>
        <div className="swiss-page-number">
          {String(currentPage++).padStart(2, '0')}
        </div>
      </div>

      {/* Projects */}
      {data.projects.map((project, i) => {
        const two = shouldUseTwoPageSpread(project);
        const pages: React.ReactNode[] = [];

        // Left page
        pages.push(
          <div
            key={`p-${i}-left`}
            className="relative bg-white shadow ring-1 ring-gray-200 overflow-hidden print-page avoid-break"
            style={{ width: mm(210), height: mm(297), paddingTop: mm(m.top), paddingBottom: mm(m.bottom), paddingLeft: mm(m.left), paddingRight: mm(m.right) }}
          >
            {project.hero?.path && (
              <img
                src={url(project.hero.path)}
                alt=""
                className="absolute top-0 left-0 w-full object-cover"
                style={{ height: mm(sizes.hero) }}
              />
            )}
            <div className="absolute left-[15mm] right-[15mm]" style={{ bottom: mm(15) }}>
              <div className="text-2xl font-bold">{project.name}</div>
              <div className="text-xs text-gray-600 mb-1">
                {[project.projectType, project.location, project.yearCompletion || project.yearStart]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="swiss-meta-label">Year</div>
                  <div className="font-medium">
                    {project.yearStart && project.yearCompletion
                      ? `${project.yearStart}-${project.yearCompletion}`
                      : project.yearCompletion || project.yearStart || '—'}
                  </div>
                </div>
                <div>
                  <div className="swiss-meta-label">Role</div>
                  <div className="font-medium">{project.role || '—'}</div>
                </div>
                <div>
                  <div className="swiss-meta-label">Stages</div>
                  <div className="font-medium">{(project.ribaStages || []).join(', ') || '—'}</div>
                </div>
              </div>
              <div className="mt-2 text-justify text-[13px] leading-5 text-gray-800">
                {project.briefDescription || project.detailedDescription || ''}
              </div>
            </div>
            <div className="swiss-page-number">
              {String(currentPage++).padStart(2, '0')}
            </div>
          </div>
        );

        // Right page (or single)
        pages.push(
          <div
            key={`p-${i}-right`}
            className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break"
            style={{ width: mm(210), height: mm(297), paddingTop: mm(m.top), paddingBottom: mm(m.bottom), paddingLeft: mm(m.left), paddingRight: mm(m.right) }}
          >
            {/* Top image strip */}
            {!!project.images?.length && (
              <div className="flex gap-1 mb-2" style={{ height: mm(sizes.strip) }}>
                {project.images.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={url(img.path)}
                    className={idx === 0 ? 'flex-[2] object-cover h-full w-full' : 'flex-1 object-cover h-full w-full'}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3 space-y-3">
                {!!project.responsibilities?.length && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Responsibilities</div>
                    <div className="text-[12px] leading-5 text-gray-800">{project.responsibilities.join('. ')}</div>
                  </div>
                )}
                {project.designApproach && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Design Approach</div>
                    <div className="text-[12px] leading-5 text-gray-800">{project.designApproach}</div>
                  </div>
                )}
              </div>

              <div className="col-span-2 space-y-3">
                {(project.projectValue || project.projectSize || project.teamSize) && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Project Data</div>
                    <div className="text-[12px] whitespace-pre-line">
                      {project.projectValue ? `£${(project.projectValue / 1_000_000).toFixed(1)}M\n` : ''}
                      {project.projectSize ? `${project.projectSize.toLocaleString()}m²\n` : ''}
                      {project.teamSize ? `Team of ${project.teamSize}` : ''}
                    </div>
                  </div>
                )}
                {!!project.softwareUsed?.length && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Software</div>
                    <div className="text-[12px] whitespace-pre-line">{project.softwareUsed.join('\n')}</div>
                  </div>
                )}
                {project.sustainabilityFeatures && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Sustainability</div>
                    <div className="text-[12px] leading-5 text-gray-800">{project.sustainabilityFeatures}</div>
                  </div>
                )}
              </div>
            </div>

            {project.images && project.images.length > 2 && (
              <div className="mt-2 bg-gray-50 border border-gray-200 flex items-center justify-center" style={{ height: mm(sizes.tech) }}>
                <img src={url(project.images[2].path)} className="object-contain h-full w-full" />
              </div>
            )}
            <div className="swiss-page-number">
              {String(currentPage++).padStart(2, '0')}
            </div>
          </div>
        );

        // If “single page” case, only use the second page (right) if you prefer that structure.
        return two ? pages : [pages[1]];
      })}

      {/* CV Page (optional) */}
      {data.includeCV && data.cv && (
        <div
          className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break"
          style={{ width: mm(210), height: mm(297), paddingTop: mm(m.top), paddingBottom: mm(m.bottom), paddingLeft: mm(m.left), paddingRight: mm(m.right) }}
        >
          <div className="mb-2">
            <div className="text-xl font-bold" style={{ color: colors.accent }}>Curriculum Vitae</div>
            {data.cv.personalInfo && (
              <div className="mt-1 text-sm">
                <div className="font-semibold" style={{ color: colors.text }}>{data.cv.personalInfo.name || ''}</div>
                <div className="text-xs" style={{ color: colors.secondary }}>
                  {[data.cv.personalInfo.professionalTitle, data.cv.personalInfo.location].filter(Boolean).join(' · ')}
                </div>
                <div className="text-[10px]" style={{ color: colors.secondary }}>
                  {[data.cv.personalInfo.email, data.cv.personalInfo.phone, data.cv.personalInfo.websiteUrl, data.cv.personalInfo.linkedinUrl].filter(Boolean).join(' · ')}
                </div>
              </div>
            )}
          </div>

          {data.cv.personalInfo?.professionalSummary && (
            <div className="text-[12px] leading-5 text-gray-800 mb-2">
              {data.cv.personalInfo.professionalSummary}
            </div>
          )}

          {/* Experience */}
          {data.cv.experiences?.length ? (
            <div className="mb-2">
              <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Experience</div>
              <div className="space-y-1">
                {data.cv.experiences.map((e, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-medium" style={{ color: colors.text }}>{e.positionTitle} — {e.companyName}</div>
                    <div className="text-[10px]" style={{ color: colors.secondary }}>
                      {new Date(e.startDate).getFullYear()}-{e.endDate ? new Date(e.endDate).getFullYear() : 'Present'} · {e.location}
                    </div>
                    {e.description && (
                      <div className="text-[11px] text-gray-800">{e.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Education */}
          {data.cv.education?.length ? (
            <div className="mb-2">
              <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Education</div>
              <div className="space-y-1">
                {data.cv.education.map((e, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-medium" style={{ color: colors.text }}>{e.degreeType}, {e.institutionName}</div>
                    <div className="text-[10px]" style={{ color: colors.secondary }}>
                      {new Date(e.startDate).getFullYear()}-{e.endDate ? new Date(e.endDate).getFullYear() : ''} · {e.location}
                    </div>
                    {e.grade && (
                      <div className="text-[11px] text-gray-800">{e.grade}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Skills */}
          {data.cv.skills?.length ? (
            <div>
              <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Skills</div>
              <div className="text-[11px] text-gray-800">
                {data.cv.skills.map((s) => s.skillName).join(' · ')}
              </div>
            </div>
          ) : null}

          <div className="swiss-page-number">
            {String(currentPage++).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};