import { MedicationAdministration, MedicationAdherence, MedicationCourse } from './domain';

export class MedicationAdherenceEngine {
  public calculateAdherence(course: MedicationCourse, administrations: MedicationAdministration[]): MedicationAdherence {
    const sorted = [...administrations].sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    
    let missedDoses = 0;
    let consecutiveMissed = 0;
    let maxConsecutive = 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAdmins = sorted.filter(a => a.scheduledTime >= thirtyDaysAgo);

    recentAdmins.forEach(admin => {
      if (admin.status === 'missed') {
        missedDoses++;
        consecutiveMissed++;
        if (consecutiveMissed > maxConsecutive) maxConsecutive = consecutiveMissed;
      } else if (admin.status === 'taken' || admin.status === 'delayed') {
        consecutiveMissed = 0;
      }
    });

    const totalRecent = recentAdmins.length;
    const score = totalRecent === 0 ? 100 : Math.max(0, 100 - (missedDoses / totalRecent) * 100);

    return {
      courseId: course.id,
      overallScore: score,
      missedDoses30Days: missedDoses,
      consecutiveMissedDoses: maxConsecutive,
      trend: score >= 80 ? 'stable' : 'declining'
    };
  }
}
