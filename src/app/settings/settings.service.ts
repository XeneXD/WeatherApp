import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private temperatureUnitSubject = new BehaviorSubject<'metric' | 'imperial'>(this.getTemperatureUnit());
  temperatureUnit$ = this.temperatureUnitSubject.asObservable();

  private themeSubject = new BehaviorSubject<'light' | 'dark'>(this.getTheme());
  theme$ = this.themeSubject.asObservable();

  setTemperatureUnit(unit: 'metric' | 'imperial') {
    this.temperatureUnitSubject.next(unit);
    localStorage.setItem('temperatureUnit', unit);
  }

  getTemperatureUnit(): 'metric' | 'imperial' {
    return (localStorage.getItem('temperatureUnit') as 'metric' | 'imperial') || 'metric';
  }

  setTheme(theme: 'light' | 'dark') {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  }

  private applyTheme(theme: 'light' | 'dark') {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.setAttribute('color-theme', theme);
  }

  saveWeatherData(data: any) {
    localStorage.setItem('weatherData', JSON.stringify(data));
  }

  getWeatherData(): any {
    const data = localStorage.getItem('weatherData');
    return data ? JSON.parse(data) : null;
  }
}