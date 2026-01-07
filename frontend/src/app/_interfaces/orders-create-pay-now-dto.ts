export interface OrdersCreatePayNowDTO {
  "cashRegisterId": string
  "method": PymtMethodDTO,
  "orderItems": {
    "productId": string
    "quantity": number
  }[]
}

export interface PymtMethodDTO {
  "cash": number
  "eMola": number
  "mPesa": number
}
