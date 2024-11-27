import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { FIREBASE_DB } from "../config/firebase";

export interface User {
  id: string;
  age: number;
  createdAt: Timestamp | string;
  current_location: number[];
  email: string;
  lastly_connected: string;
  preferences: { [key: string]: string };
  profile_picture: string;
  ranking: string;
  sexe: string;
  user_id: string;
  username: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "users"));
        const usersData: User[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          };
        }) as User[];
        setUsers(usersData);
      } catch (err: any) {
        setError(`Error: ${err.message || "Failed to fetch users"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};