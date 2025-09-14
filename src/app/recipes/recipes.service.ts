import { Recipe } from "./recipe.model";
import { EventEmitter, Injectable } from "@angular/core"
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class RecipeService{

  recipeChanged = new Subject<Recipe[]>();
  recipeSelected = new EventEmitter<Recipe>();
  private recipes : Recipe[] = [];

  // private dummmyRecipes : Recipe[] = [
  //   new Recipe('Chicken Noodles', 'Chicken noodles are a delicious flavor packed meal of stir fried noodles, chicken, vegetables and sauces. Made in Chinese Hakka Style!',
  //   'https://www.cubesnjuliennes.com/wp-content/uploads/2020/06/Spicy-Chicken-Hakka-Noodles-Recipe.jpg', [{ingName: 'Chicken',amount:  1}, {ingName: 'baby tomato', amount: 2}, {ingName: 'onion', amount: 2}, {ingName: 'vinegar', amount: 1}, {ingName: 'noodles', amount: 1}, {ingName: 'capsicum', amount: 1}, {ingName: 'olive', amount: 2}]),
  //   new Recipe('Honey chilli potato', ' Fried chilli potato fingers are tossed in a sesame honey chilli sauce that is sweet and spicy and will give you sticky fingers that you will be licking clean! Easy to make and a really healthy snack which is heavy and filled with nutrients.',
  //    'https://vegecravings.com/wp-content/uploads/2023/08/Honey-Chilli-Potato-Recipe-Step-By-Step-Instructions-scaled.jpg', [{ingName: 'potato',amount:  2}, {ingName: 'honey', amount: 1}, {ingName: 'green chilli', amount: 2}, {ingName: 'red chilli', amount: 1}, {ingName: 'vinegar', amount: 1}, {ingName: 'soya sause', amount: 1}]),
  //   new Recipe('Red Sause Pasta', 'A  classical italian red coloured pasta made with homemade red pasta sauce. it is one of the traditional italian cuisine recipe known for its, taste, flavour and creaminess in each bite.',
  //   'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2014/4/8/2/FNM_050114-Classic-Red-Sauce-Recipe_s4x3.jpg.rend.hgtvcom.616.462.suffix/1397491331300.jpeg', [{ingName: 'capsicum',amount:  1}, {ingName: 'garlic', amount: 1}, {ingName: 'basil', amount: 2}, {ingName: 'tomato sause', amount: 1}, {ingName: 'pasta', amount: 1}]),
  //   new Recipe('White Sause Pasta', 'White sauce pasta is one of the easiest pasta recipes that you can make. It is also one of the most popular pasta recipes. You can make the classic white sauce pasta or make it more colorful and nutritious by adding some vegetables.',
  //   'https://www.whiskaffair.com/wp-content/uploads/2021/05/White-Sauce-Paste-2-3.jpg', [{ingName: 'milk', amount: 1}, {ingName: 'butter', amount: 1}, {ingName: 'alfredo sause', amount: 1}, {ingName: 'pasta', amount: 1}]),
  //   new Recipe('Margherita Pizza', 'Pizza Margherita (pronounced mahr-geh-ree-tah) is basically a Neapolitan pizza, typically made with tomatoes, mozzarella cheese, garlic, fresh basil, and extra-virgin olive oil. Think of it as a sophisticated version of your basic cheese pizza and also a wonderful Caprese salad, but with a crust.',
  //   'https://www.vegrecipesofindia.com/wp-content/uploads/2020/12/margherita-pizza-recipe-1.jpg', [{ingName: 'pizza base', amount: 1}, {ingName: 'modzarella cheese', amount: 1}, {ingName: 'olive oil', amount: 1}, {ingName: 'basil', amount:1}])
  // ];


  constructor(private slService: ShoppingListService,
    private http: HttpClient) { }

  getRecipes() {
    // this.http.get<any>("http://localhost:3000/dishes").subscribe((response) => {
    //   if(response.message == 'data fetched successfully') {
    //     for(let recipe of response.data) {
    //       let ingList = [];
    //       for(let ing of recipe.ingredients) {
    //         const newIng = { ingName: ing.name, amount: ing.quantity };
    //         ingList.push(newIng);
    //       }
    //       const newRecipe = new Recipe(recipe.name, recipe.description, recipe.imagePath, ingList);
    //       this.recipes.push(newRecipe);
    //     }
    //     return this.recipes.slice();
    //   } else {
    //     return this.dummmyRecipes.slice();
    //   }
    // });
  }

  getRecipeById(id: number){
    return this.recipes[id];
  }

  addIngToShoppingList(ing: Ingredient[]){
    this.slService.addIngredients(ing);
  }

  addRecipe(recipe: Recipe){
    this.recipes.push(recipe);
    this.recipeChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe){
    this.recipes[index] = newRecipe;
    this.recipeChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number){
    this.recipes.splice(index, 1);
    this.recipeChanged.next(this.recipes.slice());
  }

}
