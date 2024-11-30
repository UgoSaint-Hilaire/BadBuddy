import { useState, useMemo } from "react";
import { User } from "../types/user";
import { Coordinates } from "../types/coordinates";

export const useUserFilters = (users: User[], cardinalPoints: any) => {
  const [genderFilter, setGenderFilter] = useState<string>(""); // "Homme", "Femme", ou ""
  const [rankFilter, setRankFilter] = useState<string[]>([]); // Liste des rangs sélectionnés

  // Fonction pour basculer un rang dans la liste des filtres
  const toggleRank = (rank: string) => {
    setRankFilter((prev) => (prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]));
  };

  // Utilisateurs filtrés
  const filteredUsers = useMemo(() => {
    if (!cardinalPoints) return [];

    return users
      .map((user) => {
        const userCoords = {
          latitude: user.current_location[0],
          longitude: user.current_location[1],
        } as Coordinates;

        const matchesGender = genderFilter ? user.sexe === genderFilter : true;
        const matchesRank = rankFilter.length > 0 ? rankFilter.includes(user.ranking) : true;

        const isInArea =
          userCoords.latitude <= cardinalPoints.north.latitude &&
          userCoords.latitude >= cardinalPoints.south.latitude &&
          userCoords.longitude >= cardinalPoints.west.longitude &&
          userCoords.longitude <= cardinalPoints.east.longitude;

        return isInArea && matchesGender && matchesRank ? { ...user, coords: userCoords } : null;
      })
      .filter(Boolean) as User[];
  }, [users, genderFilter, rankFilter, cardinalPoints]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setGenderFilter("");
    setRankFilter([]);
  };

  return {
    filteredUsers,
    genderFilter,
    setGenderFilter,
    rankFilter,
    toggleRank,
    resetFilters,
  };
};
