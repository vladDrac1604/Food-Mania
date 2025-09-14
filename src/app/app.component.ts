import { Component, Injectable, OnInit } from '@angular/core';
import { AuthService } from './user/user-auth-service';

@Injectable()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'shopping-list-app';
  loadedFeature='recipe-book';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this.authService.autoAuthenticateUser();
  }

  onNavigation(event: string){
    this.loadedFeature=event;
  }
}
