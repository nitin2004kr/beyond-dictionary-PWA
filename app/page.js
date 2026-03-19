import Hero from "@/components/pages/home/Hero";
import ToolGrid from "@/components/pages/home/ToolGrid";
import ToolCard from "@/components/pages/home/ToolCard";

const toolsData = [
  {
    id: 'aphorist-studio',
    title: 'Aphorist Studio',
    description: 'Distill raw thoughts into timeless wisdom through the lenses of 465+ global masters. Voice genome, TTS, history, and inspire features built in.',
    tags: ['Wisdom', '465 Voices', 'TTS', 'Inspire'],
    href: 'aphorist-studio.html',
    featured: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
        <line x1="16" y1="8" x2="2" y2="22"/>
        <line x1="17.5" y1="15" x2="9" y2="15"/>
      </svg>
    )
  },
  {
    id: 'creative-studio',
    title: 'Creative Studio',
    description: '20 literary styles from Velvet Hammer to Prophetic. Blend modes, explain/trace, and style-aware generation.',
    tags: ['20 Styles', 'Blend', 'Craft'],
    href: 'creative-studio.html',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  },
  {
    id: 'creative-playground',
    title: 'Creative Playground',
    description: 'Experiment with creative style parameters in a live sandbox. Test prompts across styles and compare outputs.',
    tags: ['Experiment', 'Styles'],
    href: 'creative-playground.html',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    id: 'note-ninja',
    title: 'NoteNinja',
    description: 'Markdown editor with readability analysis, distraction-free focus, and wiki-linking for power users.',
    tags: ['Writing', 'Focus', 'Markdown'],
    href: 'note-ninja.html',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  {
    id: 'frequency-analyzer',
    title: 'Frequency Analyzer',
    description: 'Lexical analysis tool. Identify vocabulary patterns, export unique word lists, and filter with precision controls.',
    tags: ['Analysis', 'Lexicon', 'Research'],
    href: 'word-frequency-analyzer.html',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="max-w-[1080px] mx-auto px-4 py-5 sm:py-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3 sm:mb-4">
          5 Tools Available
        </div>
        <ToolGrid>
          {toolsData.map((tool) => (
            <ToolCard 
              key={tool.id}
              {...tool}
            />
          ))}
        </ToolGrid>
      </div>
    </main>
  );
}
