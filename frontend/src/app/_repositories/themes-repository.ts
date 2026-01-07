import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemesRepository implements OnDestroy {
  private themeSubject = new BehaviorSubject<string>(this.getStoredTheme());
  theme$ = this.themeSubject.asObservable();
  private readonly storageKey = "theme";
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  constructor()
  {  this.initialize(); }

  private initialize(): void
  {
    const savedTheme = localStorage.getItem(this.storageKey);

    if (savedTheme)
    { this.applyTheme(savedTheme, false); }
    else { this.useSystemTheme(); }

    this.setupSystemThemeListener();
  }

  private useSystemTheme(): void
  {
    const systemTheme = this.getSystemTheme();
    this.applyTheme(systemTheme, false);
    localStorage.setItem(this.storageKey, systemTheme);
  }

  private getSystemTheme(): string
  {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private setupSystemThemeListener(): void
  {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.mediaQueryListener = (event: MediaQueryListEvent) =>
    {
      // Only apply system theme if no theme is explicitly set by user
      if (!localStorage.getItem(this.storageKey)) {
        const newSystemTheme = event.matches ? 'dark' : 'light';
        this.applyTheme(newSystemTheme, false);
        this.themeSubject.next(newSystemTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener)
    { mediaQuery.addEventListener('change', this.mediaQueryListener); }
  }

  toggleTheme(): void
  {
    const newTheme = this.getStoredTheme() === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme, true);
    this.themeSubject.next(newTheme);
  }

  getStoredTheme(): string
  { return localStorage.getItem(this.storageKey) || this.getSystemTheme(); }

  setStoredTheme(theme: string): void
  {
    this.applyTheme(theme, true);
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: string, updateStorage: boolean = true): void
  {
    this.updatePrimengTheme(theme);
    this.updateTailwindTheme(theme);

    if (updateStorage)
    {
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(theme);
      localStorage.setItem(this.storageKey, theme); }
  }

  private updatePrimengTheme(theme: string): void
  {
    const head = document.getElementsByTagName('head')[0];
    const existingLink = document.getElementById('primeng-theme') as HTMLLinkElement;

    const themeHref = theme === 'dark' ? 'assets/themes/darkMode.scss' : 'assets/themes/lightMode.scss';

    if (existingLink)
    { existingLink.href = themeHref; }
    else
    {
      const link = document.createElement('link');
      link.id = 'primeng-theme';
      link.rel = 'stylesheet';
      link.href = themeHref;
      head.appendChild(link);
    }
  }

  private updateTailwindTheme(theme: string): void
  {
    if (theme === 'dark')
    {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
    else{
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }


  ngOnDestroy(): void {
    // Clean up media query listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (this.mediaQueryListener)
    { if (mediaQuery.removeEventListener) { mediaQuery.removeEventListener('change', this.mediaQueryListener); } }
  }
}
