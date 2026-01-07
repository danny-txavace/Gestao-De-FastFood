import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// configuration for primeNG
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'; //aura, lara, nora, material

// Configurações do ngx-translate
// npm install @ngx-translate/core @ngx-translate/http-loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './_interceptors/auth-interceptor';
import { credentialsInterceptor } from './_interceptors/credentials-interceptor';
import { provideEnvironmentNgxMask } from 'ngx-mask';

export function createTranslateLoader() {
  return new TranslateHttpLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,
        authInterceptor
      ])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      },
      ripple: true,
      zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100
      }
    }),
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    },
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }).providers || [],
    provideEnvironmentNgxMask(),
    /*
    provideAppInitializer(() => {
      const repo = inject(PosCheckRepository);
      repo.loadFromStorage();
    }),
    */
  ]
};
