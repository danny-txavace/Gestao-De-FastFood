import { Component, Input } from '@angular/core';
import { ReportsCardRecentSalesDTO } from '../../../../_interfaces/reports-card-recent-sales-dto';
import { FormatCurrencyValue, FormatQty } from '../../../../_utils/global-methods';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard-orders-card-content',
  imports: [TranslateModule],
  templateUrl: './dashboard-orders-card-content.html',
  styleUrl: './dashboard-orders-card-content.scss',
})
export class DashboardOrdersCardContent {
  @Input() data!: ReportsCardRecentSalesDTO;

  formatAmount = FormatCurrencyValue;
  formatQty = FormatQty;
}
