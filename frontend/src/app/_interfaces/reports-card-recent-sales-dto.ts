export interface ReportsCardRecentSalesDTO {
  "id": string
  "orderNumber": number
  "methods": string[],
  "totalPay": number,
  "description": string
  "customerName": string
  "time": string
}

export interface RecentSaleDTO {
  data: ReportsCardRecentSalesDTO[];
}
