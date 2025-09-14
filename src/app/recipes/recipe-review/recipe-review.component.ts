import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-review',
  templateUrl: './recipe-review.component.html',
  styleUrls: ['./recipe-review.component.css']
})
export class RecipeReviewComponent implements OnInit {

  public comments: any[] = [];
  public commentForm: FormGroup;

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      'userId': new FormControl(null, Validators.required),
      'rating': new FormControl(null, Validators.required),
      'review': new FormControl(null, Validators.required)
    });
  }

  onSubmit() {
    console.log(this.commentForm.value);
  }

}
