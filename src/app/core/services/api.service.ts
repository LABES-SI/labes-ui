import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(
    endpoint: string,
    params?: HttpParams | Record<string, string | number | boolean>,
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params });
  }

  post<T>(
    endpoint: string,
    body: unknown,
    headers?: HttpHeaders | Record<string, string | string[]>,
  ): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, { headers });
  }

  put<T>(
    endpoint: string,
    body: unknown,
    headers?: HttpHeaders | Record<string, string | string[]>,
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, { headers });
  }

  patch<T>(
    endpoint: string,
    body: unknown,
    headers?: HttpHeaders | Record<string, string | string[]>,
  ): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, { headers });
  }

  delete<T>(
    endpoint: string,
    params?: HttpParams | Record<string, string | number | boolean>,
  ): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), { params });
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return `${this.baseUrl}/${cleanEndpoint}`;
  }
}
