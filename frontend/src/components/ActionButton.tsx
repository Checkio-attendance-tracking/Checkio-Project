import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

interface ActionButtonProps {
  label: string;
  sublabel?: string;
  icon: React.ReactElement<{ size?: number; className?: string }>;
  color: 'green' | 'orange' | 'blue' | 'red';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const colorVariants = {
  green: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
  orange: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
  red: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
};

const iconColorVariants = {
  green: 'text-emerald-500 bg-emerald-100',
  orange: 'text-amber-500 bg-amber-100',
  blue: 'text-blue-500 bg-blue-100',
  red: 'text-rose-500 bg-rose-100',
};

export function ActionButton({ label, sublabel, icon, color, onClick, disabled, className }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        clsx(
          'relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 group w-full',
          'hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
          colorVariants[color],
          className
        )
      )}
    >
      <div className={clsx("p-4 rounded-full mb-4 transition-transform group-hover:scale-110", iconColorVariants[color])}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <span className="text-lg font-bold">{label}</span>
      {sublabel && <span className="text-xs opacity-75 mt-1">{sublabel}</span>}
    </button>
  );
}
