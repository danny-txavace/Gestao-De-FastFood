import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { TranslateService } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimationsAsync(),
    MessageService
  ]
}).then((moduleRef) =>
{
  const translateService = moduleRef.injector.get(TranslateService);
  translateService.use(localStorage.getItem('i18n') || 'en');
})
