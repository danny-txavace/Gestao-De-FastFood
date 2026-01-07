import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nRepository } from '../../../_repositories/i18n-repository';
import { ThemesRepository } from '../../../_repositories/themes-repository';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Popover, PopoverModule } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';
import { filter, Subscription } from 'rxjs';
import { BreadCrumbRepository } from '../../../_repositories/bread-crumb-repository';
import { AuthService } from '../../../_services/auth-service';

@Component({
  selector: 'app-management-navbar',
  imports: [Toolbar, ButtonModule, NgClass, TranslateModule, RouterLink, Ripple, RouterModule, CommonModule, PopoverModule, DividerModule],
  templateUrl: './management-navbar.html',
  styleUrl: './management-navbar.scss'
})
export class ManagementNavbar implements OnInit, OnDestroy {
  @ViewChild('isOpenUserMenu') isOpenUserMenu!: Popover;

  @ViewChild('isOpenMobileMenu') isOpenMobileMenu!: ElementRef;

  authService = inject(AuthService);

  private router = inject(Router);
  private subs = new Subscription();
  logo = '/assets/images/sualogo.svg';

  isDark: boolean = false;
  isLight: boolean = false;
  isEN: boolean = false;
  isES: boolean = false;
  isPT: boolean = false;
  isZH: boolean = false;

  isOpenTheme: boolean = false;
  isOpenLang: boolean = false;

  isOpenDashboard: boolean = false;
  isOpenFinance: boolean = false;

  isActivePeopleSU: boolean = false;

  titleLang: string = '';
  titleDashboard: string = '';
  titlePOS: string = '';
  titleCashRegister: string = '';
  titleProducts: string = '';
  titleIngredients: string = '';
  titleOrders: string = '';
  titleUser: string = '';

  // Mobile
  menuOpen: boolean = false;
  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 0;
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  handleClickOutside(event: Event) {
    let target: HTMLElement;

    if (event instanceof MouseEvent) {
      target = event.target as HTMLElement;
    } else if (event instanceof TouchEvent) {
      target = event.touches[0].target as HTMLElement;
    } else {
      return;
    }

    const clickedInsideMenu = this.isOpenMobileMenu.nativeElement.contains(target);
    const clickedToggleBtn = target.closest('[btn-ignore-click]');

    if (this.menuOpen && !clickedInsideMenu && !clickedToggleBtn) {
      this.menuOpen = false;
    }
  }
  // end Mobile

  constructor (
    private i18n: I18nRepository,
    private translateService: TranslateService,
    private themeRespository: ThemesRepository,
    private bCrumbRep: BreadCrumbRepository
  )
  {
    const currentTheme = this.themeRespository.getStoredTheme();
    const currentLang = this.i18n.getStoredLang();

    if (currentTheme === 'dark')
    {
      this.isDark = true;
      this.isLight = false;
    }
    else if (currentTheme === 'light')
    {
      this.isDark = false;
      this.isLight = true;
    }

    if (currentLang === 'en')
    {
      this.isEN = true;
      this.isES = false;
      this.isPT = false;
      this.isZH = false;
    }
    else if (currentLang === 'es')
    {
      this.isEN = false;
      this.isES = true;
      this.isPT = false;
      this.isZH = false;
    }
    else if (currentLang === 'pt')
    {
      this.isEN = false;
      this.isES = false;
      this.isPT = true;
      this.isZH = false;
    }
    else if (currentLang === 'zh')
    {
      this.isEN = false;
      this.isES = false;
      this.isPT = false;
      this.isZH = true;
    }
  }

