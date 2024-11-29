import React from "react";
import { Text, View } from "@/components/Themed";
import { Coordinates } from "../../types/coordinates";

type LocationStatusProps = {
  locationStatus: "idle" | "loading" | "success" | "error";
  currentLocation: Coordinates | null;
};

export const LocationStatus: React.FC<LocationStatusProps> = ({ locationStatus, currentLocation }) => {
  return (
    <View>
      {locationStatus === "idle" && <Text>En attente de localisation...</Text>}

      {locationStatus === "loading" && <Text>Récupération de la position en cours...</Text>}

      {locationStatus === "success" && currentLocation && (
        <View>
          <Text>Position trouvée</Text>
          <Text>Latitude: {currentLocation.latitude}</Text>
          <Text>Longitude: {currentLocation.longitude}</Text>
        </View>
      )}

      {locationStatus === "error" && <Text>Impossible de récupérer la position</Text>}
    </View>
  );
};
