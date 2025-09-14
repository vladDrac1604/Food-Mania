import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeReviewComponent } from './recipe-review.component';

describe('RecipeReviewComponent', () => {
  let component: RecipeReviewComponent;
  let fixture: ComponentFixture<RecipeReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipeReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
