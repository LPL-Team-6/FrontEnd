import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

// Keep in sync with the pre-paint script in index.html, which reads this same key before
// Angular boots so a saved Light/Dark choice doesn't flash the other theme first.
const STORAGE_KEY = 'caseauth.theme';

// "system" (the default, until the user first toggles) removes data-theme so styles.scss falls
// back to prefers-color-scheme; "light" and "dark" set it on <html> to override the OS.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly osDarkQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private readonly osDark = signal(this.osDarkQuery?.matches ?? false);

  readonly preference = signal<ThemePreference>(this.restore());

  // The theme actually on screen - what the toggle button's icon and label are based on.
  readonly effective = computed<Theme>(() => {
    const preference = this.preference();
    if (preference !== 'system') {
      return preference;
    }
    return this.osDark() ? 'dark' : 'light';
  });

  constructor() {
    this.osDarkQuery?.addEventListener('change', (event) => this.osDark.set(event.matches));

    effect(() => {
      const preference = this.preference();
      const root = this.document.documentElement;
      if (preference === 'system') {
        delete root.dataset['theme'];
      } else {
        root.dataset['theme'] = preference;
      }
    });
  }

  toggle(): void {
    const next: Theme = this.effective() === 'dark' ? 'light' : 'dark';
    this.preference.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private-browsing/blocked storage: the choice just won't survive a reload.
    }
  }

  private restore(): ThemePreference {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Fall through to the default below.
    }
    return 'system';
  }
}
