import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class I18nRepository {
  private readonly storageKey = 'i18n';

  // Idiomas suportados
  private readonly supportedLangs = ['en', 'es', 'pt', 'zh'];

  // BehaviorSubject para emitir o idioma atual
  private currentLangSubject = new BehaviorSubject<string>(this.getStoredLang());
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translateService: TranslateService) {
    this.initialize();
  }

  /** Inicializa idioma do sistema */
  private initialize(): void {
    const savedLang = this.getStoredLang();

    if (savedLang && this.supportedLangs.includes(savedLang)) {
      this.useLang(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = this.supportedLangs.includes(browserLang) ? browserLang : 'en';
      this.useLang(defaultLang);
    }
  }

  /** Troca para próximo idioma disponível (ciclo) */
  toggleLang(): void {
    const current = this.getStoredLang();
    const currentIndex = this.supportedLangs.indexOf(current);
    const nextIndex = (currentIndex + 1) % this.supportedLangs.length;
    const nextLang = this.supportedLangs[nextIndex];
    this.useLang(nextLang);
  }

  /** Define idioma específico */
  setLang(lang: string): void {
    if (this.supportedLangs.includes(lang)) {
      this.useLang(lang);
    } else {
      console.warn(`Language unavailable: ${lang}`);
    }
  }

  /** Retorna idioma atual armazenado */
  getStoredLang(): string {
    return localStorage.getItem(this.storageKey) || 'en';
  }

  /** Aplica idioma no TranslateService e persiste */
  private useLang(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem(this.storageKey, lang);
    this.currentLangSubject.next(lang);
  }
}
