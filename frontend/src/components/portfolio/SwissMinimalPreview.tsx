import React from 'react';
import type { RenderablePortfolio } from '../../types/renderable';
import { getAssetUrl } from '../../lib/api';

const shouldUseTwoPageSpread = (project: any): boolean => {
  const imageCount = (project.images?.length || 0) + (project.hero ? 1 : 0);
  const hasDetailedInfo = project.detailedDescription || project.designApproach || project.sustainabilityFeatures;
  const hasMultipleData = (project.projectValue != null) ||
                          (project.responsibilities && project.responsibilities.length > 2) ||
                          (project.ribaStages && project.ribaStages.length > 0);
  return imageCount > 3 || (hasDetailedInfo && hasMultipleData);
};

// Compact RIBA stages display (e.g., "Stage 4", "Stage 4 | Stage 7", "Stages 0-7", "Stages 0-4 | Stage 6 | Stages 8-9")
const formatRibaStagesDisplay = (stages?: Array<string | number> | null): string => {
  const nums = Array.isArray(stages)
    ? stages
        .map((s) => {
          if (s == null) return null;
          if (typeof s === 'number') return s;
          const m = String(s).match(/(\d+)/);
          return m ? Number(m[1]) : null;
        })
        .filter((n): n is number => Number.isFinite(n))
    : [];

  if (nums.length === 0) return '—';

  const uniqueSorted = Array.from(new Set(nums)).sort((a, b) => a - b);

  type Range = { start: number; end: number };
  const ranges: Range[] = [];
  let start = uniqueSorted[0];
  let prev = start;

  for (let i = 1; i < uniqueSorted.length; i++) {
    const cur = uniqueSorted[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      ranges.push({ start, end: prev });
      start = cur;
      prev = cur;
    }
  }
  ranges.push({ start, end: prev });

  const parts = ranges.map((r) => (r.start === r.end ? `Stage ${r.start}` : `Stages ${r.start}-${r.end}`));
  return parts.join(' | ');
};

