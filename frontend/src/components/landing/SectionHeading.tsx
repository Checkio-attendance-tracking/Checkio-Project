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
          <span className="h-px w-6 bg-indigo-500/70 sm:w-10" aria-hidden="true" />
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.12em] text-indigo-700 md:text-sm">
            {eyebrow}
          </p>
          {align === 'center' && (
            <span className="h-px w-6 bg-indigo-500/70 sm:w-10" aria-hidden="true" />
          )}
        </div>
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
    </div>
  );
}
