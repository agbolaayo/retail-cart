import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Since AppComponent is standalone and imports NavComponent, we import it here.
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'retail-cart'`, () => {
    expect(component.title).toEqual('retail-cart');
  });

  it('should render the NavComponent', () => {
    // The NavComponent's selector is 'app-nav'
    const navElement = fixture.debugElement.query(By.css('app-nav'));
    expect(navElement).toBeTruthy();
  });

  it('should render a router outlet', () => {
    // The router outlet is rendered as <router-outlet> in the DOM
    const routerOutletElement = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutletElement).toBeTruthy();
  });
});
