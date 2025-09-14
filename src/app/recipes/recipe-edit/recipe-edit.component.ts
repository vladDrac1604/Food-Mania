import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { Helper } from 'src/app/shared/Helper';
import { HttpClient } from '@angular/common/http';
import { mimeValidator } from './mime-type.validator';
import { AuthService } from 'src/app/user/user-auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  selectedDishID: string;
  editMode: Boolean = false;
  recipeForm: FormGroup;
  imagePreview: any = null;
  public isAuthenticated: boolean = false;
  private authTokenStatusSubs: Subscription;
  loggedInUserId: string = null;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private helper: Helper) {}

  ngOnInit(): void {
    // checking if any user is logged in or not
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.loggedInUserId = this.authService.getUserId();
    this.authTokenStatusSubs = this.authService.getAuthTokenStatusListener().subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.loggedInUserId = this.authService.getUserId();
      }
    )

    this.recipeForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'imagePath': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeValidator]
      }),
      'description': new FormControl(null, Validators.required),
      'type': new FormControl('veg', Validators.required),
      'ingredients': new FormArray([])
    });
    this.route.queryParams.subscribe((params: Params) => {
      this.id = params['id'];
      if(params['id'] != null) {
        this.editMode = true;
      } else {
        this.editMode = false;
      }
    });
    this.initForm();
  }

  createIngredient(): FormGroup {
    return this.fb.group({});
  }

  private initForm() {
    let recipeIngredients = new FormArray([]);
    if(this.editMode) {
      this.http.get<any>(`http://localhost:8000/dishes/${this.id}`).subscribe((response) => {
       if(response.status == 'SUCCESS') {
        const data = response.data;
        if(data.ingredients && data.ingredients.length > 0) {
          for(let ingredient of data.ingredients) {
            recipeIngredients.push( new FormGroup({
            'ingName': new FormControl(ingredient.name, Validators.required),
            'amount': new FormControl(+ingredient.quantity, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)
            ])
          }))
          }
        }
        this.recipeForm.patchValue({
          'name': data.name,
          'imagePath': data.imagePath,
          'description': data.description,
          'type': data.type
        });
        this.imagePreview = data.imagePath;
        this.selectedDishID = data._id;
        console.log(this.recipeForm.value, this.imagePreview);
        this.recipeForm.setControl('ingredients', recipeIngredients);
       }
      })
    }
  }

  dishTypeChanged(ev) {
    this.recipeForm.get("type").setValue(ev.target.value);
  }


  onSubmit(){
    const payload = new FormData();
    payload.append("name", this.recipeForm.value['name']);
    payload.append("description", this.recipeForm.value['description']);
    payload.append("ing", JSON.stringify(this.recipeForm.value['ingredients']));
    payload.append("type", this.recipeForm.value['type']);
    payload.append("imagePath", this.recipeForm.value['imagePath'], this.recipeForm.value['name'].toString());
    if(this.editMode) {
      if(!this.selectedDishID) {
        this.helper.errorPopup("ERROR", "Please select a dish first to edit.");
        return;
      }
      payload.append("id", this.selectedDishID);
      this.callAddOrEditApi("http://localhost:8000/dishes/edit", payload);
    } else {
      payload.append("creatorId", this.loggedInUserId);
      this.callAddOrEditApi("http://localhost:8000/dishes", payload);
    }
  }

  callAddOrEditApi(url, payload) {
    this.http.post<any>(url, payload).subscribe((response) => {
      if(response.status == 'SUCCESS') {
        const extras: NavigationExtras = {
          queryParams: { dataReload: "Y", data: response.data._id, action: 'SAVE', message: response.message },
          relativeTo: this.route,
        };
        this.router.navigate(['../'], extras);
      } else {
        this.onCancel();
      }
    });
  }

  get controls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'ingName': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    )
  }

  onRemoveIngredient(ev) {
    const index = this.recipeForm.get('ingredients').value.findIndex(ingredient => ingredient.ingName == ev.value.ingName);
    if(index !== -1) {
      (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
    } else {
      console.log("Cannot find ingredient to remove!");
    }
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onImagePicked(ev: Event) {
    const file = (ev.target as HTMLInputElement).files[0];
    this.recipeForm.patchValue({imagePath: file});
    this.recipeForm.get('imagePath').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    }
    reader.readAsDataURL(file);
  }

}
