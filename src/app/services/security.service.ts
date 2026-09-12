import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Security } from '../models/security';
import { SECURITIES } from '../mocks/securities-mocks';
import { SecuritiesFilter } from '../models/securities-filter';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  getTypesOptions(): string[] {
    return [...new Set(SECURITIES.map(security => security.type))].sort();
  }

  getCurrenciesOptions(): string[] {
    return [...new Set(SECURITIES.map(security => security.currency))].sort();
  }

  /**
   * Get Securities server request mock.
   * Name matching is case-insensitive substring matching; an omitted or empty name imposes no name restriction.
   * */
  getSecurities(securityFilter?: SecuritiesFilter): Observable<Security[]> {
    const filteredSecurities = this._filterSecurities(securityFilter).slice(
      securityFilter?.skip ?? 0,
      (securityFilter?.skip ?? 0) + (securityFilter?.limit ?? 100)
    );

    return of(filteredSecurities).pipe(delay(1000));
  }

  private _filterSecurities(
    securityFilter: SecuritiesFilter | undefined
  ): Security[] {
    if (!securityFilter) return SECURITIES;

    const name = securityFilter.name?.toLowerCase();

    return SECURITIES.filter(
      (security) =>
        (!name || security.name.toLowerCase().includes(name)) &&
        (!securityFilter.types ||
          securityFilter.types.some((type) => security.type === type)) &&
        (!securityFilter.currencies ||
          securityFilter.currencies.some(
            (currency) => security.currency == currency
          )) &&
        (securityFilter.isPrivate === undefined ||
          securityFilter.isPrivate === security.isPrivate)
    );
  }
}
