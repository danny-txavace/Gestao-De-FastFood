import { Component } from '@angular/core';
import { LoginNavbar } from "../login-navbar/login-navbar";
import { LoginOutlet } from "../../../_pages/Outlet/login-outlet/login-outlet";
import { LoginFooter } from "../login-footer/login-footer";

@Component({
  selector: 'app-main-login',
  imports: [LoginNavbar, LoginOutlet, LoginFooter],
  templateUrl: './main-login.html',
  styleUrl: './main-login.scss'
})
export class MainLogin {

}
