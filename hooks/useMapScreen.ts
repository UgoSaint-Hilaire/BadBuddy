import { useState, useCallback } from "react";
import { useLocation } from "../hooks/useLocation";
import { useGetLocationsQuery } from "../app/apis/LocationApi";
import { useUsers } from "../hooks/useUsers";
import { useLoadingStates } from "../hooks/useLoadingStates";
import { useMapUtils } from "../hooks/useMapUtils";
import { useUserFilters } from "../hooks/useUserFilters";
import { User } from "../app/types/user";
import { Coordinates } from "../app/types/coordinates";
import { arrayToCoordinates } from "../utils/coordinatesUtils";

export const useMapScreen = () => {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();
  const { data, isLoading } = useGetLocationsQuery(cardinalPoints!, { skip: !cardinalPoints });
  const { users } = useUsers();
  const loadingState = useLoadingStates();
  const { findNearestGym, calculateDistance } = useMapUtils();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserCoords, setSelectedUserCoords] = useState<Coordinates | null>(null);
  const [nearestGym, setNearestGym] = useState<any>(null);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  // Filtres
  const { filterUsers, genderFilter, rankFilter, setGenderFilter, setRankFilter } = useUserFilters();

  // Gyms filtrés
  const filteredGyms = data?.results
    ? data.results.reduce((uniqueGyms, gym) => {
        if (!uniqueGyms.some((g) => g.inst_nom === gym.inst_nom)) {
          uniqueGyms.push(gym);
        }
        return uniqueGyms;
      }, [] as typeof data.results)
    : [];

  // Utilisateurs filtrés
  const usersInArea = filterUsers(users ?? [], cardinalPoints);

  const handleUserMarkerPress = useCallback(
    (user: User) => {
      if (!currentLocation) return;

      const userCoords = arrayToCoordinates(user.current_location);
      setSelectedUserId(user.id);
      setSelectedUserCoords(userCoords);

      const midPoint = {
        latitude: (currentLocation.latitude + userCoords.latitude) / 2,
        longitude: (currentLocation.longitude + userCoords.longitude) / 2,
      };

      const nearestGym = filteredGyms.length ? findNearestGym(midPoint, filteredGyms) : null;
      setNearestGym(nearestGym);

      if (nearestGym) {
        console.log(
          `Distance entre moi et le gymnase "${nearestGym.inst_nom}": ${calculateDistance(currentLocation, {
            latitude: nearestGym.equip_y,
            longitude: nearestGym.equip_x,
          }).toFixed(2)} km`
        );
      }
    },
    [currentLocation, filteredGyms, findNearestGym, calculateDistance]
  );

  return {
    currentLocation,
    loadingState,
    usersInArea,
    filteredGyms,
    selectedUserId,
    selectedUserCoords,
    nearestGym,
    activeUserIndex,
    isModalVisible,
    genderFilter,
    rankFilter,
    handleUserMarkerPress,
    setActiveUserIndex,
    setModalVisible,
    setGenderFilter,
    setRankFilter,
  };
};
