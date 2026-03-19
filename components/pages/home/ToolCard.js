import Link from 'next/link';

export default function ToolCard({ title, description, tags, icon, href, featured = false }) {
  const cardClasses = `tool-card group flex gap-4 items-start p-5 sm:p-[1.375rem] rounded-[14px] border border-bdr transition-all duration-250 ease-in-out no-underline text-inherit ${
    featured 
      ? 'col-span-full bg-linear-to-br from-surface to-llos-soft border-orange-100' 
      : 'bg-surface'
  } hover:border-llos hover:shadow-[0_4px_16px_rgba(234,122,39,0.10)] hover:-translate-y-0.5`;

  const iconBoxClasses = `icon-box flex items-center justify-center shrink-0 rounded-[12px] text-llos transition-all duration-250 ${
    featured 
      ? 'w-12 h-12 min-w-[48px] bg-llos text-white rounded-[14px] text-[1.25rem]' 
      : 'w-11 h-11 min-w-[44px] bg-llos-soft text-[1.125rem] group-hover:bg-llos group-hover:text-white'
  }`;

  return (
    <Link href={href} className={cardClasses}>
      <div className={iconBoxClasses}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold mb-1 ${featured ? 'text-[17px]' : 'text-[15px]'}`}>
          {title}
        </h3>
        <p className={`text-ink-soft mb-2 leading-[1.45] ${featured ? 'text-[14px]' : 'text-[13px]'}`}>
          {description}
        </p>
        <div className="flex flex-wrap gap-1.25">
          {tags.map((tag, index) => (
            <span key={index} className="text-[10px] font-semibold px-2 py-0.5 bg-cream text-muted rounded-full uppercase tracking-wider border border-bdr group-hover:bg-llos-soft group-hover:text-llos group-hover:border-orange-200">
              {tag}
            </span>
          ))}
        </div>
        {featured && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-llos">
            Open Studio 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.75">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
