import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipeStartComponent } from './recipes/recipe-start/recipe-start.component';
import { RecipesComponent } from './recipes/recipes.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RegistrationFormComponent } from './user/registration-form/registration-form.component';
import { LoginFormComponent } from './user/login-form/login-form.component';
import { ProfileComponent } from './user/profile/profile.component';

const routes: Routes = [
  { path: "", redirectTo: "/recipes", pathMatch: "full" },
  { path: "shoppingList", component: ShoppingListComponent },
  { path: "registrationForm", component:  RegistrationFormComponent },
  { path: "login", component:  LoginFormComponent },
  { path: "profile", component: ProfileComponent },
  { path: "recipes", component: RecipesComponent, children: [
    {path: "", component: RecipeStartComponent},
    {path: "new", component: RecipeEditComponent},
    {path: ":id", component: RecipeDetailComponent},
    {path: ":id/edit", component: RecipeEditComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
