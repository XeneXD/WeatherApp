import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingsService } from './settings.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SettingsPage implements OnInit {
  @Output() temperatureUnitChange = new EventEmitter<string>();
  @Input() apiKey!: string;
  isDarkMode: boolean = false;
  isFahrenheit: boolean = false;

  constructor(private settingsService: SettingsService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.apiKey = environment.apiKey;
    if (!this.apiKey) {
      console.error('API key is missing in SettingsPage.');
      console.log('API Key:', localStorage.getItem('apiKey'));
    }

    const theme = this.settingsService.getTheme();
    this.isDarkMode = theme === 'dark';
    const temperatureUnit = this.settingsService.getTemperatureUnit();
    this.isFahrenheit = temperatureUnit === 'imperial';
  }

  onThemeToggle(event: any) {
  
    this.isDarkMode = event.detail.checked;
    const theme = this.isDarkMode ? 'dark' : 'light';
    this.settingsService.setTheme(theme);
  }

  onTemperatureToggle(event: any) {
   
    this.isFahrenheit = event.detail.checked;
    const temperatureUnit = this.isFahrenheit ? 'imperial' : 'metric';
    this.settingsService.setTemperatureUnit(temperatureUnit);
  }
}
