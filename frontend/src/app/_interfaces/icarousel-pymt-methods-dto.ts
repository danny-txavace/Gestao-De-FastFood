export interface ICarouselPymtMethodsDto {
  slides: PaymentSlide[];
}

export interface PaymentSlide {
  imageUrl: string;
  amount: number;
}

export interface PaymnetMethodDTO {
  "amounts": number[]
}
