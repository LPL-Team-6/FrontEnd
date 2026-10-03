import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { ApiConfiguration } from '@caseauth/angular-client/src/api-configuration';

import { routes } from './app.routes';
import { devUserInterceptor } from './core/dev-user.interceptor';

const API_ROOT_URL = '';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([devUserInterceptor])),
    { provide: ApiConfiguration, useValue: { rootUrl: API_ROOT_URL } },
  ],
};
