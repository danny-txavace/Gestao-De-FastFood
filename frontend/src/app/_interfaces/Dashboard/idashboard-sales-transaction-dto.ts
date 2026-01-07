export interface IDashboardSalesTransactionDto {
  operator: string;
  code: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  addition: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  date: string;
}
