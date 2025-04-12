import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../settings/settings.service';
import { Network } from '@capacitor/network';
import { environment } from '../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  apiKey: string = '';
  temperatureUnit: 'metric' | 'imperial' = 'metric';
  weatherData: any = null;
  forecastData: any = [];
  hourlyData: any[] = [];
  errorMessage: string | null = null;
  private watchId: string | null = null;
  manualLocation: string = '';
  isOnline: boolean = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.apiKey = environment.apiKey;
    if (!this.apiKey) {
      this.handleError('API key is missing.');
      return;
    }


    try {
        console.log('Starting HomePage...');
        this.apiKey = environment.apiKey;
        console.log('API key:', this.apiKey);
      } catch (e) {
        console.error('Startup error in HomePage', e);
      }

      this.weatherData = {
          locationName: 'Testville',
          temperature: 26,
          weatherDescription: 'Sunny',
          humidity: 40,
          windSpeed: 5,
          weatherIcon: '',
        };

        
       this.cd.detectChanges();
       console.log('Weather Data:', this.weatherData);
    this.settingsService.theme$.subscribe((theme: 'light' | 'dark') => {
      this.applyTheme(theme);
    });


    const status = await Network.getStatus();
    this.isOnline = status.connected;

    
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;
      if (this.isOnline) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
    });

    this.temperatureUnit = this.settingsService.getTemperatureUnit();

    const cachedWeatherData = this.settingsService.getWeatherData();
    if (cachedWeatherData) {
      this.weatherData = cachedWeatherData;
    }

    if (this.isOnline) {
      this.startLocationWatcher();
      this.settingsService.temperatureUnit$.subscribe((unit: 'metric' | 'imperial') => {
        this.temperatureUnit = unit;
        if (this.weatherData) {
          const { lat, lon } = this.weatherData;
          this.fetchWeatherData(lat, lon);
        }
      });
    } else {
      this.handleOffline();
    }
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  private handleOnline() {
    this.errorMessage = null;
    if (this.weatherData && this.weatherData.lat !== undefined && this.weatherData.lon !== undefined) {
      this.fetchWeatherData(this.weatherData.lat, this.weatherData.lon);
    } else {
      this.startLocationWatcher();
    }
  }

  private handleOffline() {
    this.errorMessage = 'You are offline. Displaying cached data.';
  }

  private async startLocationWatcher() {
    
    try {
      this.watchId = await Geolocation.watchPosition({}, (position, error) => {
        if (error) {
          this.handleError('Failed to get location updates.', error);
          return;
        }

        if (position) {
          const { latitude, longitude } = position.coords;
          this.fetchWeatherData(latitude, longitude);
        }
      });
    } catch (error) {
      this.handleError('Failed to start location watcher.', error);
    }
  }

  private fetchWeatherData(lat: number | undefined, lon: number | undefined) {
    if (!this.apiKey || lat === undefined || lon === undefined) {
      this.handleError('Invalid location or API key.');
      return;
    }
  
    const unit = this.temperatureUnit;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${unit}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${unit}`;
  
    console.log('Fetching weather data from:', currentWeatherUrl);
  
    this.http.get<any>(currentWeatherUrl).subscribe(
      (data) => {
        console.log('Weather data fetched:', data);
        this.weatherData = {
          locationName: data.name || 'Unknown Location',
          temperature: data.main.temp,
          weatherDescription: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          lat: data.coord.lat,
          lon: data.coord.lon,
        };
        this.cd.detectChanges();
        this.settingsService.saveWeatherData(this.weatherData);
        this.errorMessage = null;
      },
      (error) => {
        console.error('Failed to fetch current weather data:', error);
        this.handleError('Unable to fetch weather data. Please try again later.');
      }
    );
  
    this.http.get<any>(forecastUrl).subscribe(
      (data) => this.handleForecastData(data),
      (error) => {
        console.error('Failed to fetch forecast data:', error);
        this.handleError('Unable to fetch forecast data. Please try again later.');
      }
    );
  }

  private handleForecastData(data: any) {
    
    if (data?.list?.length) {
      this.forecastData = data.list
        .filter((_: any, index: number) => index % 8 === 0)
        .map((item: any) => ({
          date: item.dt_txt,
          temperature: item.main.temp,
          condition: item.weather[0].description,
        }));

      this.hourlyData = data.list.slice(0, 8).map((item: any) => ({
        time: item.dt_txt,
        temperature: item.main.temp,
        condition: item.weather[0].description,
      }));
    } else {
      this.forecastData = null;
      this.hourlyData = [];
      this.handleError('Invalid forecast data received from the API.');
    }
  }

  onManualLocationSubmit() {
    
    if (!this.manualLocation.trim()) {
      this.handleError('Please enter a valid location.');
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.manualLocation}&appid=${this.apiKey}&units=${this.temperatureUnit}`;
    this.http.get<any>(url).subscribe(
      (data) => {
        const { lat, lon } = data.coord;
        this.fetchWeatherData(lat, lon);
      },
      (error) => this.handleError('Failed to fetch weather data for the entered location', error)
    );
  }

  toggleTemperatureUnit() {
    this.temperatureUnit = this.temperatureUnit === 'metric' ? 'imperial' : 'metric';
    if (this.weatherData) {
      const { lat, lon } = this.weatherData;
      this.fetchWeatherData(lat, lon);
    } else {
      this.handleError('No weather data available to switch temperature units.');
    }
  }

  updateTemperatureUnit(unit: 'metric' | 'imperial') {
    this.settingsService.setTemperatureUnit(unit);
    if (this.weatherData && this.weatherData.lat !== undefined && this.weatherData.lon !== undefined) {
      this.fetchWeatherData(this.weatherData.lat, this.weatherData.lon);
    } else {
      this.handleError('No valid location data available to switch temperature units.');
    }
  }

  private handleError(message: string, error?: any) {
    console.error(message, error || '');
    this.errorMessage = message || 'An error occurred.';
  }

  navigateToSettings() {
    this.router.navigate(['/settings'], {
      queryParams: { temperatureUnit: this.temperatureUnit },
    });
  }

  private applyTheme(theme: 'light' | 'dark') {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.setAttribute('color-theme', theme);
  }
}



