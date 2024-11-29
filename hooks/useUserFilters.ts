import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { User } from "../types/user";
import { arrayToCoordinates } from "../utils/coordinatesUtils";
import { CardinalPoints } from "@/types/cardinalPoints";

interface UseUserFilters {
  genderFilter: string;
  rankFilter: string[];
  filterUsers: (users: User[], cardinalPoints: any) => User[];
  setGenderFilter: (filter: string) => void;
  setRankFilter: Dispatch<SetStateAction<string[]>>;
  toggleRank: (rank: string) => void;
}

export const useUserFilters = (): UseUserFilters => {
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [rankFilter, setRankFilter] = useState<string[]>([]);

  const toggleRank = useCallback((rank: string) => {
    setRankFilter((prev) => (prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]));
  }, []);

  const filterUsers = useCallback(
    (users: User[], cardinalPoints: CardinalPoints) => {
      if (!cardinalPoints) return [];

      return users?.filter((user) => {
        const userCoords = arrayToCoordinates(user.current_location);

        const matchesGender = genderFilter ? user.sexe === genderFilter : true;
        const matchesRank = rankFilter.length > 0 ? rankFilter.includes(user.ranking) : true;

        return (
          userCoords.latitude <= cardinalPoints.north.latitude &&
          userCoords.latitude >= cardinalPoints.south.latitude &&
          userCoords.longitude >= cardinalPoints.west.longitude &&
          userCoords.longitude <= cardinalPoints.east.longitude &&
          matchesGender &&
          matchesRank
        );
      });
    },
    [genderFilter, rankFilter]
  );

  return {
    genderFilter,
    rankFilter,
    filterUsers,
    setGenderFilter,
    setRankFilter,
    toggleRank,
  };
};
