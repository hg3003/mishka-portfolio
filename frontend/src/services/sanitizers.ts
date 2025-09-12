import type { PersonalInfo, CVEducation, CVExperience } from './types';

// Personal Info sanitizer (omit empty optionals; validate url/email; no nulls)
export function sanitizePersonalInfoPayload(info: Partial<PersonalInfo>) {
  const allowed: (keyof PersonalInfo)[] = [
    'name',
    'professionalTitle',
    'arbNumber',
    'email',
    'phone',
    'location',
    'linkedinUrl',
    'websiteUrl',
    'professionalSummary',
    'careerObjectives',
  ];
  const payload: Partial<PersonalInfo> = {};

  const normalizeUrl = (value?: string | null) => {
    if (!value) return undefined;
    let s = String(value).trim();
    if (!s) return undefined;
    if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
    try {
      new URL(s);
      return s;
    } catch {
      return undefined;
    }
  };

  const isNonEmpty = (v: unknown) =>
    typeof v === 'string' ? v.trim().length > 0 : v !== undefined && v !== null;

  for (const key of allowed) {
    // @ts-expect-error index access on Partial
    let val = info[key];
    if (val === undefined) continue;

    if (typeof val === 'string') val = val.trim();

    if (key === 'linkedinUrl' || key === 'websiteUrl') {
      const normalized = normalizeUrl(val as string);
      if (normalized) payload[key] = normalized as any;
      continue;
    }

    if (key === 'email') {
      const s = String(val || '');
      if (s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
        payload.email = s as any;
      }
      continue;
    }

    // Optional strings: include only if non-empty
    if (key === 'arbNumber' || key === 'phone' || key === 'professionalSummary' || key === 'careerObjectives') {
      if (isNonEmpty(val)) payload[key] = val as any;
      continue;
    }

    // Likely required strings server-side
    if (key === 'name' || key === 'professionalTitle' || key === 'location') {
      if (isNonEmpty(val)) payload[key] = val as any;
      continue;
    }
  }

  return payload;
}

// Education sanitizer (omit empty optionals; normalize dates)
export function sanitizeEducationPayload(edu: Partial<CVEducation>) {
  const allowed: (keyof CVEducation)[] = [
    'institutionName',
    'degreeType',
    'fieldOfStudy',
    'location',
    'startDate',
    'endDate',
    'grade',
    'relevantCoursework',
    'displayOrder',
  ];
  const payload: Partial<CVEducation> = {};

  const trim = (v?: string | null) => (typeof v === 'string' ? v.trim() : v ?? undefined);
  const dateOnly = (v?: string) => {
    const s = trim(v);
    if (!s) return undefined;
    return s.includes('T') ? s.split('T')[0] : s;
  };

  for (const key of allowed) {
    // @ts-expect-error index access
    let val = edu[key];
    if (val === undefined) continue;

    if (typeof val === 'string') val = val.trim();

    if (key === 'startDate') {
      const d = dateOnly(val as string);
      if (d) payload.startDate = d as any;
      continue;
    }
    if (key === 'endDate') {
      const d = dateOnly(val as string);
      if (d) payload.endDate = d as any;
      continue;
    }
    if (key === 'grade') {
      if (val) payload.grade = val as any;
      continue;
    }
    if (key === 'relevantCoursework') {
      const arr = Array.isArray(val) ? val.map((x: any) => String(x).trim()).filter(Boolean) : [];
      if (arr.length) payload.relevantCoursework = arr as any;
      continue;
    }
    if (val !== '' && val !== null) {
      // @ts-expect-error index assignment
      payload[key] = val as any;
    }
  }
  return payload;
}

// Experience sanitizer (omit empty optionals; normalize dates; arrays -> trimmed)
export function sanitizeExperiencePayload(exp: Partial<CVExperience>) {
  const allowed: (keyof CVExperience)[] = [
    'companyName',
    'positionTitle',
    'location',
    'startDate',
    'endDate',
    'isCurrent',
    'description',
    'keyProjects',
    'keyAchievements',
    'displayOrder',
  ];
  const payload: Partial<CVExperience> = {};

  const trim = (v?: string | null) => (typeof v === 'string' ? v.trim() : v ?? undefined);
  const dateOnly = (v?: string) => {
    const s = trim(v);
    if (!s) return undefined;
    return s.includes('T') ? s.split('T')[0] : s;
  };

  for (const key of allowed) {
    // @ts-expect-error index access
    let val = exp[key];
    if (val === undefined) continue;

    if (typeof val === 'string') val = val.trim();

    if (key === 'startDate') {
      const d = dateOnly(val as string);
      if (d) payload.startDate = d as any;
      continue;
    }
    if (key === 'endDate') {
      const d = dateOnly(val as string);
      if (d) payload.endDate = d as any;
      continue;
    }
    if (key === 'keyProjects' || key === 'keyAchievements') {
      const arr = Array.isArray(val) ? val.map((x: any) => String(x).trim()).filter(Boolean) : [];
      if (arr.length) payload[key] = arr as any;
      continue;
    }
    if (key === 'isCurrent') {
      payload.isCurrent = Boolean(val) as any;
      continue;
    }
    if (key === 'description' || key === 'companyName' || key === 'positionTitle' || key === 'location') {
      if (val !== '') payload[key] = val as any;
      continue;
    }
    if (key === 'displayOrder') {
      if (typeof val === 'number') payload.displayOrder = val as any;
      continue;
    }
  }
  return payload;
}