  ngOnInit(): void {
    this.titleNavbar();

    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.titleNavbar();

        const currentUrl = this.router.url;
        this.checkRouteNavTitle(currentUrl);
      })
    );

    const currentUrl = this.router.url;

    this.checkUserMenuRoute(currentUrl);

    this.subs.add(
      this.router.events
        .pipe(filter((event) =>
        event instanceof NavigationEnd))
        .subscribe(() => {
          const currentUrl = this.router.url;

          this.checkUserMenuRoute(currentUrl);
        })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  navigateTo (format: string) {
    switch (format)
    {
      case 'dashboard':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-objects-column', label: this.titleDashboard}]);
        break;
      case 'pos':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-shopping-cart', label: this.titlePOS}]);
        break;
      case 'cashRegister':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-inbox', label: this.titleCashRegister}]);
        break;
      case 'products':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-crown', label: this.titleProducts}]);
        break;
      case 'ingredients':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-chart-pie', label: this.titleIngredients}]);
        break;
      case 'orders':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-list', label: this.titleOrders}]);
        break;
      case 'systemUser':
        this.bCrumbRep.setBreadCrumb([{icon: 'pi-id-card', label: this.titleUser}]);
        break;
    }
  }

  titleNavbar() {
    this.titleLang = this.translateService.instant('MANAGEMENT_NAVBAR.LANGUAGE.TITLE');

    this.titleDashboard = this.translateService.instant('MANAGEMENT_NAVBAR.DASHBOARD');

    this.titlePOS = this.translateService.instant('MANAGEMENT_NAVBAR.POINT_OF_SALE');

    this.titleCashRegister = this.translateService.instant('MANAGEMENT_NAVBAR.CASH_REGISTER');

    this.titleOrders = this.translateService.instant('MANAGEMENT_NAVBAR.ORDERS_LISTS');

    this.titleProducts = this.translateService.instant('MANAGEMENT_NAVBAR.MENU');

    this.titleIngredients = this.translateService.instant('MANAGEMENT_NAVBAR.INGREDIENTS');

    this.titleUser = this.translateService.instant('MANAGEMENT_NAVBAR.SYSTEM_USERS');
  }

  toggleBtn(format: string, event?: any)
  {
    switch (format)
    {
      case 'pop_user':
        this.isOpenUserMenu.toggle(event);
        this.popUserMenu();
        break;
      case 'pop_theme':
        this.isOpenLang = false;
        this.isOpenTheme = !this.isOpenTheme;
        break;
      case 'pop_i18n':
        this.isOpenLang = !this.isOpenLang;
        this.isOpenTheme = false;
        break;
      case 'theme_light':
        this.isDark = false;
        this.isLight = true;
        this.themeRespository.setStoredTheme('light');
        break;
      case 'theme_dark':
        this.isDark = true;
        this.isLight = false;
        this.themeRespository.setStoredTheme('dark');
        break;
      case 'i18n_en':
        this.isEN = true;
        this.isES = false;
        this.isPT = false;
        this.isZH = false;
        this.i18n.setLang('en');
        break;
      case 'i18n_es':
        this.isEN = false;
        this.isES = true;
        this.isPT = false;
        this.isZH = false;
        this.i18n.setLang('es');
        break;
      case 'i18n_pt':
        this.isEN = false;
        this.isES = false;
        this.isPT = true;
        this.isZH = false;
        this.i18n.setLang('pt');
        break;
      case 'i18n_zh':
        this.isEN = false;
        this.isES = false;
        this.isPT = false;
        this.isZH = true;
        this.i18n.setLang('zh');
        break;
      case 'mobile_menu':
        this.menuOpen = !this.menuOpen;
        break;
      case 'isFinance':
        this.isOpenFinance = !this.isOpenFinance;
        break;
      case 'isDashboard':
        this.isOpenDashboard = !this.isOpenDashboard;
        break;
      default :
        console.error('Unsupported format: ',format);
        break;
    }
  }

  private popUserMenu(): void
  {
    this.subs.add(
      this.isOpenUserMenu.onHide.subscribe(() => {
        this.isOpenTheme = false;
        this.isOpenLang = false;
      })
    );
  }

  openPopUserMenu(event: MouseEvent) {
    this.isOpenUserMenu.show(event);
  }

  private checkRouteNavTitle(currentUrl: string): void {
    if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_pos)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-shopping-cart', label: this.titlePOS}]);
    }
    else if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_register)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-inbox', label: this.titleCashRegister}]);
    }
    else if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_products)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-crown', label: this.titleProducts}]);
    }
    else if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_ingredients)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-chart-pie', label: this.titleIngredients}]);
    }
    else if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_orders)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-list', label: this.titleOrders}]);
    }
    else if(currentUrl === ('/v1-main_management/(management-outlet:v1-main_system_users)'))
    {
      this.bCrumbRep.setBreadCrumb([{icon: 'pi-id-card', label: this.titleUser}]);
    }
  }

  private checkUserMenuRoute(currentUrl: string): void {
    if (currentUrl === ('/v1-main_management/(management-outlet:v1-main_system_users)'))
    { this.isActivePeopleSU = true; }
    else { this.isActivePeopleSU = false; }
  }

  toggleThemeMobile() {
    this.themeRespository.toggleTheme()
    this.isDark = this.themeRespository.getStoredTheme() === 'dark';

    document.body.classList.toggle('dark', this.isDark);
    document.body.classList.toggle('light', !this.isDark);
  }

  toggleLangMobile(): void {
    this.i18n.toggleLang()
  }

  onSignOut(): void
  {
    this.subs.add(
      this.authService.signOut()
    );
  }
}
