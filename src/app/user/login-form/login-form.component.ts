import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Helper } from 'src/app/shared/Helper';
import { AuthService } from '../user-auth-service';

@Injectable()
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  searchParam: string = "Burger Pizza";
  displayImagePath: string = "";
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(private http: HttpClient,
    private helper: Helper,
    private router: Router,
    private authService: AuthService)
  {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });

    // CALLING UNSPLASH API TO GET AN IMAGE
    this.http.get<any>(`https://api.unsplash.com/search/photos?page=${this.helper.getRandomPageNum()}&query=${this.searchParam}&client_id=${this.helper.getUnsplashKey()}`)
    .subscribe((response) => {
      if(response.results && response.results.length > 0) {
        const resuts = response.results;
        const randomIndex =  Math.floor(Math.random() * ((resuts.length - 1) - 1) + 1);
        this.displayImagePath = resuts[randomIndex].urls.regular;
      }
    })
  }

  resetForm() {
    this.loginForm.reset();
  }

  submitForm() {
    this.authService.userLogin(this.loginForm.value);
  }

  showPasswordCheck(event: any) {
    if(event.target.checked) {
      this.showPassword = true;
    } else {
      this.showPassword = false;
    }
  }

}
