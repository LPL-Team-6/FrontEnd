import { Component, inject } from '@angular/core';

import { DEV_USERS, DevUserService } from './dev-user.service';
import { isAdvisor } from './role-view';

@Component({
  selector: 'app-dev-user-switcher',
  template: `
    <label class="dev-user-switcher">
      <span>Signed in as</span>
      <select
        [value]="devUser.current().username"
        (change)="devUser.setUser($any($event.target).value)"
      >
        @for (user of users; track user.username) {
          <option [value]="user.username">
            {{ user.displayName }} · {{ user.firmId }} · {{ isAdvisor(user.role) ? 'Advisor' : 'Reviewer' }}
          </option>
        }
      </select>
    </label>
  `,
  // Lives in the navy app header, so it uses the brand tokens rather than surface colors.
  styles: `
    .dev-user-switcher {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.85rem;
      color: var(--color-brand-muted);
    }

    select {
      height: 36px;
      padding: 0 0.625rem;
      border-radius: 6px;
      border: 1px solid var(--color-brand-muted);
      background: var(--color-brand-raised);
      color: var(--color-brand-contrast);
    }
  `,
})
export class DevUserSwitcherComponent {
  readonly devUser = inject(DevUserService);
  readonly users = DEV_USERS;
  readonly isAdvisor = isAdvisor;
}
