import {Component, ChangeDetectionStrategy} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs';
import {SidebarComponent} from '../sidebar/sidebar.component';

/**
 * Generic route-driven page: the `:name` route param names which `@Sidebar` to render — same
 * shape as crudstone's own `EntityPageComponent`/search-crudstone's own `EntitySearchPageComponent`.
 * Unlike those, there's no context object to fetch first here — `SidebarComponent` takes the
 * name directly and fetches its own `SidebarContext` — so this wrapper only exists for the
 * convenience of a ready-made route, not because one is required.
 */
@Component({
  selector: 'sb-sidebar-page',
  standalone: true,
  imports: [SidebarComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (name(); as sidebarName) {
      <sb-sidebar [name]="sidebarName"/>
    }
  `,
})
export class SidebarPageComponent {

  protected readonly name = toSignal(
    this.route.paramMap.pipe(map(params => params.get('name'))),
    {initialValue: null},
  );

  constructor(private route: ActivatedRoute) {
  }
}
