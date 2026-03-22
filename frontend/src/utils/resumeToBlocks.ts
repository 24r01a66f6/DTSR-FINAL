import { ResumeData } from '../templates/ModernTemplate';
import { LayoutBlock } from '../types/layout';

// These constants must match ModernTemplate's A4 dimensions and padding
const A4_WIDTH = 794;
const PAD = 48; // px-12 = 48px
const CONTENT_W = A4_WIDTH - PAD * 2; // 698px

let _id = 0;
const id = (prefix: string) => `${prefix}-${++_id}-${Date.now()}`;

/**
 * Converts structured ResumeData into positional LayoutBlocks
 * that visually match the ModernTemplate HTML layout.
 */
export function resumeDataToBlocks(data: ResumeData): LayoutBlock[] {
  _id = 0;
  const blocks: LayoutBlock[] = [];
  let y = 40; // py-10

  // ── Name (centered, large, uppercase) ──────────────────────────
  blocks.push({
    id: id('name'),
    type: 'header',
    x: 0,
    y,
    width: A4_WIDTH,
    height: 48,
    content: data.name || 'Your Full Name',
    fontSize: 30,
    fontWeight: 'bold',
    fill: '#0f172a',
    align: 'center',
  });
  y += 50;

  // ── Contact line (centered) ──────────────────────────────────────
  const contactParts = [
    data.email || 'email@example.com',
    data.phone && `• ${data.phone}`,
    data.location && `• ${data.location}`,
    data.linkedin && `• ${data.linkedin}`,
    data.website && `• ${data.website}`,
  ].filter(Boolean) as string[];

  blocks.push({
    id: id('contact'),
    type: 'text',
    x: 0,
    y,
    width: A4_WIDTH,
    height: 22,
    content: contactParts.join(' '),
    fontSize: 11,
    fontWeight: 'normal',
    fill: '#64748b',
    align: 'center',
  });
  y += 24;

  // ── Divider line ─────────────────────────────────────────────────
  blocks.push({
    id: id('divider-header'),
    type: 'header',
    x: PAD,
    y,
    width: CONTENT_W,
    height: 2,
    content: '',
    fill: '#e2e8f0',
    fontSize: 1,
  });
  y += 18;

  // ── PROFESSIONAL SUMMARY ─────────────────────────────────────────
  if (data.summary) {
    blocks.push({
      id: id('summary-title'),
      type: 'header',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 18,
      content: 'PROFESSIONAL SUMMARY',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#4338ca',
      align: 'left',
    });
    y += 20;

    // Summary underline
    blocks.push({ id: id('summary-divider'), type: 'header', x: PAD, y, width: CONTENT_W, height: 1, content: '', fill: '#f1f5f9', fontSize: 1 });
    y += 6;

    blocks.push({
      id: id('summary-body'),
      type: 'text',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 60,
      content: data.summary,
      fontSize: 11,
      fontWeight: 'normal',
      fill: '#334155',
    });
    y += 70;
  }

  // ── EXPERIENCE ───────────────────────────────────────────────────
  const hasExp = data.experience?.some(e => e.title || e.company);
  if (hasExp) {
    blocks.push({
      id: id('exp-title'),
      type: 'header',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 18,
      content: 'EXPERIENCE',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#4338ca',
    });
    y += 20;
    blocks.push({ id: id('exp-div'), type: 'header', x: PAD, y, width: CONTENT_W, height: 1, content: '', fill: '#f1f5f9', fontSize: 1 });
    y += 8;

    data.experience.filter(e => e.title || e.company).forEach((exp) => {
      // Job title + date on same row
      blocks.push({
        id: id('exp-job'),
        type: 'header',
        x: PAD,
        y,
        width: CONTENT_W - 120,
        height: 18,
        content: exp.title,
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#0f172a',
      });
      blocks.push({
        id: id('exp-date'),
        type: 'text',
        x: PAD + CONTENT_W - 120,
        y,
        width: 120,
        height: 18,
        content: exp.date,
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#64748b',
        align: 'right',
      });
      y += 20;

      // Company name
      blocks.push({
        id: id('exp-company'),
        type: 'text',
        x: PAD,
        y,
        width: CONTENT_W,
        height: 16,
        content: exp.company,
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#4f46e5',
      });
      y += 18;

      // Description
      if (exp.description) {
        const lines = Math.ceil(exp.description.length / 90) + 1;
        const descH = Math.max(40, lines * 14);
        blocks.push({
          id: id('exp-desc'),
          type: 'text',
          x: PAD,
          y,
          width: CONTENT_W,
          height: descH,
          content: exp.description,
          fontSize: 11,
          fontWeight: 'normal',
          fill: '#334155',
        });
        y += descH + 10;
      }
    });
    y += 4;
  }

  // ── EDUCATION ────────────────────────────────────────────────────
  const hasEdu = data.education?.some(e => e.institution || e.degree);
  if (hasEdu) {
    blocks.push({
      id: id('edu-title'),
      type: 'header',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 18,
      content: 'EDUCATION',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#4338ca',
    });
    y += 20;
    blocks.push({ id: id('edu-div'), type: 'header', x: PAD, y, width: CONTENT_W, height: 1, content: '', fill: '#f1f5f9', fontSize: 1 });
    y += 8;

    data.education.filter(e => e.institution || e.degree).forEach((edu) => {
      blocks.push({
        id: id('edu-degree'),
        type: 'header',
        x: PAD,
        y,
        width: CONTENT_W - 100,
        height: 18,
        content: edu.degree,
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#0f172a',
      });
      blocks.push({
        id: id('edu-date'),
        type: 'text',
        x: PAD + CONTENT_W - 100,
        y,
        width: 100,
        height: 18,
        content: edu.date,
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#64748b',
        align: 'right',
      });
      y += 20;

      const instText = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  —  ');
      blocks.push({
        id: id('edu-inst'),
        type: 'text',
        x: PAD,
        y,
        width: CONTENT_W,
        height: 16,
        content: instText,
        fontSize: 10,
        fontWeight: 'normal',
        fill: '#4f46e5',
      });
      y += 24;
    });
    y += 4;
  }

  // ── SKILLS ───────────────────────────────────────────────────────
  const skills = data.skills?.filter(s => s.trim());
  if (skills && skills.length > 0) {
    blocks.push({
      id: id('skills-title'),
      type: 'header',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 18,
      content: 'SKILLS',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#4338ca',
    });
    y += 20;
    blocks.push({ id: id('skills-div'), type: 'header', x: PAD, y, width: CONTENT_W, height: 1, content: '', fill: '#f1f5f9', fontSize: 1 });
    y += 8;

    blocks.push({
      id: id('skills-body'),
      type: 'text',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 24,
      content: skills.join('  •  '),
      fontSize: 11,
      fontWeight: 'normal',
      fill: '#334155',
    });
    y += 34;
  }

  // ── CERTIFICATIONS ───────────────────────────────────────────────
  const hasCerts = data.certifications?.some(c => c.name);
  if (hasCerts) {
    blocks.push({
      id: id('cert-title'),
      type: 'header',
      x: PAD,
      y,
      width: CONTENT_W,
      height: 18,
      content: 'CERTIFICATIONS',
      fontSize: 10,
      fontWeight: 'bold',
      fill: '#4338ca',
    });
    y += 20;
    blocks.push({ id: id('cert-div'), type: 'header', x: PAD, y, width: CONTENT_W, height: 1, content: '', fill: '#f1f5f9', fontSize: 1 });
    y += 8;

    data.certifications!.filter(c => c.name).forEach((cert) => {
      blocks.push({
        id: id('cert-name'),
        type: 'header',
        x: PAD,
        y,
        width: CONTENT_W - 160,
        height: 18,
        content: cert.name,
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#0f172a',
      });
      blocks.push({
        id: id('cert-meta'),
        type: 'text',
        x: PAD + CONTENT_W - 160,
        y,
        width: 160,
        height: 18,
        content: [cert.issuer, cert.date].filter(Boolean).join(' · '),
        fontSize: 10,
        fontWeight: 'normal',
        fill: '#64748b',
        align: 'right',
      });
      y += 24;
    });
  }

  return blocks;
}

