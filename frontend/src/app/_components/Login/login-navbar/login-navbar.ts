import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { I18nRepository } from '../../../_repositories/i18n-repository';
import { ThemesRepository } from '../../../_repositories/themes-repository';

@Component({
  selector: 'app-login-navbar',
  imports: [Toolbar, CommonModule, TranslateModule],
  templateUrl: './login-navbar.html',
  styleUrl: './login-navbar.scss'
})
export class LoginNavbar {
  logo = '/assets/images/sualogo.svg';
  isDark : boolean = false;

  constructor(private i18n: I18nRepository, private themeRespository: ThemesRepository)
  {
    this.isDark = this.themeRespository.getStoredTheme() === 'dark';

    document.body.classList.toggle('dark', this.isDark);
    document.body.classList.toggle('light', !this.isDark);
  }

  toggleTheme() {
    this.themeRespository.toggleTheme()
    this.isDark = this.themeRespository.getStoredTheme() === 'dark';

    document.body.classList.toggle('dark', this.isDark);
    document.body.classList.toggle('light', !this.isDark);
  }

  toggleLang(): void {
    this.i18n.toggleLang()
  }
}
