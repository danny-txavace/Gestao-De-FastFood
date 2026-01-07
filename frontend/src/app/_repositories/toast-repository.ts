import { inject, Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastRepository {
  private readonly msgService = inject(MessageService);
  private readonly zone = inject(NgZone);
  private readonly translateService = inject(TranslateService);

  onShowMsg(severity: string, message: string, life?: number): void
  {
    if (life == null)
    {
      life = 5000;
    }

    let detail = this.translateService.instant(message);
    let summary = severity.charAt(0).toUpperCase() + severity.slice(1);

    // Impede que o Angular faça change detection
    this.zone.runOutsideAngular(() => {
      this.msgService.add({
        severity,
        summary,
        detail,
        life
      });
    });
  }
}
