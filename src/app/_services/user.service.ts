import { User } from '../_models/user';
import { Observable, throwError } from 'rxjs';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiUrl;

  constructor(private http: Http) {}


  getUsers(): Observable<User[]> {
    return this.http
    .get(this.baseUrl + 'users', this.jwt())
    .pipe(map(response => <User[]>response.json(),
    catchError(this.handleError)));
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


  setMainPhoto(userId: number, id: number){
    // tslint:disable-next-line:max-line-length
    return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {}, this.jwt()).pipe(catchError(this.handleError));
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