/**
 * Reverse conversion: Tries to reconstruct structured ResumeData
 * from flattened LayoutBlocks. Essential for bidirectional sync.
 */
export function blocksToResumeData(blocks: LayoutBlock[]): ResumeData {
  const data: ResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  };

  blocks.forEach(block => {
    const content = block.content.trim();
    if (!content && block.type !== 'header') return;

    if (block.id.startsWith('name')) {
      data.name = content;
    } else if (block.id.startsWith('contact')) {
      // Very rough parsing of contact line
      const parts = content.split('•').map(p => p.trim());
      if (parts[0]) data.email = parts[0];
      if (parts[1]) data.phone = parts[1];
      if (parts[2]) data.location = parts[2];
    } else if (block.id.startsWith('summary-body')) {
      data.summary = content;
    } else if (block.id.startsWith('exp-job')) {
      data.experience.push({ title: content, company: '', date: '', description: '' });
    } else if (block.id.startsWith('exp-company')) {
      if (data.experience.length > 0) data.experience[data.experience.length - 1].company = content;
    } else if (block.id.startsWith('exp-date')) {
      if (data.experience.length > 0) data.experience[data.experience.length - 1].date = content;
    } else if (block.id.startsWith('exp-desc')) {
      if (data.experience.length > 0) data.experience[data.experience.length - 1].description = content;
    } else if (block.id.startsWith('edu-degree')) {
      data.education.push({ degree: content, institution: '', date: '', gpa: '' });
    } else if (block.id.startsWith('edu-date')) {
      if (data.education.length > 0) data.education[data.education.length - 1].date = content;
    } else if (block.id.startsWith('edu-inst')) {
      if (data.education.length > 0) {
        const parts = content.split('—').map(p => p.trim());
        data.education[data.education.length - 1].institution = parts[0];
        if (parts[1]) data.education[data.education.length - 1].gpa = parts[1].replace('GPA:', '').trim();
      }
    } else if (block.id.startsWith('skills-body')) {
      data.skills = content.split('•').map(s => s.trim()).filter(Boolean);
    } else if (block.id.startsWith('cert-name')) {
      data.certifications!.push({ name: content, issuer: '', date: '' });
    } else if (block.id.startsWith('cert-meta')) {
      if (data.certifications!.length > 0) {
        const parts = content.split('·').map(p => p.trim());
        data.certifications![data.certifications!.length - 1].issuer = parts[0];
        if (parts[1]) data.certifications![data.certifications!.length - 1].date = parts[1];
      }
    }
  });

  return data;
}

