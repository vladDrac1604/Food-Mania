import { Ingredient } from "../shared/ingredient.model";

export class Recipe{
  public id: String;
  public name: string;
  public description: string;
  public imagePath: string;
  public ing: Ingredient[];
  public creatorId: string;
  public likes: any[];
  public type: String;

  constructor(name: string, description: string, imagePath: string, ing: Ingredient[], userId: string, likes = [], type: string) {
    this.name=name;
    this.description=description;
    this.imagePath=imagePath;
    this.ing=ing;
    this.creatorId = userId;
    this.likes = likes;
    this.type = type;
  }

  public setId(id: String) {
    this.id = id;
  }
}
