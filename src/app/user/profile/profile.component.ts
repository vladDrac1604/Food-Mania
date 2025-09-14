import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Helper } from 'src/app/shared/Helper';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public userData: any = [];
  public addedDishes: any = [];
  public commentedPosts: any = [];
  public likedDishes: any = [];
  public displayData: any = [];
  public myPostsDisplay: boolean = true;
  public likedPostsDisplay: boolean = false;
  public commentedPostsDisplay: boolean = false;

  constructor(private actRoute: ActivatedRoute,
    private http: HttpClient,
    private helper: Helper) { }

  ngOnInit(): void {
    this.actRoute.queryParams.subscribe((params: Params) => {
      const id = params['id'];
      this.http.get<any>(`http://localhost:8000/userProfileData/${id.toString()}`).subscribe((response) => {
        if(response.status === "SUCCESS") {
          if(response.userData) {
            this.userData = response.userData;
          }
          if(response.addedDishes) {
            this.addedDishes = response.addedDishes;
            this.displayData = response.addedDishes;
          }
          if(response.likedDishes) {
            this.likedDishes = response.likedDishes;
          }
          if(response.commentedPosts) {
            this.commentedPosts = response.commentedPosts;
          }
        } else {
          this.helper.errorPopup(response.status, response.message);
        }
      })
    })
  }

  editUserInfo() {

  }

  myPostsSelected(data) {
    if(data.target.value === "on") {
      this.likedPostsDisplay = false;
      this.myPostsDisplay = true;
      this.commentedPostsDisplay = false;
      this.displayData = this.addedDishes;
    }
  }

  likedPostsSelected(data) {
    if(data.target.value === "on") {
      this.likedPostsDisplay = true;
      this.myPostsDisplay = false;
      this.commentedPostsDisplay = false;
      this.displayData = this.likedDishes;
    }
  }

  commentedPostsSelected(data) {
    if(data.target.value === "on") {
      this.likedPostsDisplay = false;
      this.myPostsDisplay = false;
      this.commentedPostsDisplay = true;
      this.displayData = this.commentedPosts;
    }
  }

}
