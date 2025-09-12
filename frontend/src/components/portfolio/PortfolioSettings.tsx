// frontend/src/components/portfolio/PortfolioSettings.tsx
import React, { useState } from 'react';

export interface PortfolioSettings {
  // Only keep essential settings for our Swiss Design template
  colorScheme: 'classic' | 'modernBlue' | 'warmMinimal';
  // Page margins in mm
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  // Optional size controls in mm
  heroHeightMm?: number; // default ~200
  stripHeightMm?: number; // default ~120
  techHeightMm?: number; // default ~120
  thumbHeightMm?: number; // default ~40

  // Allow additional fields for forward compatibility
  [key: string]: any;
}

interface Props {
  settings: PortfolioSettings;
  onChange: (settings: PortfolioSettings) => void;
  projectCount: number;
  estimatedPages: number;
}

// Color scheme presets - simplified
const colorSchemes = {
  classic: {
    name: 'Classic Swiss (Red)',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#DC2626', // Red
      text: '#000000',
      light: '#F5F5F5'
    }
  },
  modernBlue: {
    name: 'Modern Swiss (Blue)', 
    colors: {
      primary: '#000000',
      secondary: '#666666', 
      accent: '#2563EB', // Blue
      text: '#000000',
      light: '#F5F5F5'
    }
  },
  warmMinimal: {
    name: 'Warm Swiss (Orange)',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#EA580C', // Orange
      text: '#000000',
      light: '#F5F5F5'
    }
  }
};

export const PortfolioSettings: React.FC<Props> = ({ 
  settings, 
  onChange, 
  projectCount,
  estimatedPages 
}) => {
  // Ensure settings have defaults
  const currentSettings: PortfolioSettings = {
    colorScheme: settings?.colorScheme || 'classic',
    margins: settings?.margins || { top: 15, bottom: 15, left: 15, right: 15 },
    heroHeightMm: settings?.heroHeightMm ?? 200,
    stripHeightMm: settings?.stripHeightMm ?? 120,
    techHeightMm: settings?.techHeightMm ?? 120,
    thumbHeightMm: settings?.thumbHeightMm ?? 40,
    ...settings,
  } as PortfolioSettings;
  
  const [expandedSection, setExpandedSection] = useState<string | null>('template');

  const updateColorScheme = (scheme: 'classic' | 'modernBlue' | 'warmMinimal') => {
    onChange({
      ...currentSettings,
      colorScheme: scheme
    });
  };

  const updateMargins = (k: keyof PortfolioSettings['margins'], v: number) => {
    onChange({ ...currentSettings, margins: { ...currentSettings.margins, [k]: v } });
  };

  const updateSize = (k: 'heroHeightMm' | 'stripHeightMm' | 'techHeightMm' | 'thumbHeightMm', v: number) => {
    onChange({ ...currentSettings, [k]: v });
  };

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg">🎨</span>
          <span className="font-medium">Swiss Design Template</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Clean, minimal layout with strong typography</p>
          <p>• Full-bleed hero images for maximum impact</p>
          <p>• 15mm margins for professional appearance</p>
          <p>• Automatic 2-page spreads for major projects</p>
          <p>• Single pages for smaller projects</p>
        </div>
      </div>

      {/* Color Scheme Selection */}
      <div className="border rounded-lg">
        <div 
          className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'colors' ? null : 'colors')}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🎨</span>
            <span className="font-medium">Accent Color</span>
            <div className="flex gap-1">
              {Object.values(colorSchemes[currentSettings.colorScheme].colors).slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <svg 
            width={20} 
            height={20} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className={`transition-transform ${expandedSection === 'colors' ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        {expandedSection === 'colors' && (
          <div className="p-4 border-t space-y-3">
            {Object.entries(colorSchemes).map(([key, scheme]) => (
              <button
                key={key}
                onClick={() => updateColorScheme(key as 'classic' | 'modernBlue' | 'warmMinimal')}
                className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors ${
                  currentSettings.colorScheme === key 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="text-sm font-medium">{scheme.name}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div 
                      className="w-6 h-6 rounded border border-gray-200" 
                      style={{ backgroundColor: scheme.colors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded border border-gray-200" 
                      style={{ backgroundColor: scheme.colors.accent }}
                    />
                    <div 
                      className="w-6 h-6 rounded border border-gray-200" 
                      style={{ backgroundColor: scheme.colors.light }}
                    />
                  </div>
                  {currentSettings.colorScheme === key && (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" strokeWidth={2} />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Layout Sizes */}
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Layout Sizes (mm)</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="w-32">Hero height</span>
            <input type="number" className="swiss-input w-24"
              min={60} max={260} step={5}
              value={currentSettings.heroHeightMm}
              onChange={(e) => updateSize('heroHeightMm', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-32">Strip height</span>
            <input type="number" className="swiss-input w-24"
              min={40} max={200} step={5}
              value={currentSettings.stripHeightMm}
              onChange={(e) => updateSize('stripHeightMm', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-32">Technical height</span>
            <input type="number" className="swiss-input w-24"
              min={30} max={200} step={5}
              value={currentSettings.techHeightMm}
              onChange={(e) => updateSize('techHeightMm', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-32">Thumb height</span>
            <input type="number" className="swiss-input w-24"
              min={20} max={120} step={5}
              value={currentSettings.thumbHeightMm}
              onChange={(e) => updateSize('thumbHeightMm', Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </div>

      {/* Margins */}
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Page Margins (mm)</div>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span>Top</span>
            <input type="number" className="swiss-input w-20"
              min={0} max={40} step={1}
              value={currentSettings.margins.top}
              onChange={(e) => updateMargins('top', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Right</span>
            <input type="number" className="swiss-input w-20"
              min={0} max={40} step={1}
              value={currentSettings.margins.right}
              onChange={(e) => updateMargins('right', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Bottom</span>
            <input type="number" className="swiss-input w-20"
              min={0} max={40} step={1}
              value={currentSettings.margins.bottom}
              onChange={(e) => updateMargins('bottom', Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Left</span>
            <input type="number" className="swiss-input w-20"
              min={0} max={40} step={1}
              value={currentSettings.margins.left}
              onChange={(e) => updateMargins('left', Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-2">Portfolio Overview</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-500">Projects</div>
            <div className="font-medium">{projectCount}</div>
          </div>
          <div>
            <div className="text-gray-500">Est. Pages</div>
            <div className="font-medium">{estimatedPages}</div>
          </div>
          <div>
            <div className="text-gray-500">Format</div>
            <div className="font-medium">A4</div>
          </div>
        </div>
      </div>
      
      {/* Layout Preview */}
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Layout Logic</div>
        <div className="text-xs text-gray-600 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-red-600">→</span>
            <div>
              <strong>Major Projects (2 pages):</strong> Projects with 4+ images, detailed descriptions, or significant data
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">→</span>
            <div>
              <strong>Minor Projects (1 page):</strong> Projects with 1-3 images or limited information
            </div>
          </div>
        </div>
      </div>

      {/* Sample Portfolio Warning */}
      {estimatedPages > 12 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-1">Sample Portfolio Guideline</div>
          <div className="text-xs text-yellow-700">
            Your portfolio is estimated at {estimatedPages} pages. Sample portfolios should be ≤12 pages. 
            Consider selecting fewer projects or reducing assets per project.
          </div>
        </div>
      )}
    </div>
  );
};