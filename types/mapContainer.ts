import { User } from "./user";
import { Coordinates } from "./coordinates";

export interface Gym {
  inst_nom: string;
  inst_adresse: string;
  equip_x: number;
  equip_y: number;
}

export interface MapContainerProps {
  currentLocation: Coordinates;
  users: User[];
  gyms: Gym[];
  onUserSelect: (user: User) => void;
  selectedUserId: string | null;
}
