'use client';

import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const themes: Theme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    preview: 'bg-white text-gray-900',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and sleek',
    preview: 'bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-900',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#f5f3ff',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Professional dark theme',
    preview: 'bg-gray-900 text-white',
    colors: {
      primary: '#8b5cf6',
      secondary: '#64748b',
      background: '#111827',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and expressive',
    preview: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white',
    colors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      background: '#1e1b4b',
    },
  },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Choose a Theme</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === theme.id
                ? 'border-purple-500 ring-2 ring-purple-500/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className={`h-24 rounded mb-3 ${theme.preview}`}>
              <div className="h-full flex items-center justify-center text-xs font-medium">
                {theme.name} Preview
              </div>
            </div>
            <h4 className="font-medium text-white">{theme.name}</h4>
            <p className="text-sm text-gray-400 mt-1">{theme.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}