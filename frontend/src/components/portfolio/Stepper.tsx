// frontend/src/components/portfolio/Stepper.tsx

import React from 'react';

interface StepperProps {
  steps: string[];
  current: number; // 0-based
  onStepClick?: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, current, onStepClick }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onStepClick?.(i)}
            className={[
              'flex items-center gap-2 px-3 py-2 rounded border transition-colors',
              active
                ? 'bg-black text-white border-black'
                : done
                ? 'bg-white text-black border-black'
                : 'bg-white text-gray-500 border-gray-300',
            ].join(' ')}
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={[
                'w-6 h-6 inline-flex items-center justify-center rounded-full border',
                active || done ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-300',
              ].join(' ')}
            >
              {i + 1}
            </span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
};