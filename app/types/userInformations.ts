import { Coordinates } from "./locationResponse";

// Interface pour les infos du user
export interface UserInformations {
  coordonates: Coordinates;
  radius?: number;
}
