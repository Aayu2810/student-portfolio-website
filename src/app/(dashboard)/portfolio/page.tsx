'use client';

import { useState, useEffect } from 'react';
import { PortfolioEditor } from '@/components/portfolio/PortfolioEditor';
import { PortfolioPreview } from '@/components/portfolio/PortfolioPreview';
import { Button } from '@/components/ui/button';

interface PortfolioData {
  title: string;
  tagline: string;
  about: string;
  skills: string[];
  theme: string;
  customDomain?: string;
}

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    title: 'My Professional Portfolio',
    tagline: 'Software Developer & Designer',
    about: 'Welcome to my portfolio. I am a passionate developer with expertise in creating modern web applications. With years of experience in frontend and backend development, I strive to build products that are not only functional but also provide exceptional user experiences.',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'GraphQL'],
    theme: 'modern',
    customDomain: '',
  });
  
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const handleSave = (data: PortfolioData) => {
    setPortfolioData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Portfolio Builder</h1>
              <p className="text-gray-400">Create your professional portfolio</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'editor' ? 'default' : 'outline'}
                onClick={() => setActiveTab('editor')}
                className={activeTab === 'editor' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-white hover:bg-gray-800'}
              >
                Editor
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('preview')}
                className={activeTab === 'preview' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-700 text-white hover:bg-gray-800'}
              >
                Preview
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden">
          {activeTab === 'editor' ? (
            <div className="p-6">
              <PortfolioEditor 
                initialData={portfolioData} 
                onSave={handleSave} 
              />
            </div>
          ) : (
            <div className="min-h-[600px]">
              <PortfolioPreview data={portfolioData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}