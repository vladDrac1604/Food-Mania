import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../user/user-auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authListenerSubs: Subscription;
  public isAuthenticated: boolean = false;
  private loggedInUserId: any = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.loggedInUserId = this.authService.getUserId();
    this.authListenerSubs = this.authService.getAuthTokenStatusListener().subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    )
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

  logout() {
    this.authService.userLogout();
  }

  goToProfile() {
    const extras: NavigationExtras = {
      queryParams: { id: this.loggedInUserId }
    };
    this.router.navigate(['profile'], extras);
  }

}
