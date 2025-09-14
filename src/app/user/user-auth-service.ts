import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { Subject } from "rxjs";
import { Helper } from "../shared/Helper";

@Injectable({ providedIn: "root" })
export class AuthService {

  private authToken: string;
  private isAuthenticated: boolean = false;
  private authTokenStatusListener = new Subject<boolean>();
  private navExtras: NavigationExtras;
  private AuthTokenExpirationTimer: any;
  private loggedInUserId: string;

  constructor(private http: HttpClient, private router: Router, private helper: Helper) {}

  getUserId() {
    return this.loggedInUserId;
  }

  getAuthToken() {
    return this.authToken;
  }

  getAuthTokenStatusListener() {
    return this.authTokenStatusListener.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  userLogin(payload: any) {
     this.http.post<any>('http://localhost:8000/login', payload).subscribe((response) => {
      if(response.status == 'SUCCESS' && response.token) {
        this.authToken = response.token;
        this.loggedInUserId = response.userId;
        this.isAuthenticated = true;
        this.authTokenStatusListener.next(true);
        this.AuthTokenExpirationTimer = setTimeout(() => { this.userLogout() }, response.expiresIn * 1000);
        const expirationTimeDate = new Date((new Date()).getTime() + response.expiresIn * 1000);
        this.saveAuthData(this.authToken, expirationTimeDate, this.loggedInUserId);
        this.navExtras = {
          queryParams: { message: response.message, dataReload: 'Y', action: 'LOGIN', status: 'SUCCESS' }
        };
        this.router.navigate(['recipes'], this.navExtras);
      } else {
        this.helper.errorPopup(response.status, response.message);
      }
     })
  }

  userLogout() {
    this.authToken = null;
    this.isAuthenticated = false;
    this.loggedInUserId = null;
    this.authTokenStatusListener.next(false);
    clearTimeout(this.AuthTokenExpirationTimer);
    this.clearAuthData();
    this.navExtras = {
      queryParams: { message: "Logged out of the system", dataReload: 'Y', action: 'LOGOUT' }
    };
    this.router.navigate(['recipes'], this.navExtras);
  }

  saveAuthData(token: string, expiraionTime: Date, userId: string) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("expirationTime", expiraionTime.toString());
    localStorage.setItem("loggedInUserId", userId);
  }

  clearAuthData() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("loggedInUserId");
  }

  getAuthDataFromLocalStorage() {
    const token = localStorage.getItem("authToken");
    const expirationTime = localStorage.getItem("expirationTime");
    const userId = localStorage.getItem("loggedInUserId");
    if(!token || !expirationTime) {
      return null;
    } else {
      return {
        token: token,
        expirationTime: new Date(expirationTime),
        userId: userId
      }
    }
  }

  autoAuthenticateUser() {
    const authData = this.getAuthDataFromLocalStorage();
    if(authData != null) {
      const expiresIn = authData.expirationTime.getTime() - (new Date()).getTime();
      if(expiresIn > 0) {
        // auth token is not yet expired hence initializing login automatically
        this.authToken = authData.token;
        this.isAuthenticated = true;
        this.loggedInUserId = authData.userId;
        this.authTokenStatusListener.next(true);
        this.AuthTokenExpirationTimer = setTimeout(() => { this.userLogout() }, expiresIn);
      }
    }
  }

}
