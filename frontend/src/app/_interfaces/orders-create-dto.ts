export interface OrdersCreateDTO {
  "cashRegisterId": string
  "customerName": string,
  "customerPhone": string
  "orderItems": {
    "productId": string
    "quantity": number
  }[]
}
