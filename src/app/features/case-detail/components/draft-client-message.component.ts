import { Component, computed, inject, input, signal } from '@angular/core';

import { FindingResponse } from '@caseauth/angular-client/src/models/finding-response';
import { CaseResponse } from '@caseauth/angular-client/src/models/case-response';
import { findingToTodo } from '../../../core/finding-todo';
import { DevUserService } from '../../../core/dev-user.service';

// R10: one click drafts an editable message from the Blocking to-dos. Draft only - a Copy
// button, never a Send button, so nothing goes to a client without a human reading it first.
@Component({
  selector: 'app-draft-client-message',
  template: `
    <h2>Draft client message</h2>
    @if (blockingSentences().length === 0) {
      <p>No blocking issues to ask the client about.</p>
    } @else {
      @if (!draft()) {
        <button type="button" (click)="generate()">Draft a message to the client</button>
      } @else {
        <label for="draft-message-text">Editable draft - review before sending anywhere</label>
        <textarea id="draft-message-text" rows="8" [value]="draft()" (input)="draft.set($any($event.target).value)"></textarea>
        <div class="draft-actions">
          <button type="button" (click)="copy()">{{ copied() ? 'Copied!' : 'Copy' }}</button>
          <button type="button" (click)="regenerate()">Regenerate from current findings</button>
          <span class="draft-status" aria-live="polite">{{ regenStatus() }}</span>
        </div>
      }
    }
  `,
  styles: `
    textarea {
      width: 100%;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 0.6rem;
      background: var(--color-bg);
      color: var(--color-text);
      font-family: inherit;
      resize: vertical;
      margin-top: 0.4rem;
    }

    label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .draft-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
    }

    .draft-status {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    button {
      border-radius: var(--radius);
      padding: 0.4rem 0.9rem;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text);
      font-weight: 600;
    }
  `,
})
export class DraftClientMessageComponent {
  private readonly devUser = inject(DevUserService);

  readonly case = input.required<CaseResponse>();
  readonly findings = input.required<FindingResponse[]>();

  readonly draft = signal<string | null>(null);
  readonly copied = signal(false);
  readonly regenStatus = signal('');

  private lastGenerated: string | null = null;
  private regenStatusTimer?: ReturnType<typeof setTimeout>;

  readonly blockingSentences = computed(() =>
    this.findings()
      .map(findingToTodo)
      .filter((t) => t.tag === 'Blocking')
      .map((t) => t.sentence),
  );

  generate(): void {
    this.lastGenerated = this.buildDraft();
    this.draft.set(this.lastGenerated);
    this.copied.set(false);
  }

  // Regenerating usually yields identical text (findings rarely change mid-draft), so say what
  // happened - otherwise the click looks dead. Hand edits are only discarded after a confirm.
  regenerate(): void {
    const current = this.draft();
    if (this.buildDraft() === current) {
      this.showRegenStatus('Already up to date with current findings');
      return;
    }
    const edited = current !== this.lastGenerated;
    if (edited && !confirm('Regenerating will discard your edits to the draft. Continue?')) {
      return;
    }
    this.generate();
    this.showRegenStatus('Draft updated from current findings');
  }

  private buildDraft(): string {
    const name = this.case().applicantFullName || 'there';
    const advisor = this.devUser.current().displayName;
    const items = this.blockingSentences().map((s) => `- ${s}`).join('\n');
    return (
      `Hi ${name},\n\nTo finish opening your account, we need a couple of things:\n\n${items}\n\n` +
      `Please reply with the requested document(s) and we'll continue right away.\n\nThanks,\n${advisor}`
    );
  }

  private showRegenStatus(text: string): void {
    this.regenStatus.set(text);
    clearTimeout(this.regenStatusTimer);
    this.regenStatusTimer = setTimeout(() => this.regenStatus.set(''), 3000);
  }

  async copy(): Promise<void> {
    const text = this.draft();
    if (!text) return;
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // navigator.clipboard is undefined outside a secure context (e.g. the demo served over
      // plain HTTP on a LAN IP), so fall back to the legacy copy command.
      ok = this.legacyCopy(text);
    }
    if (ok) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  // execCommand('copy') is deprecated but still works over HTTP in every major browser, as long
  // as it runs inside the click handler. Uses an off-screen textarea so the user's selection and
  // scroll position in the real one aren't disturbed.
  private legacyCopy(text: string): boolean {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.top = '-1000px';
    document.body.appendChild(el);
    el.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(el);
    }
  }
}
