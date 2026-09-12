import { fakeAsync, tick } from '@angular/core/testing';
import { SecurityService } from './security.service';
import { SECURITIES } from '../mocks/securities-mocks';

describe('SecurityService Task 1', () => {
  const service = new SecurityService();

  const abbott = SECURITIES.find(security => security.name.includes('Abbott'))!;

  for (const name of [abbott.name, 'Abbott', 'abbott', 'ABBOTT', 'AbBoTt', 'Laboratories', 'laboratories']) {
    it(`matches the stored Abbott security using "${name}" (case-insensitive substring)`, fakeAsync(() => {
      const result = jasmine.createSpy('result');
      service.getSecurities({ name }).subscribe(result);
      tick(1000);
      expect(result).toHaveBeenCalledOnceWith([abbott]);
    }));
  }

  it('returns no rows for a name with no substring match', fakeAsync(() => {
    const result = jasmine.createSpy('result');
    service.getSecurities({ name: 'no-such-security' }).subscribe(result);
    tick(1000);
    expect(result).toHaveBeenCalledOnceWith([]);
  }));

  for (const name of ['', undefined]) {
    it(`removes the name restriction for ${name === '' ? 'an empty' : 'an omitted'} name`, fakeAsync(() => {
      const result = jasmine.createSpy('result');
      service.getSecurities({ name }).subscribe(result);
      tick(1000);
      expect(result).toHaveBeenCalledOnceWith(SECURITIES);
    }));
  }

  it('treats limit as a count at nonzero offsets', fakeAsync(() => {
    const result = jasmine.createSpy('result');
    service.getSecurities({ skip: 10, limit: 5 }).subscribe(result);
    tick(1000);
    expect(result).toHaveBeenCalledOnceWith(SECURITIES.slice(10, 15));
  }));

  it('filters before paging and preserves false privacy', fakeAsync(() => {
    const result = jasmine.createSpy('result');
    service.getSecurities({ isPrivate: false, currencies: ['EUR'], skip: 1, limit: 3 }).subscribe(result);
    tick(1000);
    expect(result).toHaveBeenCalledOnceWith(SECURITIES.filter(s => !s.isPrivate && s.currency === 'EUR').slice(1, 4));
  }));

  it('returns an empty page beyond the results', fakeAsync(() => {
    const result = jasmine.createSpy('result');
    service.getSecurities({ skip: 100, limit: 10 }).subscribe(result);
    tick(1000);
    expect(result).toHaveBeenCalledOnceWith([]);
  }));
});
