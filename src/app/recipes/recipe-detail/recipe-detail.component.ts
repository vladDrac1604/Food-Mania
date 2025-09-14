import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/user/user-auth-service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { RecipeReviewComponent } from '../recipe-review/recipe-review.component';
import Swal from 'sweetalert2';

@Injectable()
@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  dish: any;
  id: number;
  public isAuthenticated: boolean = false;
  private authTokenStatusSubs: Subscription;
  public loggedInUserId: string = null;
  private comments: any = [];

  constructor(private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService) {}

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

    this.route.params.subscribe((params: Params) => {
        this.id = params['id'];
        this.http.get<any>(`http://localhost:8000/dishes/${this.id}`).subscribe((response) => {
          const data = response.data;
          let ingList = [];
          for(let x of data.ingredients) {
            const ing = { ingName: x.name, amount: x.quantity };
            ingList.push(ing);
          }
          const creatorId = !data.userId ? null : data.userId;
          const recipe = new Recipe(data.name, data.description, data.imagePath, ingList, creatorId, data.likes, data.type);
          this.comments = data.comments ? data.comments : [];
          recipe.setId(data._id);
          this.dish = recipe;
        })
      }
    )
  }

  openCommentsPopup() {
    this.dialog.open(RecipeReviewComponent, {
      width: '400px',
      data: this.comments
    });
  }

  onEditRecipe() {
    const extras: NavigationExtras = {
      queryParams: { id: this.id },
      relativeTo: this.route,
    };
    this.router.navigate(['edit'], extras);
  }

  onDeleteRecipe(dish){
    Swal.fire({
      title: 'Warning!',
      text: 'Are you sure you want to delete this dish ?',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    }).then((action) => {
      if(action.isConfirmed) {
        this.http.get<any>(`http://localhost:8000/deleteDish/${dish.id}`).subscribe((response) => {
          let extras: NavigationExtras;
          if(response.status && response.status == 'SUCCESS') {
              extras = {
                queryParams: { dataReload: "Y", action: 'DELETE', status: response.status },
                relativeTo: this.route,
              };
          } else {
            extras = {
              queryParams: { dataReload: "Y", action: 'DELETE', errMsg: response.message, status: response.status  },
              relativeTo: this.route,
            };
          }
          this.router.navigate(['../'], extras);
        })
      }
    })
  }

  hideActionButtons(creatorId: string) {
    if(!this.isAuthenticated || !creatorId) {
      return true;
    }
    if(this.isAuthenticated && creatorId && creatorId != this.loggedInUserId) {
      return true;
    }
    return false;
  }

  onLikeClicked() {
    if(this.loggedInUserId) {
      const payload = {
        dishId: this.dish.id,
        userId: this.loggedInUserId
      }
      this.http.post<any>("http://localhost:8000/postLiked", payload).subscribe((response) => {
        console.log(response);
        if(response.status == "SUCCESS") {
          if(response.message == "You liked this post") {
            this.dish.likes.push(this.loggedInUserId);
          } else {
            const updatedList = this.dish.likes.filter(id => id !== this.loggedInUserId);
            this.dish.likes = updatedList;
          }
        }
      });
    }
  }

}
