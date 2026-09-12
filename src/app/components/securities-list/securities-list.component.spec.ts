import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { SecuritiesListComponent } from './securities-list.component';
import { SecurityService } from '../../services/security.service';
import { Security } from '../../models/security';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { SecuritiesFilter } from '../../models/securities-filter';

const row = (name: string): Security => ({ id: name, name, type: 'Equity', currency: 'EUR', isPrivate: false });

describe('SecuritiesListComponent', () => {
  let fixture: ComponentFixture<SecuritiesListComponent>;
  let service: jasmine.SpyObj<SecurityService>;
  let requests: Subject<Security[]>[];
  const button = (label: string): HTMLButtonElement => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(b => b.textContent?.trim() === label)!;
  const filter = (value: SecuritiesFilter) => fixture.debugElement.query(By.directive(FilterBarComponent)).componentInstance.filterChange.emit(value);
  const resolve = (count = 11) => { requests[requests.length - 1].next(Array.from({ length: count }, (_, i) => row(`Security ${i}`))); fixture.detectChanges(); };

  beforeEach(async () => {
    requests = [];
    service = jasmine.createSpyObj<SecurityService>('SecurityService', ['getSecurities', 'getCurrenciesOptions', 'getTypesOptions']);
    service.getCurrenciesOptions.and.returnValue(['EUR']);
    service.getTypesOptions.and.returnValue(['Equity']);
    service.getSecurities.and.callFake(() => { const request = new Subject<Security[]>(); requests.push(request); return request; });
    await TestBed.configureTestingModule({ imports: [SecuritiesListComponent], providers: [provideNoopAnimations(), { provide: SecurityService, useValue: service }] }).compileComponents();
    fixture = TestBed.createComponent(SecuritiesListComponent);
    fixture.detectChanges();
  });

  it('sends debounced text from the rendered filter bar to the service', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '  Equity  ';
    input.dispatchEvent(new Event('input'));
    tick(299);
    expect(service.getSecurities).toHaveBeenCalledTimes(1);
    tick(1);
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ name: 'Equity', skip: 0, limit: 11 });
  }));

  it('loads one extra row, renders only the page, and disables Next on the last page', () => {
    expect(service.getSecurities).toHaveBeenCalledWith({ skip: 0, limit: 11 });
    expect(button('Next').disabled).toBeTrue();
    resolve();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(10);
    expect(button('Next').disabled).toBeFalse();
    button('Next').click();
    resolve(2);
    expect(button('Next').disabled).toBeTrue();
  });

  it('preserves criteria on page changes and resets on filter and page-size changes', () => {
    filter({ name: 'Security', types: ['Equity'], isPrivate: false });
    resolve();
    button('Next').click();
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ name: 'Security', types: ['Equity'], isPrivate: false, skip: 10, limit: 11 });
    resolve();
    const selects = fixture.debugElement.queryAll(By.directive(MatSelect));
    selects[selects.length - 1].componentInstance.selectionChange.emit({ value: 25 });
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ name: 'Security', types: ['Equity'], isPrivate: false, skip: 0, limit: 26 });
    resolve(26);
    button('Next').click();
    filter({ currencies: ['EUR'] });
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ currencies: ['EUR'], skip: 0, limit: 26 });
    filter({});
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ skip: 0, limit: 26 });
  });

  it('returns to the first page with criteria intact and disables navigation while loading', () => {
    const criteria = { name: 'Security', currencies: ['EUR'], isPrivate: false };
    filter(criteria);
    resolve();
    expect(button('Previous').disabled).toBeTrue();
    button('Next').click();
    fixture.detectChanges();
    expect(button('Previous').disabled).toBeTrue();
    expect(button('Next').disabled).toBeTrue();
    resolve();
    button('Previous').click();
    expect(service.getSecurities.calls.mostRecent().args[0]).toEqual({ ...criteria, skip: 0, limit: 11 });
    resolve(0);
    expect(button('Previous').disabled).toBeTrue();
    const calls = service.getSecurities.calls.count();
    button('Previous').click();
    expect(service.getSecurities.calls.count()).toBe(calls);
    expect(fixture.nativeElement.querySelector('td[colspan="3"]')).toBeTruthy();
  });

  it('unsubscribes obsolete requests and only renders the latest response', () => {
    const obsolete = requests[0];
    filter({ name: 'latest' });
    expect(obsolete.observed).toBeFalse();
    requests[1].next([row('latest')]);
    obsolete.next([row('obsolete')]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('latest');
    expect(fixture.nativeElement.textContent).not.toContain('obsolete');
  });

  it('recovers from errors through retry and subsequent filter changes', () => {
    requests[0].error(new Error('Failed'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    button('Retry').click();
    resolve(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    filter({ name: 'none' });
    resolve(0);
    expect(fixture.nativeElement.textContent).toContain('No matching securities.');
  });
});

describe('SecuritiesListComponent name filtering with the real mock service', () => {
  it('renders Abbott after a partial-name request and restores rows when cleared', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [SecuritiesListComponent],
      providers: [provideNoopAnimations()],
    });
    const fixture = TestBed.createComponent(SecuritiesListComponent);
    const service = TestBed.inject(SecurityService);
    const request = spyOn(service, 'getSecurities').and.callThrough();
    fixture.detectChanges();
    tick(1000);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Abbott';
    input.dispatchEvent(new Event('input'));
    tick(1300);
    fixture.detectChanges();
    expect(request.calls.mostRecent().args[0]).toEqual({ name: 'Abbott', skip: 0, limit: 11 });
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Abbott Laboratories');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    tick(1300);
    fixture.detectChanges();
    expect(request.calls.mostRecent().args[0]).toEqual({ skip: 0, limit: 11 });
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(10);
  }));
});
