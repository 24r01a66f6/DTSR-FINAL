import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  date: string;
  description: string[];
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: any[];
  skills: string[];
}

interface ResumeContextType {
  data: ResumeData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  // will add more updaters later
}

const defaultData: ResumeData = {
  personalInfo: {
    fullName: 'John Doe',
    jobTitle: 'Software Engineer',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  },
  experience: [
    {
      id: '1',
      title: 'Senior Frontend Dev',
      company: 'Tech Co',
      date: '2021 - Present',
      description: ['Developed robust React architecture.', 'Increased performance by 40%.']
    }
  ],
  education: [],
  skills: []
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ResumeData>(defaultData);

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info }
    }));
  };

  return (
    <ResumeContext.Provider value={{ data, updatePersonalInfo }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
