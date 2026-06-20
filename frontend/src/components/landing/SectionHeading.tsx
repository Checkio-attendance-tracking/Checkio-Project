interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <div className={`mb-4 flex ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <div className={`inline-flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden="true" />
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.12em] text-slate-500 md:text-sm">
            {eyebrow}
          </p>
          {align === 'center' && (
            <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden="true" />
          )}
        </div>
      </div>
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}
