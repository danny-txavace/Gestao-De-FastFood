export interface ProductsUpdateDTO {
  "id": string
  "itemName": string
  "imageUrl": File | null
  "removeImage": boolean
  "price": number
  "category": string
  "isActive": boolean
}
