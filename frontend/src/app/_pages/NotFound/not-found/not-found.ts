import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LoginFooter } from '../../../_components/Login/login-footer/login-footer';

@Component({
  selector: 'app-not-found',
  imports: [TranslateModule, LoginFooter],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFound {

}
