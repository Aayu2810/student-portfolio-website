'use client';

import { useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PortfolioShareModal from './PortfolioShareModal';
import { Share2 } from 'lucide-react';

interface PortfolioData {
  title: string;
  tagline: string;
  about: string;
  skills: string[];
  theme: string;
  customDomain?: string;
}

interface PortfolioEditorProps {
  initialData?: PortfolioData;
  onSave: (data: PortfolioData) => void;
}

export function PortfolioEditor({ initialData, onSave }: PortfolioEditorProps) {
  const [data, setData] = useState<PortfolioData>(
    initialData || {
      title: '',
      tagline: '',
      about: '',
      skills: [],
      theme: 'minimal',
      customDomain: '',
    }
  );
  
  const [newSkill, setNewSkill] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSave = () => {
    onSave(data);
    alert('Portfolio saved successfully!');
  };

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData({
        ...data,
        skills: [...data.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setData({
      ...data,
      skills: data.skills.filter(skill => skill !== skillToRemove),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Portfolio Builder</h2>
        <p className="text-gray-400 mb-8">Create your professional portfolio by customizing the sections below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Content Editor */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="e.g., My Professional Portfolio"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <Input
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  placeholder="e.g., Software Engineer & Designer"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About Me</label>
                <Textarea
                  value={data.about}
                  onChange={(e) => setData({ ...data, about: e.target.value })}
                  placeholder="Tell us about yourself, your background, and your goals..."
                  rows={4}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, JavaScript, UI/UX)"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button 
                onClick={addSkill}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-purple-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Custom Domain</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain Name</label>
              <Input
                value={data.customDomain || ''}
                onChange={(e) => setData({ ...data, customDomain: e.target.value })}
                placeholder="e.g., portfolio.yourname.com"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-sm text-gray-500 mt-2">Leave blank to use the default CampusCred domain</p>
            </div>
          </div>
        </div>

        {/* Right Column - Theme Selector and Preview */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <ThemeSelector 
              selectedTheme={data.theme} 
              onThemeChange={(themeId) => setData({ ...data, theme: themeId })} 
            />
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Share Portfolio</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 mb-4">Share your professional portfolio with others via link or QR code.</p>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Open Share Settings
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <Button 
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3"
              >
                Save Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showShareModal && (
        <PortfolioShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}