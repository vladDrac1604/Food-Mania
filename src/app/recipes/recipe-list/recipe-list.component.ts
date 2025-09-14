import { Component, Injectable, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Helper } from 'src/app/shared/Helper';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/user/user-auth-service';

@Injectable()
@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes : any[] = [];
  searchForm: FormGroup;
  refreshBtnVisible: boolean = false;
  pageSize: number = 4;
  pageIndex: number = 1;
  totalRecords: number = 0;
  nextIndex: number = 1;
  numberOfPages: number= 0;
  previousIndex: number = 0;
  public isAuthenticated: boolean = false;
  private authTokenStatusSubs: Subscription;

  constructor(private router: Router,
    private currentRoute: ActivatedRoute,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private helper: Helper,
    private authService: AuthService) {}

  ngOnInit(): void {
    // checking if any user is logged in or not
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.authTokenStatusSubs = this.authService.getAuthTokenStatusListener().subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    )

    this.searchForm = new FormGroup({
      "dish": new FormControl(null, Validators.required)
    });
    this.callGetDishesApi(this.pageIndex, this.pageSize);

    // if any navigation is happening from some other component
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if(params["dataReload"] && params["dataReload"] == "Y") {
        this.callGetDishesApi(this.pageIndex, this.pageSize);
        if(params["action"] == 'SAVE') {
          this.helper.successPopup('Success', params["message"]);
          const id = params["data"];
          this.router.navigateByUrl(`/recipes/${id}`);
        } else if(params["action"] == 'DELETE') {
          if(params["status"] == 'SUCCESS') {
            this.helper.successPopup('Success', 'The selected dish has been deleted');
          } else {
            this.helper.errorPopup(params["status"], params["errMsg"]);
          }
        } else if(params["action"] == 'LOGIN' || params["action"] == 'REGISTER' ||  params["action"] == 'LOGOUT') {
          this.helper.successPopup('Success', params['message']);
        }
      }
    })
  }

  callGetDishesApi(pageIndex, pageSize) {
    this.http.get<any>(`http://localhost:8000/allDishes/${pageIndex}/${pageSize}`).subscribe((response) => {
      if(response.status == 'SUCCESS') {
        this.recipes = [];
        this.totalRecords = response.totalRecords,
        this.nextIndex = response.nextIndex,
        this.previousIndex = response.previousIndex,
        this.numberOfPages = response.numberOfPages,
        this.processResponseData(response.data);
      } else {
        this.recipes = [];
        this.resetPageParameters();
        this.helper.errorPopup("Failure", response.message);
      }
      return this.recipes.slice();
    });
  }

  onNewRecipe(){
    this.router.navigate(['new'], {relativeTo: this.currentRoute});
  }

  searchDishByInput() {
    let dish = this.searchForm.value['dish'];
    this.http.get<any>(`http://localhost:8000/dishSearch/${dish}/${this.pageIndex}/${this.pageSize}`).subscribe((response) => {
      if(response.status && response.status == 'SUCCESS') {
        this.recipes = [];
        this.totalRecords = response.totalRecords,
        this.nextIndex = response.nextIndex,
        this.previousIndex = response.previousIndex,
        this.numberOfPages = response.numberOfPages,
        this.processResponseData(response.data);
      } else {
        this.recipes = [];
        this.resetPageParameters();
        this.helper.errorPopup("Failure", response.message);
      }
      this.refreshBtnVisible = true;
      return this.recipes.slice();
    })
  }

  processResponseData(responseData) {
    for(let recipe of responseData) {
      let ingList = [];
      for(let ing of recipe.ingredients) {
        const newIng = { ingName: ing.name, amount: ing.quantity };
        ingList.push(newIng);
      }
      const newRecipe = new Recipe(recipe.name, recipe.description, recipe.imagePath, ingList, "", [], recipe.type);
      newRecipe.setId(recipe._id);
      this.recipes.push(newRecipe);
    }
  }

  refresh() {
    this.searchForm.reset();
    this.refreshBtnVisible = false;
    this.resetPageParameters();
    this.callGetDishesApi(this.pageIndex, this.pageSize);
  }

  resetPageParameters() {
    this.pageIndex = 1;
    this.pageSize = 4;
    this.nextIndex = 1;
    this.numberOfPages = 0;
    this.previousIndex = 0;
  }

  ngOnDestroy(): void {
    this.authTokenStatusSubs.unsubscribe();
  }

}
