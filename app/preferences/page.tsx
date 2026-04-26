'use client';

import { useTheme } from '@/components/ThemeProvider';

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-wire-text">Preferences</h1>
        <p className="text-wire-text-muted text-base mb-8">
          Customize how the app looks.
        </p>

        {/* Theme section */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-wire-text-muted mb-3">
            Theme
          </h2>

          <div className="border-2 border-wire-border bg-wire-white rounded-sm overflow-hidden">
            {/* Cinema Dark option */}
            <label className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-wire-surface transition-colors border-b border-wire-border">
              <input
                type="radio"
                name="theme"
                value="cinema"
                checked={theme === 'cinema'}
                onChange={() => setTheme('cinema')}
                className="w-4 h-4 accent-wire-accent cursor-pointer"
              />
              <span className="text-wire-text font-bold text-base">Cinema Dark</span>
            </label>

            {/* Classic option */}
            <label className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-wire-surface transition-colors">
              <input
                type="radio"
                name="theme"
                value="wireframe"
                checked={theme === 'wireframe'}
                onChange={() => setTheme('wireframe')}
                className="w-4 h-4 accent-wire-accent cursor-pointer"
              />
              <span className="text-wire-text font-bold text-base">Classic</span>
            </label>
          </div>
        </section>
      </div>
    </main>
  );
}
