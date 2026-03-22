import { ModernTemplate, ResumeData } from '../templates/ModernTemplate';
import { MinimalistTemplate } from '../templates/MinimalistTemplate';
import { CreativeTemplate } from '../templates/CreativeTemplate';

/**
 * A public, bare page specifically for Puppeteer PDF generation.
 * Reads base64-encoded resumeData from the URL query parameter ?d=<base64>.
 * Renders the real ModernTemplate so the PDF is pixel-perfect.
 */
export default function ResumePrint() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('t');

  let data: ResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d');
    if (encoded) {
      data = JSON.parse(atob(encoded)) as ResumeData;
    }
  } catch {
    // render with defaults on parse error
  }

  return (
    <div style={{ background: 'white', margin: 0, padding: 0 }}>
      {templateId === 'minimalist' ? (
        <MinimalistTemplate data={data} />
      ) : templateId === 'creative' ? (
        <CreativeTemplate data={data} />
      ) : (
        <ModernTemplate data={data} />
      )}
    </div>
  );
}
