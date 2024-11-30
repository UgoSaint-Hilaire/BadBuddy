import { useCallback } from "react";
import { Coordinates } from "../types/coordinates";

// Rayon de la Terre en kilomètres
const EARTH_RADIUS_KM = 6371;

export const useLocationCalculations = () => {
  // Calcul de la distance entre deux coordonnées (en km)
  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates) => {
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c; // Distance en km
  }, []);

  // Trouver l'emplacement le plus proche d'un point donné
  const findNearestLocation = useCallback(
    (midPoint: Coordinates, locations: Array<{ equip_y: number; equip_x: number; inst_nom: string }>) => {
      if (!locations || locations.length === 0) return null;

      return locations.reduce((closest, location) => {
        const distanceToMidPoint = calculateDistance(midPoint, {
          latitude: location.equip_y,
          longitude: location.equip_x,
        });
        const distanceToClosest = calculateDistance(midPoint, {
          latitude: closest.equip_y,
          longitude: closest.equip_x,
        });

        return distanceToMidPoint < distanceToClosest ? location : closest;
      }, locations[0]);
    },
    [calculateDistance]
  );

  return {
    calculateDistance,
    findNearestLocation,
  };
};
