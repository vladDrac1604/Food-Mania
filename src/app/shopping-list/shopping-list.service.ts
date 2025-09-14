import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";

export class ShoppingListService{

  startEditing= new Subject<number>();
  ingredientsChanged = new Subject<Ingredient[]>();

  private ingredients: Ingredient[]=[
    new Ingredient('Apples', 10),
    new Ingredient('Tomatoes', 5)
  ];

  getIngredients(){
    return this.ingredients;
  }

  getIngredient(index: number){
    return this.ingredients[index];
  }

  addIngredient(ing: Ingredient){
    this.ingredients.push(ing);
  }

  addIngredients(ing : Ingredient[]){
    for(let temp of ing){
      this.ingredients.push(temp);
    }
    this.ingredientsChanged.next(this.ingredients.slice());
  }

  updateItem(index: number, newItem: Ingredient){
    this.ingredients[index] = newItem;
  }

  deleteIngeredient(index: number){
    this.ingredients.splice(index, 1);
  }

}
