import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { map, catchError} from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from 'src/app/_models/user';


@Injectable()
export class AuthService {
    baseUrl = 'http://localhost:5000/api/auth/';
    userToken: any;
    decodedToken: any;
    currentUser: User;
    private photoUrl = new BehaviorSubject<string>('../../assets/user.png');
    currentPhotoUrl = this.photoUrl.asObservable();


    constructor(private http: Http, public jwtHelper: JwtHelperService) {}


    changeMemberPhoto(photoUrl: string) {
        this.photoUrl.next(photoUrl);
    }


    login(model: any) {
        return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).pipe(map((response: Response) => {
            const user = response.json();
            if (user) {
                localStorage.setItem('token', user.tokenString);
                localStorage.setItem('user', JSON.stringify(user.user));
                this.userToken = user.tokenString;
                this.decodedToken = this.jwtHelper.decodeToken(user.tokenString);
                this.currentUser = user.user;
                this.userToken = user.tokenString;
                if (this.currentUser.photoUrl !== null) {
                this.changeMemberPhoto(this.currentUser.photoUrl);
            } else {
                this.changeMemberPhoto('../../assets/user.png');
            }
            }
        }), catchError(this.handleError));
    }

    register(user: any) {
        return this.http.post(this.baseUrl + 'register', user, this.requestOptions()).pipe(catchError(this.handleError));
    }


    loggedIn() {
        return !this.jwtHelper.isTokenExpired();
    }



    private requestOptions() {
        const headers = new Headers({'Content-type' : 'application/json'});
        return new RequestOptions({ headers: headers});
    }

    private handleError(error: any) {
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
