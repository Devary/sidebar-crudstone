import {ApplicationConfig} from '@angular/core';
import {provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling} from '@angular/router';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import {MessageService} from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import {provideSidebarCrudstone} from 'sidebarcrudstone';
import {routes} from './app.routes';
import {environment} from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withInMemoryScrolling({anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled'}),
      withEnabledBlockingInitialNavigation()),
    provideHttpClient(withXhr()),
    provideAnimationsAsync(),
    providePrimeNG({theme: {preset: Aura, options: {darkModeSelector: '.app-dark'}}}),
    provideSidebarCrudstone({
      sidebarUrl: environment.sidebarUrl,
      crudstoneUrl: environment.crudstoneUrl,
      localMode: environment.name === 'local',
    }),
    MessageService,
  ],
};
