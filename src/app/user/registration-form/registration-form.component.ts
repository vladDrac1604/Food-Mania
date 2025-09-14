import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { mimeValidator } from 'src/app/recipes/recipe-edit/mime-type.validator';
import { Helper } from 'src/app/shared/Helper';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  @ViewChild('profilePicInput') profilePicInput!: ElementRef<HTMLInputElement>;
  searchParam: string = "Burger Pizza";
  displayImagePath: string = "";
  regiterForm: FormGroup;

  constructor(private http: HttpClient, private helper: Helper, private router: Router) { }

  ngOnInit(): void {
    this.regiterForm = new FormGroup({
      fullName: new FormControl(null, Validators.required),
      username: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_@]+$')
      ])),
      emailAddress: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_@]+$')
      ])),
      profilePic: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeValidator]
      }),
    });

    // CALLING UNSPLASH API TO GET AN IMAGE
    this.http.get<any>(`https://api.unsplash.com/search/photos?page=${this.helper.getRandomPageNum()}&query=${this.searchParam}&client_id=${this.helper.getUnsplashKey()}`)
    .subscribe((response) => {
      if(response.results && response.results.length > 0) {
        const resuts = response.results;
        const randomIndex =  Math.floor(Math.random() * ((resuts.length - 1) - 1) + 1);
        this.displayImagePath = resuts[randomIndex].urls.full;
      }
    })
  }

  resetForm() {
    this.regiterForm.reset();
    this.profilePicInput.nativeElement.value= "";
  }

  submitForm() {
    const payload = new FormData();
    payload.append("name", this.regiterForm.value.fullName);
    payload.append("username", this.regiterForm.value.username);
    payload.append("password", this.regiterForm.value.password);
    payload.append("emailId", this.regiterForm.value.emailAddress);
    payload.append("imagePath", this.regiterForm.value.profilePic, this.regiterForm.value.fullName.toString());
    this.http.post<any>('http://localhost:8000/userRegistration', payload).subscribe((response) => {
      if(response.status == "SUCCESS") {
        const extras: NavigationExtras = {
          queryParams: { message: response.message, dataReload: 'Y', action: 'REGISTER' }
        };
        this.router.navigate(['recipes'], extras);
      } else {
        this.helper.errorPopup(response.status, response.message);
      }
    })
  }

  onImagePicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files[0];
    this.regiterForm.patchValue({profilePic: file});
    this.regiterForm.get('profilePic').updateValueAndValidity();
  }

}
