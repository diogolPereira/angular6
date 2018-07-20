import { User } from './../_models/user';
import { Observable, throwError } from 'rxjs';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/_models/pagination';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiUrl;

  constructor(private http: Http) {}


  getUsers(page?: number, itemsPerPage?: number, userParams?: any) {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
    let queryString = '?';

    if (page != null && itemsPerPage != null) {
      queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage + '&';
    }
    if (userParams != null) {
      queryString +=
      'minAge=' + userParams.minAge +
      '&maxAge=' + userParams.maxAge +
      '&gender=' + userParams.gender +
      '&orderBy=' + userParams.orderBy;
    }
    return this.http
    .get(this.baseUrl + 'users' + queryString, this.jwt())
    .pipe(map((response: Response) => {
      paginatedResult.result = response.json();
      if (response.headers.get('Pagination') != null) {
        paginatedResult.pagination = JSON.parse(
          response.headers.get('Pagination')
        );
        }
      return paginatedResult;
    }), catchError(this.handleError));

  }

  getUser(id): Observable<User> {
    return this.http
      .get(this.baseUrl + 'users/' + id, this.jwt())
      .pipe(map(response => <User>response.json(),
      catchError(this.handleError)));
  }


  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + 'users/' + id, user, this.jwt()).pipe(catchError(this.handleError));
  }


  setMainPhoto(userId: number, id: number) {
    // tslint:disable-next-line:max-line-length
    return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {}, this.jwt()).pipe(catchError(this.handleError));
  }

  deletePhoto(userId: number, id: number) {
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + id , this.jwt()).pipe(catchError(this.handleError));
  }


  private jwt() {
    // tslint:disable-next-line:prefer-const
    let token = localStorage.getItem('token');
    if (token) {
      // tslint:disable-next-line:prefer-const
      let headers = new Headers({'Authorization': 'Bearer ' + token});
      headers.append('Content-Type', 'application/json');
      return new RequestOptions({ headers: headers });
    }
  }

  private handleError(error: any) {
    // tslint:disable-next-line:no-debugger
    debugger;
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
        return throwError(applicationError);
    }
    const serverError = error.json();
    let modelStateErrors = '';
    if (serverError) {
        for (const key in serverError) {
            if (serverError[key]) {
                modelStateErrors += serverError[key] + '\n';
            }
        }
    }
    return throwError(
        modelStateErrors || 'Server error'
    );
}
}