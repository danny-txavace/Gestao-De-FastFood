import { ElementRef, Injectable } from '@angular/core';
import { CountUp } from 'countup.js';
import { FormatCurrencyRepository } from './FormattingValue/format-currency-repository';

@Injectable({
  providedIn: 'root'
})
export class CountUpRespository {
  private duration: number = 2;

  onCountUp(format: string, element: ElementRef, value: number) {
    switch (format)
    {
      case 'countUp-Qty':
        if (element !== undefined || element != null) this.onCountUpQty(element, value);
        break;
      case 'countUp-Percentage':
        if (element !== undefined || element != null) this.onCountUpPercentage(element, value);
        break;
      case 'countUp-Amount':
        if (element !== undefined || element != null) this.onCountUpAmount(element, value);
        break;
      default:
        console.error('Unsuported format: ',format);
        break;
    }
  }

  private onCountUpQty(element: ElementRef, value: number) {
    const countUp = new CountUp(element.nativeElement, value, {
      duration: this.duration,
      separator: ' ',
      decimalPlaces: 0
    });
    if (!countUp.error) {
      countUp.start();
    }
  }

  private onCountUpPercentage(element: ElementRef, value: number) {
    if (value == 0) {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimalPlaces: 0,
        suffix: ' %',
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
    else if (value > 0) {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimalPlaces: 0,
        prefix: '+',
        suffix: ' %',
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
    else if (value < 0) {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimalPlaces: 0,
        suffix: ' %',
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
  }

  private onCountUpAmount(element: ElementRef, value: number) {
    const prefixCurrencies = ['US Dollar', 'Canadian Dollar', 'Euro', 'British Pound', 'Brazilian Real', 'Mexican Peso', 'Swiss Franc'];
    const suffixCurrencies = ['Mozambican MZN', 'Mozambican MT', 'Swedish Krona', 'Polish Zloty', 'Russian Ruble'];

    let currecnyStored = new FormatCurrencyRepository().getInitialCurrencyStored();

    let symbol = '';
    switch (currecnyStored) {
      case 'US Dollar': symbol = '$'; break;
      case 'Canadian Dollar': symbol = 'C$'; break;
      case 'Euro': symbol = '€'; break;
      case 'British Pound': symbol = '£'; break;
      case 'Brazilian Real': symbol = 'R$'; break;
      case 'Mexican Peso': symbol = '$'; break;
      case 'Swiss Franc': symbol = 'CHF'; break;
      case 'Mozambican MZN': symbol = 'MZN'; break;
      case 'Mozambican MT': symbol = 'MT'; break;
      case 'Swedish Krona': symbol = 'kr'; break;
      case 'Polish Zloty': symbol = 'zł'; break;
      case 'Russian Ruble': symbol = '₽'; break;
      default: symbol = currecnyStored;
    }

    if (prefixCurrencies.includes(currecnyStored)) {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimal: ',',
        decimalPlaces: 2,
        prefix: symbol+' ',
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
    else if(suffixCurrencies.includes(currecnyStored)) {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimal: ',',
        decimalPlaces: 2,
        suffix: ' '+symbol,
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
    else {
      const countUp = new CountUp(element.nativeElement, value, {
        duration: this.duration,
        separator: ' ',
        decimal: ',',
        decimalPlaces: 2,
        suffix: ' '+symbol,
      });
      if (!countUp.error) {
        countUp.start();
      }
    }
  }
}
