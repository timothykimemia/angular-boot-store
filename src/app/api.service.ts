import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private SERVER_URL = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }

  public first = '';
  public prev = '';
  public next = '';
  public last = '';

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  parseLinkHeader(header: string) {
    if (header.length === 0) {
      return ;
    }

    const parts = header.split(',');
    const links = {};

    parts.forEach((p: string) => {
      const section = p.split(';');
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });

    this.first  = links["first"];
    this.last   = links["last"];
    this.prev   = links["prev"];
    this.next   = links["next"];
  }

  public sendGetRequestToUrl(url: string) {
    return this.httpClient.get(url, { observe: 'response'}).pipe(retry(3),
      catchError(this.handleError), tap(res => {
        console.log(res.headers.get('Link'));
        this.parseLinkHeader(res.headers.get('Link'));
      }));
  }

  public sendGetRequest() {
    // return this.httpClient.get(this.SERVER_URL + '/products').pipe(catchError(this.handleError));

    // Add safe, URL encoded _page and _limit parameters
    return this.httpClient.get(this.SERVER_URL + '/products', {
      params: new HttpParams({
        fromString: '_page=1&_limit=20'}),
        observe: 'response'}
        ).pipe(retry(3), catchError(this.handleError), tap(res => {
          console.log(res.headers.get('Link'));
          this.parseLinkHeader(res.headers.get('Link'));
        }));
  }
}
