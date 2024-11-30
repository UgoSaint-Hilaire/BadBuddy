export interface User {
  age: number;
  createdAt: string;
  current_location: [number, number];
  id: string;
  lastly_connected: string;
  preferences: Record<number, string>;
  profile_picture: string;
  ranking: string;
  sexe: string;
  user_id: string;
  username: string;
}
