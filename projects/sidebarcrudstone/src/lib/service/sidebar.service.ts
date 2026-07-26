import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, tap} from 'rxjs';
import {SIDEBAR_CRUDSTONE_CONFIG, SidebarCrudstoneConfig} from '../sidebar-crudstone-config';
import {normalizeSidebarContext, SidebarContext} from '../model/SidebarContext';

@Injectable({providedIn: 'root'})
export class SidebarService {

  private readonly storedSidebars = new Map<string, SidebarContext>();

  constructor(private http: HttpClient,
              @Inject(SIDEBAR_CRUDSTONE_CONFIG) private config: SidebarCrudstoneConfig) {
  }

  // local mode serves a static fixture from assets/data/<name>.json
  private sidebarUri(name: string): string {
    return this.config.localMode
      ? `${this.config.sidebarUrl}${name}.json`
      : this.config.sidebarUrl + name;
  }

  getSidebar(name: string): Observable<SidebarContext> {
    const cached = this.storedSidebars.get(name);
    if (cached) {
      return of(cached);
    }
    return this.http.get<SidebarContext>(this.sidebarUri(name)).pipe(
      map(normalizeSidebarContext),
      tap(context => this.storedSidebars.set(name, context)));
  }
}
