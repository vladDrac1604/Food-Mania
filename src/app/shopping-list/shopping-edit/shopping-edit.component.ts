import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') slForm: NgForm;
  subscription: Subscription;
  editMode = false;
  editedItemIndex: number;
  editItem: Ingredient;

  constructor(private shoppingService: ShoppingListService) { }

  ngOnInit(): void {
    this.subscription = this.shoppingService.startEditing.subscribe(
      (index: number) => {
        this.editMode = true;
        this.editedItemIndex = index;
        this.editItem = this.shoppingService.getIngredient(index);
        this.slForm.setValue({
          name: this.editItem.ingName,
          amount: this.editItem.amount
        })
      }
    );
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }

  onAddItem(f: NgForm){
    const value = f.value;
    const ing = new Ingredient(value.name, value.amount);
    if(this.editMode){
      this.shoppingService.updateItem(this.editedItemIndex, ing);
    }else{
      this.shoppingService.addIngredient(ing);
    }
    this.editMode = false;
    f.reset();
  }

  onClear(){
    this.slForm.reset();
    this.editMode = false;
  }

  onDelete(){
    this.onClear();
    this.shoppingService.deleteIngeredient(this.editedItemIndex);
  }

}
