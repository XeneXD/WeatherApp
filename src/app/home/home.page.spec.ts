import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { environment } from '../../environments/environment';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage, IonicModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle temperature unit', () => {
    component.temperatureUnit = 'metric';
    component.toggleTemperatureUnit();
    expect(component.temperatureUnit).toBe('imperial');
  });

  it('should handle manual location submission', () => {
    spyOn(component, 'onManualLocationSubmit').and.callThrough();
    component.manualLocation = 'London';
    component.onManualLocationSubmit();
    expect(component.onManualLocationSubmit).toHaveBeenCalled();
  });
});
