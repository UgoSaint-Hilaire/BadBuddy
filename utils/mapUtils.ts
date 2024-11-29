import { Coordinates } from "@/types/coordinates";

//
// Par pitié Tristan utilise Geolib et pas ce truc je pige rien
//

export const calculateDistance = (coord1: Coordinates, coord2: Coordinates) => {
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
  return R * c; // Distance en km
};

export const findNearestLocation = (
  midPoint: Coordinates,
  locations: Array<{ equip_y: number; equip_x: number; inst_nom: string }>
) => {
  if (!locations || locations.length === 0) return null;

  return locations.reduce((closest, location) => {
    const distanceToMidPoint = Math.sqrt(
      Math.pow(midPoint.latitude - location.equip_y, 2) + Math.pow(midPoint.longitude - location.equip_x, 2)
    );
    const distanceToClosest = Math.sqrt(
      Math.pow(midPoint.latitude - closest.equip_y, 2) + Math.pow(midPoint.longitude - closest.equip_x, 2)
    );

    return distanceToMidPoint < distanceToClosest ? location : closest;
  }, locations[0]);
};
