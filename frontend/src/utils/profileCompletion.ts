export interface ProfileSectionProgress {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  missingFields: string[];
}

export interface ProfileCompletionDetails {
  percentage: number;
  isComplete: boolean;
  statusMessage: string;
  missingFields: string[];
  completedSectionsCount: number;
  totalSectionsCount: number;
  sections: ProfileSectionProgress[];
}

export interface CandidateDataForCompletion {
  user?: {
    id?: number;
    userId?: number;
    fullName?: string;
    email?: string;
  } | null;
  profile?: {
    bio?: string;
    skills?: string | string[];
    experienceYears?: number;
    education?: string;
    resumePath?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  } | null;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
  } | null;
  applicationsCount?: number;
}

/**
 * Returns user-friendly status message based on profile completion percentage.
 */
export function getProfileStatusMessage(percentage: number): string {
  if (percentage >= 100) return '🎉 Profile Complete';
  if (percentage >= 90) return 'Just a few details left';
  if (percentage >= 70) return 'Almost there';
  if (percentage >= 40) return "You're making progress";
  return "Let's build your profile";
}

/**
 * Calculates the exact profile completion percentage (0-100%) and section breakdowns.
 * Single source of truth across CandidateDashboard, NavBar, and ProfileCompletionCard.
 */
export function calculateProfileCompletion(data: CandidateDataForCompletion): ProfileCompletionDetails {
  let score = 0;
  const missingFields: string[] = [];

  const userObj = data.user || null;
  const prof = data.profile || {};
  const pInfo = data.personalInfo || {};

  // Extract First Name & Last Name (with user.fullName fallback)
  const fullName = userObj?.fullName || '';
  const fullNameParts = fullName.trim().split(' ');
  const defaultFirstName = fullNameParts[0] || '';
  const defaultLastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : '';

  const firstName = (pInfo.firstName || prof.firstName || defaultFirstName).trim();
  const lastName = (pInfo.lastName || prof.lastName || defaultLastName).trim();
  const gender = (pInfo.gender || prof.gender || '').trim();
  const dateOfBirth = (pInfo.dateOfBirth || prof.dateOfBirth || '').trim();

  const phone = (pInfo.phone || pInfo.phoneNumber || prof.phoneNumber || prof.phone || '').trim();
  const address = (pInfo.address || prof.address || '').trim();
  const city = (pInfo.city || prof.city || '').trim();
  const country = (pInfo.country || prof.country || '').trim();

  const bio = (prof.bio || '').trim();
  const education = (prof.education || '').trim();
  const resumePath = (prof.resumePath || '').trim();
  const experienceYears = prof.experienceYears ?? 0;
  const appsCount = data.applicationsCount ?? 0;

  // 1. Basic Information (Max 20%)
  let basicScore = 0;
  const basicMissing: string[] = [];
  if (firstName) basicScore += 5; else basicMissing.push('First Name');
  if (lastName) basicScore += 5; else basicMissing.push('Last Name');
  if (gender) basicScore += 5; else basicMissing.push('Gender');
  if (dateOfBirth) basicScore += 5; else basicMissing.push('Date of Birth');
  score += basicScore;
  missingFields.push(...basicMissing);

  // 2. Contact & Location (Max 15%)
  let contactScore = 0;
  const contactMissing: string[] = [];
  if (phone) contactScore += 4; else contactMissing.push('Phone Number');
  if (address) contactScore += 4; else contactMissing.push('Street Address');
  if (city) contactScore += 3.5; else contactMissing.push('City');
  if (country) contactScore += 3.5; else contactMissing.push('Country');
  score += contactScore;
  missingFields.push(...contactMissing);

  // 3. Professional Profile (Max 45%: Bio 10%, Skills 20%, Education 15%)
  let profScore = 0;
  const profMissing: string[] = [];
  if (bio && bio !== 'No bio added yet.' && bio !== 'No bio provided yet.') {
    profScore += 10;
  } else {
    profMissing.push('Professional Bio');
  }

  let hasSkills = false;
  if (Array.isArray(prof.skills)) {
    hasSkills = prof.skills.length > 0;
  } else if (typeof prof.skills === 'string') {
    const trimmed = prof.skills.trim();
    hasSkills = trimmed.length > 0 && trimmed !== '[]';
  }
  if (hasSkills) profScore += 20; else profMissing.push('Technical Skills');

  if (education) profScore += 15; else profMissing.push('Education Details');
  score += profScore;
  missingFields.push(...profMissing);

  // 4. Resume & Documents (Max 10%)
  let resumeScore = 0;
  const resumeMissing: string[] = [];
  if (resumePath) resumeScore += 10; else resumeMissing.push('Resume Upload');
  score += resumeScore;
  missingFields.push(...resumeMissing);

  // 5. Experience / Applications (Max 10%)
  let expScore = 0;
  const expMissing: string[] = [];
  if (experienceYears > 0 || appsCount > 0) expScore += 10; else expMissing.push('Work Experience / Job Applications');
  score += expScore;
  missingFields.push(...expMissing);

  // Clamp overall percentage
  const percentage = Math.min(100, Math.max(0, Math.round(score)));
  const isComplete = percentage === 100;
  const statusMessage = getProfileStatusMessage(percentage);

  // Sections Breakdown
  const sections: ProfileSectionProgress[] = [
    {
      name: 'Basic Information',
      score: basicScore,
      maxScore: 20,
      percentage: Math.round((basicScore / 20) * 100),
      missingFields: basicMissing
    },
    {
      name: 'Contact & Location',
      score: contactScore,
      maxScore: 15,
      percentage: Math.round((contactScore / 15) * 100),
      missingFields: contactMissing
    },
    {
      name: 'Professional Profile',
      score: profScore,
      maxScore: 45,
      percentage: Math.round((profScore / 45) * 100),
      missingFields: profMissing
    },
    {
      name: 'Resume & Documents',
      score: resumeScore,
      maxScore: 10,
      percentage: Math.round((resumeScore / 10) * 100),
      missingFields: resumeMissing
    },
    {
      name: 'Work Experience',
      score: expScore,
      maxScore: 10,
      percentage: Math.round((expScore / 10) * 100),
      missingFields: expMissing
    }
  ];

  const totalSectionsCount = sections.length;
  const completedSectionsCount = sections.filter(s => s.percentage === 100).length;

  return {
    percentage,
    isComplete,
    statusMessage,
    missingFields,
    completedSectionsCount,
    totalSectionsCount,
    sections
  };
}

/**
 * Helper to compute completion using current stored user & profile backend data in localStorage.
 */
export function getStoredProfileCompletion(): ProfileCompletionDetails {
  try {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (!user) {
      return {
        percentage: 0,
        isComplete: false,
        statusMessage: "Let's build your profile",
        missingFields: ['User login required'],
        completedSectionsCount: 0,
        totalSectionsCount: 5,
        sections: []
      };
    }

    const uId = user.id || user.userId;
    const personalKey = `candidate_personal_info_${uId}`;
    const personalJson = localStorage.getItem(personalKey);
    const personalInfo = personalJson ? JSON.parse(personalJson) : null;

    const cachedProfileJson = localStorage.getItem(`cached_profile_${uId}`);
    const profile = cachedProfileJson ? JSON.parse(cachedProfileJson) : null;

    return calculateProfileCompletion({
      user,
      profile,
      personalInfo
    });
  } catch {
    return {
      percentage: 0,
      isComplete: false,
      statusMessage: "Let's build your profile",
      missingFields: [],
      completedSectionsCount: 0,
      totalSectionsCount: 5,
      sections: []
    };
  }
}
