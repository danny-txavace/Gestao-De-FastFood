export interface OrdersListDTO {
  "id": string
  "customerName": string
  "customerPhone": string
  "description": string
  "totalQty": number
  "totalPay": number
  "totalPaid": number
  "totalChange": number
  "status": OrderStatusEnum
  "operator": string
  "createdAt": Date
}

export enum OrderStatusEnum {
  Cancelled,
  Pending,
  Paid
}
