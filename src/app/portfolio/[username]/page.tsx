'use client';

import { PortfolioPreview } from '@/components/portfolio/PortfolioPreview';

export default function UserPortfolioPage() {
  // In a real implementation, this data would be fetched from the database
  const portfolioData = {
    title: 'John Doe\'s Portfolio',
    tagline: 'Full Stack Developer & UI/UX Designer',
    about: 'Passionate developer with 5+ years of experience building modern web applications. Specialized in React, Node.js, and cloud technologies. Love creating intuitive user experiences and solving complex problems.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker', 'UI/UX Design'],
    theme: 'dark',
    customDomain: 'john-doe.dev',
  };

  return (
    <div>
      <PortfolioPreview data={portfolioData} />
    </div>
  );
}