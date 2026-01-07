import { ICarouselPymtMethodsDto } from "../icarousel-pymt-methods-dto";
import { ITotalValueDto } from "../itotal-value-dto";

export interface IDashboardTotalBalanceDto {
  carousel: ICarouselPymtMethodsDto,
  value: ITotalValueDto
}
