/**
 * Utility to calculate a completeness and quality score for a resume.
 * Score is out of 100.
 */
function calculateResumeScore(resumeData) {
  let score = 0;
  const weights = {
    personalInfo: 15,
    summary: 15,
    experience: 30,
    education: 15,
    skills: 15,
    certifications: 10
  };

  // 1. Personal Info (15 pts)
  if (resumeData.name) score += 5;
  if (resumeData.email) score += 5;
  if (resumeData.phone || resumeData.location) score += 5;

  // 2. Summary (15 pts)
  if (resumeData.summary) {
    const wordCount = resumeData.summary.split(/\s+/).length;
    if (wordCount > 30) score += 15;
    else if (wordCount > 10) score += 10;
    else score += 5;
  }

  // 3. Experience (30 pts)
  if (resumeData.experience && resumeData.experience.length > 0) {
    score += 10; // Base points for having experience
    
    const hasDescriptions = resumeData.experience.every(exp => exp.description && exp.description.length > 20);
    if (hasDescriptions) score += 10;
    
    const count = resumeData.experience.length;
    if (count >= 2) score += 10;
    else if (count === 1) score += 5;
  }

  // 4. Education (15 pts)
  if (resumeData.education && resumeData.education.length > 0) {
    score += 10;
    if (resumeData.education[0].degree && resumeData.education[0].institution) score += 5;
  }

  // 5. Skills (15 pts)
  if (resumeData.skills && resumeData.skills.length > 0) {
    const validSkills = resumeData.skills.filter(s => s.trim().length > 0);
    if (validSkills.length >= 5) score += 15;
    else if (validSkills.length >= 3) score += 10;
    else if (validSkills.length >= 1) score += 5;
  }

  // 6. Certifications (10 pts)
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    const validCerts = resumeData.certifications.filter(c => c.name && c.issuer);
    if (validCerts.length >= 1) score += 10;
  }

  return Math.min(score, 100);
}

module.exports = { calculateResumeScore };
