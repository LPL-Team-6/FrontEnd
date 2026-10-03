import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DevUserSwitcherComponent } from './core/dev-user-switcher.component';
import { ThemeSwitcherComponent } from './core/theme-switcher.component';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DevUserSwitcherComponent, ThemeSwitcherComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
