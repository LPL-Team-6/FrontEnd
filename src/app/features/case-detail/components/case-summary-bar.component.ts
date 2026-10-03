import { Component, computed, input } from '@angular/core';

import { CaseResponse } from '@caseauth/angular-client/src/models/case-response';
import { PlainStatusBadgeComponent } from './plain-status-badge.component';

// R7: client name, blocking-issue count, days open, visible without scrolling at 1366x768.
// "Account type" and "risk tier" are in the brief's design but NOT in the API - Case and
// Applicant have no such fields (see root README's entity list and MISSING_ENDPOINTS.md).
// Showing them would mean fabricating data, so this bar only surfaces what's real.
@Component({
  selector: 'app-case-summary-bar',
  imports: [PlainStatusBadgeComponent],
  template: `
    <div class="summary-bar">
      <div class="summary-bar__identity">
        <h1>{{ clientName() }}</h1>
        <app-plain-status-badge [status]="case().status!" />
      </div>
      <dl class="summary-bar__stats">
        <div class="summary-bar__stat">
          <dt>Blocking issues</dt>
          <dd [class.summary-bar__stat--alert]="blockingCount() > 0">{{ blockingCount() }}</dd>
        </div>
        <div class="summary-bar__stat">
          <dt>Days open</dt>
          <dd>{{ daysOpen() }}</dd>
        </div>
      </dl>
    </div>
  `,
  // Navy brand panel with an orange top rule - echoes the app header so the case's identity
  // reads as the anchor of the page.
  styles: `
    .summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.75rem;
      flex-wrap: wrap;
      padding: 1.375rem 1.625rem;
      background: var(--color-brand);
      color: var(--color-brand-contrast);
      border-radius: var(--radius);
      box-shadow: inset 0 4px 0 var(--color-highlight);
      margin-bottom: 1.25rem;
    }

    .summary-bar__identity {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      flex-wrap: wrap;

      h1 {
        margin: 0;
        font-size: 1.875rem;
        color: var(--color-brand-contrast);
      }
    }

    .summary-bar__stats {
      display: flex;
      gap: 1.75rem;
      margin: 0;
    }

    .summary-bar__stat {
      dt {
        font-size: 0.8rem;
        color: var(--color-brand-muted);
      }

      dd {
        margin: 0;
        font-size: 1.625rem;
        font-weight: 700;
      }

      dd.summary-bar__stat--alert {
        color: var(--color-highlight-on-brand);
      }
    }
  `,
})
export class CaseSummaryBarComponent {
  readonly case = input.required<CaseResponse>();
  readonly blockingCount = input.required<number>();

  readonly clientName = computed(() => this.case().applicantFullName || '(unnamed applicant)');

  readonly daysOpen = computed(() => {
    const createdAt = this.case().createdAt;
    if (!createdAt) return 0;
    const ms = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  });
}
