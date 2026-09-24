export interface RecentlyViewedJob {
  id: number;
  title: string;
  recruiterName: string;
  companyName?: string;
  location: string;
  jobType: string;
  salaryRange: string;
  viewedAt: string;
}

export function recordRecentlyViewedJob(job: any, userId?: number | string) {
  if (!job || !job.id || !userId) return;

  const storageKey = `candidate_recent_jobs_${userId}`;
  try {
    const existingJson = localStorage.getItem(storageKey);
    let list: RecentlyViewedJob[] = existingJson ? JSON.parse(existingJson) : [];

    // Remove existing entry if present to avoid duplicates
    list = list.filter(j => j.id !== job.id);

    // Insert as latest item at index 0
    const entry: RecentlyViewedJob = {
      id: job.id,
      title: job.title || 'Job Position',
      recruiterName: job.recruiterName || job.companyName || 'Company',
      companyName: job.companyName || job.recruiterName || 'Company',
      location: job.location || 'Location Not Specified',
      jobType: job.jobType || 'FullTime',
      salaryRange: job.salaryRange || 'Not Specified',
      viewedAt: new Date().toISOString()
    };

    list.unshift(entry);

    // Limit history to latest 10 items
    if (list.length > 10) {
      list = list.slice(0, 10);
    }

    localStorage.setItem(storageKey, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
  } catch (err) {
    console.error('Failed to record recently viewed job:', err);
  }
}

export function getRecentlyViewedJobs(userId?: number | string): RecentlyViewedJob[] {
  if (!userId) return [];
  const storageKey = `candidate_recent_jobs_${userId}`;
  try {
    const existingJson = localStorage.getItem(storageKey);
    return existingJson ? JSON.parse(existingJson) : [];
  } catch {
    return [];
  }
}
