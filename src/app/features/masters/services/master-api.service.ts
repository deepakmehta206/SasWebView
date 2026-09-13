import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MasterSelectOption } from '../models/master.definitions';

type OptionSource = 'countries' | 'states' | 'units-of-measure';

@Injectable({ providedIn: 'root' })
export class MasterApiService {
  private readonly api = inject(ApiService);

  getList<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Observable<T[]> {
    return this.api
      .get<ApiResponse<T[]>>(endpoint, params ? { params } : undefined)
      .pipe(map((response) => response.data ?? []));
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.api
      .get<ApiResponse<T>>(`${endpoint}/${id}`)
      .pipe(map((response) => response.data as T));
  }

  create<T>(endpoint: string, body: unknown): Observable<T> {
    return this.api
      .post<ApiResponse<T>>(endpoint, body)
      .pipe(map((response) => response.data as T));
  }

  update<T>(endpoint: string, id: number, body: unknown): Observable<T> {
    return this.api
      .put<ApiResponse<T>>(`${endpoint}/${id}`, body)
      .pipe(map((response) => response.data as T));
  }

  loadSelectOptions(source: OptionSource): Observable<MasterSelectOption[]> {
    if (source === 'countries') {
      return this.getList<Record<string, unknown>>('/countries', { isActive: true }).pipe(
        map((rows) =>
          rows.map((row) => ({
            value: Number(row['countryId']),
            label: `${row['countryCode']} — ${row['countryName']}`
          }))
        )
      );
    }

    if (source === 'states') {
      return this.getList<Record<string, unknown>>('/states', { isActive: true }).pipe(
        map((rows) =>
          rows.map((row) => ({
            value: Number(row['stateId']),
            label: `${row['stateCode']} — ${row['stateName']}`
          }))
        )
      );
    }

    return this.getList<Record<string, unknown>>('/units-of-measure', { isActive: true }).pipe(
      map((rows) =>
        rows.map((row) => ({
          value: Number(row['unitOfMeasureId']),
          label: `${row['uomCode']} — ${row['uomName']}`
        }))
      )
    );
  }
}
