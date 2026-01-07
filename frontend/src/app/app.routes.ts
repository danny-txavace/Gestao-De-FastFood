import { Routes } from '@angular/router';
import { MainManagement } from './_components/Management/main-management/main-management';
import { authGuard } from './_guards/auth-guard';
import { loginGuard } from './_guards/login-guard';
import { PosNewOrder } from './_pages/Management/POS/pos-new-order/pos-new-order';
import { PosOrderList } from './_pages/Management/POS/pos-order-list/pos-order-list';
import { MainPos } from './_pages/Management/POS/main-pos/main-pos';
import { PosCashMovements } from './_pages/Management/POS/pos-cash-movements/pos-cash-movements';
import { MainUserView } from './_pages/UserView/main-user-view/main-user-view';
import { MainDashboard } from './_pages/Management/Dashboard/main-dashboard/main-dashboard';

export const routes: Routes =
[
  {
    path: '',
    loadComponent: () => import('./_pages/Loader/initial-loader/initial-loader').then(l => l.InitialLoader)
  },
  { //v1-sign_in
    path: 'v1-sign_in',
    loadComponent: () => import('./_components/Login/main-login/main-login').then(l => l.MainLogin),
    canActivate: [loginGuard],
    children:
    [
      {
        path: '',
        loadComponent: () => import('./_pages/Login/sign-in/sign-in').then(l => l.SignIn),
        outlet: 'login-outlet'
      }
    ]
  },
  { //v1-main_management
    path: 'v1-main_management',
    component: MainManagement,
    canActivate: [authGuard],
    children:
    [
      {
        path: 'v1-main_dashboard',
        component: MainDashboard,
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_pos',
        component: MainPos,
        outlet: 'management-outlet',
        children: [
          {
            path: 'pos-new_order',
            component: PosNewOrder,
            outlet: 'pos-outlet'
          },
          {
            path: 'pos-order_list',
            component: PosOrderList,
            outlet: 'pos-outlet'
          },
          {
            path: 'pos-cash_movements',
            component: PosCashMovements,
            outlet: 'pos-outlet'
          }
        ]
      },
      {
        path: 'v1-main_register',
        loadComponent: () => import('./_pages/Management/Register/main-register/main-register').then(m => m.MainRegister),
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_orders',
        loadComponent: () => import('./_pages/Management/Orders/main-orders/main-orders').then(m => m.MainOrders),
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_products',
        loadComponent: () => import('./_pages/Management/Products/main-products/main-products').then(m => m.MainProducts),
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_ingredients',
        loadComponent: () => import('./_pages/Management/Ingredients/main-ingredients/main-ingredients').then(m => m.MainIngredients),
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_system_users',
        loadComponent: () => import('./_pages/Management/UserMenu/SystemUsers/main-system-users/main-system-users').then(m => m.MainSystemUsers),
        outlet: 'management-outlet'
      },
      {
        path: 'v1-main_customers',
        loadComponent:() => import('./_pages/Management/UserMenu/Customers/main-customers/main-customers').then(m => m.MainCustomers),
        outlet: 'management-outlet'
      }
    ]
  },
  {
    path: 'v1-user_view',
    component: MainUserView,
    canActivate: [authGuard],
    children:
    [
      {
        path: 'pos-new_order',
        component: PosNewOrder,
        outlet: 'pos-user_outlet'
      },
      {
        path: 'pos-order_list',
        component: PosOrderList,
        outlet: 'pos-user_outlet'
      },
      {
        path: 'pos-cash_movements',
        component: PosCashMovements,
        outlet: 'pos-user_outlet'
      }
    ]
  },
  {
    path : "**",
    loadComponent : () => import('./_pages/NotFound/not-found/not-found').then(n => n.NotFound)
  }
];
