// hooks/useMapScreen.ts
import { useState, useCallback, useEffect } from "react";
import MapView from "react-native-maps";
import { Coordinates, SportsFacility } from "../types/locationAPIResponse";
import { User } from "../types/user";
import { arrayToCoordinates } from "@/utils/coordinatesUtils";

interface UseMapScreenProps {
  currentLocation: Coordinates | null;
  filteredGyms: SportsFacility[];
  usersInArea: User[];
  mapRef: React.RefObject<MapView>;
}

interface MapScreenResult {
  selectedUserId: string | null;
  selectedUserCoords: Coordinates | null;
  nearestGym: SportsFacility | null;
  activeUserIndex: number;
  setActiveUserIndex: (index: number) => void;
  handleUserMarkerPress: (user: User) => void;
}

export const useMapScreen = ({
  currentLocation,
  filteredGyms,
  usersInArea,
  mapRef,
}: UseMapScreenProps): MapScreenResult => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserCoords, setSelectedUserCoords] =
    useState<Coordinates | null>(null);
  const [nearestGym, setNearestGym] = useState<SportsFacility | null>(null);
  const [activeUserIndex, setActiveUserIndex] = useState(0);

  const findNearestLocation = useCallback(
    (midPoint: Coordinates) => {
      if (!filteredGyms || filteredGyms.length === 0) return null;

      return filteredGyms.reduce((closest, location) => {
        const distanceToMidPoint = Math.sqrt(
          Math.pow(midPoint.latitude - location.equip_y, 2) +
            Math.pow(midPoint.longitude - location.equip_x, 2)
        );
        const distanceToClosest = Math.sqrt(
          Math.pow(midPoint.latitude - closest.equip_y, 2) +
            Math.pow(midPoint.longitude - closest.equip_x, 2)
        );

        return distanceToMidPoint < distanceToClosest ? location : closest;
      }, filteredGyms[0]);
    },
    [filteredGyms]
  );

  const calculateDistance = useCallback(
    (coord1: Coordinates, coord2: Coordinates) => {
      const R = 6371;
      const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
      const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((coord1.latitude * Math.PI) / 180) *
          Math.cos((coord2.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const handleUserMarkerPress = useCallback(
    (user: User) => {
      if (!currentLocation) return;

      setSelectedUserId(user.id);
      const userCoords = arrayToCoordinates(user.current_location);
      setSelectedUserCoords(userCoords);

      const midPoint = {
        latitude: (currentLocation.latitude + userCoords.latitude) / 2,
        longitude: (currentLocation.longitude + userCoords.longitude) / 2,
      };

      const nearest = filteredGyms.length
        ? findNearestLocation(midPoint)
        : null;
      setNearestGym(nearest);

      if (mapRef.current && nearest) {
        const points = [
          currentLocation,
          userCoords,
          { latitude: nearest.equip_y, longitude: nearest.equip_x },
        ];

        const latitudes = points.map((p) => p.latitude);
        const longitudes = points.map((p) => p.longitude);

        const minLatitude = Math.min(...latitudes);
        const maxLatitude = Math.max(...latitudes);
        const minLongitude = Math.min(...longitudes);
        const maxLongitude = Math.max(...longitudes);

        const paddingPercentage = 0.2;
        const latitudeDelta =
          (maxLatitude - minLatitude) * (1 + paddingPercentage);
        const longitudeDelta =
          (maxLongitude - minLongitude) * (1 + paddingPercentage);

        mapRef.current.animateToRegion(
          {
            latitude: (minLatitude + maxLatitude) / 2,
            longitude: (minLongitude + maxLongitude) / 2,
            latitudeDelta,
            longitudeDelta,
          },
          800
        );
      }
    },
    [currentLocation, filteredGyms, findNearestLocation]
  );

  useEffect(() => {
    if (usersInArea && usersInArea[activeUserIndex]) {
      handleUserMarkerPress(usersInArea[activeUserIndex]);
    }
  }, [activeUserIndex, usersInArea, handleUserMarkerPress]);

  // Le retour du hook correspond maintenant à l'interface MapScreenResult
  return {
    selectedUserId,
    selectedUserCoords,
    nearestGym,
    activeUserIndex,
    setActiveUserIndex,
    handleUserMarkerPress,
  };
};
