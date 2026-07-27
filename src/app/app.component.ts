import {Component, effect, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'sidebar-crudstone';

  /** Dark mode, persisted across sessions; drives Aura's .app-dark selector on <html>. The
   * playground's Settings modal flips the same class — its staged value reads the live DOM
   * state on open, so the two controls stay in sync. */
  protected readonly dark = signal(localStorage.getItem('darkMode') === 'true');

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('app-dark', this.dark());
      localStorage.setItem('darkMode', String(this.dark()));
    });
  }

  protected toggleDark(): void {
    this.dark.update(dark => !dark);
  }
}
