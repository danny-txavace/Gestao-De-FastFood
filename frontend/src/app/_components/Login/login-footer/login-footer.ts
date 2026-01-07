import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login-footer',
  imports: [TranslateModule, DividerModule],
  templateUrl: './login-footer.html',
  styleUrl: './login-footer.scss'
})
export class LoginFooter {

}
