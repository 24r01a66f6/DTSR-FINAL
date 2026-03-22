/**
 * Builds a self-contained HTML string from ResumeData that Puppeteer
 * can render and print to PDF. Matches the ModernTemplate visual layout.
 */
function buildResumeHtml(data) {
  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const contactParts = [
    data.email,
    data.phone,
    data.location,
    data.linkedin,
    data.website,
  ].filter(Boolean).map(esc).join(' &nbsp;•&nbsp; ');

  const summarySection = data.summary ? `
    <section>
      <h2>Professional Summary</h2>
      <p>${esc(data.summary)}</p>
    </section>` : '';

  const expSection = (data.experience || []).filter(e => e.title || e.company).length > 0 ? `
    <section>
      <h2>Experience</h2>
      ${(data.experience || []).filter(e => e.title || e.company).map(e => `
        <div class="entry">
          <div class="row">
            <span class="entry-title">${esc(e.title)}</span>
            <span class="entry-date">${esc(e.date)}</span>
          </div>
          <div class="entry-company">${esc(e.company)}</div>
          <p class="entry-desc">${esc(e.description)}</p>
        </div>`).join('')}
    </section>` : '';

  const eduSection = (data.education || []).filter(e => e.institution || e.degree).length > 0 ? `
    <section>
      <h2>Education</h2>
      ${(data.education || []).filter(e => e.institution || e.degree).map(e => `
        <div class="entry">
          <div class="row">
            <span class="entry-title">${esc(e.degree)}</span>
            <span class="entry-date">${esc(e.date)}</span>
          </div>
          <div class="entry-company">${esc(e.institution)}${e.gpa ? ` &mdash; GPA: ${esc(e.gpa)}` : ''}</div>
        </div>`).join('')}
    </section>` : '';

  const skills = (data.skills || []).filter(s => s && s.trim());
  const skillsSection = skills.length > 0 ? `
    <section>
      <h2>Skills</h2>
      <div class="skills">
        ${skills.map(s => `<span class="skill">${esc(s)}</span>`).join('')}
      </div>
    </section>` : '';

  const hasCerts = (data.certifications || []).some(c => c.name);
  const certSection = hasCerts ? `
    <section>
      <h2>Certifications</h2>
      ${(data.certifications || []).filter(c => c.name).map(c => `
        <div class="entry">
          <div class="row">
            <span class="entry-title">${esc(c.name)}</span>
            <span class="entry-date">${[c.issuer, c.date].filter(Boolean).map(esc).join(' · ')}</span>
          </div>
        </div>`).join('')}
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11pt;
      color: #334155;
      background: white;
      padding: 36pt 48pt;
      max-width: 794px;
      margin: 0 auto;
    }
    header { text-align: center; padding-bottom: 18pt; border-bottom: 2px solid #e2e8f0; margin-bottom: 18pt; }
    header h1 { font-size: 26pt; font-weight: 800; color: #0f172a; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6pt; }
    header .contact { font-size: 9pt; color: #64748b; font-weight: 500; }
    section { margin-bottom: 16pt; }
    h2 { font-size: 8pt; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 0.12em;
      border-bottom: 1px solid #f1f5f9; padding-bottom: 3pt; margin-bottom: 8pt; }
    p { font-size: 10pt; line-height: 1.6; color: #334155; white-space: pre-wrap; }
    .entry { margin-bottom: 10pt; }
    .row { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-size: 10pt; font-weight: 700; color: #0f172a; }
    .entry-date { font-size: 8.5pt; color: #64748b; font-weight: 600; }
    .entry-company { font-size: 9pt; font-weight: 600; color: #4f46e5; margin: 2pt 0 4pt; }
    .entry-desc { font-size: 10pt; color: #334155; line-height: 1.55; white-space: pre-wrap; }
    .skills { display: flex; flex-wrap: wrap; gap: 5pt; }
    .skill { background: #eef2ff; color: #4338ca; font-size: 9pt; font-weight: 500;
      padding: 3pt 9pt; border-radius: 20pt; border: 1px solid #c7d2fe; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <header>
    <h1>${esc(data.name || 'Your Name')}</h1>
    <div class="contact">${contactParts}</div>
  </header>
  ${summarySection}
  ${expSection}
  ${eduSection}
  ${skillsSection}
  ${certSection}
</body>
</html>`;
}

/**
 * Builds a simple HTML page from free-form Konva LayoutBlocks.
 * Used by the Customize Builder's PDF download.
 */
function buildBlocksHtml(blocks) {
  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const A4_W = 794;
  const A4_H = 1123;

  const elements = blocks.map(b => {
    const isSectionLine = b.height <= 2;
    if (isSectionLine) {
      return `<div style="position:absolute;left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px;background:${esc(b.fill||'#e2e8f0')};"></div>`;
    }
    return `<div style="
      position:absolute;
      left:${b.x}px;
      top:${b.y}px;
      width:${b.width}px;
      min-height:${b.height}px;
      font-family:${esc(b.fontFamily||'Inter,Arial,sans-serif')};
      font-size:${b.fontSize||12}px;
      font-weight:${b.fontWeight||'normal'};
      color:${esc(b.fill||'#000')};
      text-align:${esc(b.align||'left')};
      white-space:pre-wrap;
      word-break:break-word;
      line-height:1.4;
    ">${esc(b.content)}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; font-family: 'Inter', Arial, sans-serif; }
    .page { position: relative; width: ${A4_W}px; min-height: ${A4_H}px; background: white; overflow: hidden; }
  </style>
</head>
<body>
  <div class="page">
    ${elements}
  </div>
</body>
</html>`;
}

module.exports = { buildResumeHtml, buildBlocksHtml };
