import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SettingsService } from './settings/settings.service';

@Component({
  selector: 'app-root',
  template: `<ion-app>
               <ion-router-outlet></ion-router-outlet>
             </ion-app>`,
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.theme$.subscribe((theme: 'light' | 'dark') => {
      this.applyTheme(theme);
    });
  }

  private applyTheme(theme: 'light' | 'dark') {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.setAttribute('color-theme', theme);
  }
}