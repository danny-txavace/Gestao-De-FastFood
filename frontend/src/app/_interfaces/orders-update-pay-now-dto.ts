import { PymtMethodDTO } from "./orders-create-pay-now-dto"

export interface OrdersUpdatePayNowDTO {
  "saleId": string
  "method": PymtMethodDTO
}