export const SwissMinimalPreview: React.FC<{ data: RenderablePortfolio }> = ({ data }) => {
  const mm = (v: number) => `${v * 3.7795}px`;
  let currentPage = 1;

  // Dev: expose complete data model for inspection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PORTFOLIO__ = data;
      console.log('SwissMinimalPreview RenderablePortfolio', data);
    }
  }, [data]);

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
      {/* Cover - remains centered */}
      <div
        className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break swiss-page-flex"
        style={{ 
          width: mm(210), 
          height: mm(297), 
          padding: `${mm(m.top)} ${mm(m.right)} ${mm(m.bottom)} ${mm(m.left)}`
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center">
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

        // Hero page - using grid layout
        pages.push(
          <div
            key={`p-${i}-left`}
            className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break swiss-page-grid"
            style={{ 
              width: mm(210), 
              height: mm(297),
              padding: 0
            }}
          >
            {/* Hero section - flexible height */}
            <div className="swiss-hero-container">
              {project.hero?.path && (
                <img
                  src={url(project.hero.path)}
                  alt=""
                  className="swiss-hero-image"
                />
              )}
            </div>
            
            {/* Content section - auto-adjusting */}
            <div className="swiss-content-section">
              <div className="leading-tight">
                <div className="text-2xl font-bold">{project.name}</div>
                {project.practiceName && (
                  <div>
                    <span
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: 'var(--accent)' }}
                    >
                      {project.practiceName}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {[project.projectType, project.location, project.yearCompletion || project.yearStart ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              
              <div
                className="grid gap-4 items-stretch"
                style={{ gridTemplateColumns: 'auto auto' }}
              >
                <div className="h-full flex flex-col justify-end">
                  <div
                    className="swiss-meta-grid text-sm"
                    style={{ gridTemplateColumns: 'repeat(2, auto)', alignItems: 'start' }}
                  >
                <div>
                  <div className="swiss-meta-label">Role</div>
                  <div className="text-[12px] leading-5 text-gray-800 font-medium">{project.role || '—'}</div>
                </div>
                <div>
                  <div className="swiss-meta-label">Year</div>
                  <div className="text-[12px] leading-5 text-gray-800 font-medium">
                    {project.yearStart && project.yearCompletion
                      ? `${project.yearStart}-${project.yearCompletion}`
                      : project.yearCompletion || project.yearStart || '—'}
                  </div>
                </div>
                <div>
                  <div className="swiss-meta-label">RIBA Stages</div>
                  <div className="text-[12px] leading-5 text-gray-800 font-medium">{formatRibaStagesDisplay(project.ribaStages)}</div>
                </div>
                <div>
                  <div className="swiss-meta-label">Team Size</div>
                  <div className="text-[12px] leading-5 text-gray-800 font-medium">{project.teamSize ?? '—'}</div>
                </div>
              </div>
                </div>
                {!!project.responsibilities?.length && (
                  <div className="text-sm" style={{ borderColor: 'var(--accent)' }}>
                    <div className="swiss-meta-label">Responsibilities</div>
                    <ul className="list-none text-[12px] leading-5 text-gray-800 font-medium">
                      {project.responsibilities.map((resp: string, idx: number) => (
                        <li key={`${resp}-${idx}`}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-justify text-[13px] leading-5 text-gray-800 flex-1 overflow-auto">
                {project.briefDescription || project.detailedDescription || ''}
              </div>
            </div>
            
            <div className="swiss-page-number">
              {String(currentPage++).padStart(2, '0')}
            </div>
          </div>
        );

        // Detail page - using flexbox
        pages.push(
          <div
            key={`p-${i}-right`}
            className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break swiss-page-flex"
            style={{ 
              width: mm(210), 
              height: mm(297), 
              padding: `${mm(m.top)} ${mm(m.right)} ${mm(m.bottom)} ${mm(m.left)}`
            }}
          >
            {/* Top image strip - flexible gallery */}
            {!!project.images?.length && (
              <div className="swiss-image-strip mb-2">
                {project.images.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={url(img.path)}
                    className={idx === 0 ? 'swiss-image-strip-main' : 'swiss-image-strip-secondary'}
                  />
                ))}
              </div>
            )}

            {/* Detail grid - flexible content */}
            <div className="swiss-detail-grid">
              <div className="space-y-3">
                {!!project.responsibilities?.length && (
                  <div className="border-l-2" style={{ borderColor: 'var(--accent)' }}>
                    <div className="swiss-meta-label pl-3">Responsibilities</div>
                    <ul className="list-none text-[12px] leading-5 text-gray-800 font-medium pl-3">
                      {project.responsibilities.map((resp: string, idx: number) => (
                        <li key={`${resp}-${idx}`}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.designApproach && (
                  <div className="swiss-accent-border">
                    <div className="swiss-section-title">Design Approach</div>
                    <div className="text-[12px] leading-5 text-gray-800">{project.designApproach}</div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
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

            {/* Bottom technical image - flexible */}
            {project.images && project.images.length > 2 && (
              <div className="mt-auto bg-gray-50 border border-gray-200 flex items-center justify-center" 
                   style={{ minHeight: mm(60), maxHeight: mm(sizes.tech) }}>
                <img src={url(project.images[2].path)} className="object-contain h-full w-full" />
              </div>
            )}
            
            <div className="swiss-page-number">
              {String(currentPage++).padStart(2, '0')}
            </div>
          </div>
        );

        return two ? pages : [pages[1]];
      })}

      {/* CV Page - flexible layout */}
      {data.includeCV && data.cv && (
        <div
          className="relative bg-white shadow ring-1 ring-gray-200 print-page avoid-break swiss-page-flex"
          style={{ 
            width: mm(210), 
            height: mm(297), 
            padding: `${mm(m.top)} ${mm(m.right)} ${mm(m.bottom)} ${mm(m.left)}`
          }}
        >
          <div className="swiss-cv-container">
            <div className="swiss-cv-section">
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
              <div className="swiss-cv-section text-[12px] leading-5 text-gray-800">
                {data.cv.personalInfo.professionalSummary}
              </div>
            )}

            {/* Experience - scrollable if needed */}
            {data.cv.experiences?.length ? (
              <div className="swiss-cv-section">
                <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Experience</div>
                <div className="swiss-cv-entries">
                  {data.cv.experiences.map((e, idx) => (
                    <div key={idx} className="text-[11px] mb-1">
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

            {/* Education - scrollable if needed */}
            {data.cv.education?.length ? (
              <div className="swiss-cv-section">
                <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Education</div>
                <div className="swiss-cv-entries">
                  {data.cv.education.map((e, idx) => (
                    <div key={idx} className="text-[11px] mb-1">
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
              <div className="swiss-cv-section mt-auto">
                <div className="uppercase text-[10px] font-bold mb-1" style={{ color: colors.accent }}>Skills</div>
                <div className="text-[11px] text-gray-800">
                  {data.cv.skills.map((s) => s.skillName).join(' · ')}
                </div>
              </div>
            ) : null}
          </div>

          <div className="swiss-page-number">
            {String(currentPage++).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};