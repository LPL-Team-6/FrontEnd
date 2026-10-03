import { Component, computed, inject } from '@angular/core';

import { ThemeService } from './theme.service';

// One icon button: shows the moon in light mode and the sun in dark mode, i.e. the theme a
// click switches TO, and the accessible label says so in words.
@Component({
  selector: 'app-theme-switcher',
  template: `
    <button type="button" class="theme-toggle" [attr.aria-label]="label()" [title]="label()" (click)="theme.toggle()">
      @if (theme.effective() === 'dark') {
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      } @else {
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      }
    </button>
  `,
  // Lives in the navy app header next to the user switcher - same brand-token styling.
  styles: `
    .theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--color-brand-muted);
      background: var(--color-brand-raised);
      color: var(--color-brand-contrast);

      &:hover {
        border-color: var(--color-highlight);
        color: var(--color-highlight-on-brand);
      }
    }
  `,
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly label = computed(() => (this.theme.effective() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
}
