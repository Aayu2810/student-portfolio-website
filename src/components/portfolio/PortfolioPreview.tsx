'use client';

interface PortfolioData {
  title: string;
  tagline: string;
  about: string;
  skills: string[];
  theme: string;
  customDomain?: string;
}

interface PortfolioPreviewProps {
  data: PortfolioData;
}

const themeStyles: Record<string, { bg: string; text: string; accent: string }> = {
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'bg-blue-500',
  },
  modern: {
    bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    text: 'text-gray-900',
    accent: 'bg-indigo-500',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    accent: 'bg-purple-500',
  },
  creative: {
    bg: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900',
    text: 'text-white',
    accent: 'bg-pink-500',
  },
};

export function PortfolioPreview({ data }: PortfolioPreviewProps) {
  const theme = themeStyles[data.theme] || themeStyles.minimal;
  
  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.title || 'My Portfolio'}</h1>
          <p className="text-xl md:text-2xl opacity-80 mb-8">{data.tagline || 'Professional Portfolio'}</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button className={`${theme.accent} text-white px-6 py-2 rounded-full font-medium`}>
              Download Resume
            </button>
            <button className="border-2 border-current px-6 py-2 rounded-full font-medium">
              Contact Me
            </button>
          </div>
        </header>

        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-current/20">About Me</h2>
          <p className="text-lg leading-relaxed max-w-3xl">
            {data.about || 'Welcome to my portfolio. I am a professional with expertise in various fields. Feel free to explore my work and get in touch.'}
          </p>
        </section>

        {/* Skills Section */}
        {data.skills.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-current/20">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className={`${theme.accent} text-white px-4 py-2 rounded-full text-sm font-medium`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-current/20">Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((item) => (
              <div key={item} className="border border-current/20 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Project Title {item}</h3>
                <p className="mb-4 opacity-80">Brief description of the project and technologies used.</p>
                <div className="flex gap-2 flex-wrap">
                  {['React', 'TypeScript', 'Tailwind'].map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-current/20 text-center text-sm opacity-75">
          <p>© {new Date().getFullYear()} {data.title || 'My Portfolio'}. All rights reserved.</p>
          <p className="mt-2">{data.customDomain || 'portfolio.campuscred.com'}</p>
        </footer>
      </div>
    </div>
  );
}