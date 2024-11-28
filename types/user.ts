import { Timestamp } from "firebase/firestore";
import { Coordinates } from "./coordinates";

export interface User {
  id: string;
  age: number;
  createdAt: Timestamp | string;
  current_location: Coordinates;
  email: string;
  lastly_connected: string;
  preferences: { [key: string]: string };
  profile_picture: string;
  ranking: string;
  sexe: string;
  user_id: string;
  username: string;
}
