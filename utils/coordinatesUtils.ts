import { Coordinates } from "../types/coordinates";

type LocationArray = [number, number];

export const arrayToCoordinates = (locationArray: unknown): Coordinates => {
  const [lat, lng] = locationArray as LocationArray;
  return {
    latitude: lat,
    longitude: lng,
  };
};
