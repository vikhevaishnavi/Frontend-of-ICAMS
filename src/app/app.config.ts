 
 
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
 
import { routes } from './app.routes';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
 
export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    // 1. Tell Angular to use the Class-based interceptor

    { 

      provide: HTTP_INTERCEPTORS, 

      useClass: AuthInterceptor, 

      multi: true 

    },

    // 2. You MUST add withInterceptorsFromDi() here

    provideHttpClient(withInterceptorsFromDi()), 

    provideCharts(withDefaultRegisterables())

  ],

};
 