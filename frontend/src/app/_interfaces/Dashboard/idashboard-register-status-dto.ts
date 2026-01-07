export interface IDashboardRegisterStatusDto {
  status: number;
  operator: string;
  opening: {
    date: string,
    time: string
  };
  closing: {
    date: string,
    time: string
  };
  searchDate?: Date;
}
