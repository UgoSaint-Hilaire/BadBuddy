// src/hooks/useMapUtils.ts
import { useCallback, useState } from "react";
import { Gym } from "../app/types/mapContainer";
import { Coordinates } from "../app/types/coordinates";
import MapView from "react-native-maps";

interface MapUtils {
  findNearestGym: (userCoords: Coordinates, gyms: Gym[]) => Gym | null;
  calculateDistance: (coord1: Coordinates, coord2: Coordinates) => number;
  calculateMidPoint: (coord1: Coordinates, coord2: Coordinates) => Coordinates;
  animateToRegion: (points: Coordinates[], mapRef: React.RefObject<MapView>) => void;
}

export const useMapUtils = (): MapUtils => {
  const findNearestGym = useCallback((userCoords: Coordinates, gyms: Gym[]): Gym | null => {
    if (!gyms?.length) return null;

    return gyms.reduce((closest, gym) => {
      const distanceToCurrent = Math.sqrt(
        Math.pow(userCoords.latitude - gym.equip_y, 2) + Math.pow(userCoords.longitude - gym.equip_x, 2)
      );
      const distanceToClosest = Math.sqrt(
        Math.pow(userCoords.latitude - closest.equip_y, 2) + Math.pow(userCoords.longitude - closest.equip_x, 2)
      );

      return distanceToCurrent < distanceToClosest ? gym : closest;
    }, gyms[0]);
  }, []);

  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Rayon de la Terre en km
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
  }, []);

  const calculateMidPoint = useCallback((coord1: Coordinates, coord2: Coordinates): Coordinates => {
    return {
      latitude: (coord1.latitude + coord2.latitude) / 2,
      longitude: (coord1.longitude + coord2.longitude) / 2,
    };
  }, []);

  const animateToRegion = useCallback((points: Coordinates[], mapRef: React.RefObject<MapView>) => {
    if (!mapRef.current || points.length === 0) return;

    const latitudes = points.map((p) => p.latitude);
    const longitudes = points.map((p) => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const paddingPercentage = 0.2;
    const latitudeDelta = (maxLat - minLat) * (1 + paddingPercentage);
    const longitudeDelta = (maxLng - minLng) * (1 + paddingPercentage);

    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta,
      longitudeDelta,
    };

    mapRef.current.animateToRegion(region, 800);
  }, []);

  return {
    findNearestGym,
    calculateDistance,
    calculateMidPoint,
    animateToRegion,
  };
};
