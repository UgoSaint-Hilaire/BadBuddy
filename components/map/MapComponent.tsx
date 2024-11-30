import React, { useRef, useEffect } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { StyleSheet, Dimensions } from "react-native";
import { Coordinates } from "@/types/coordinates";
import { User } from "@/types/user";

type MapComponentProps = {
  currentLocation: Coordinates;
  usersInArea: User[];
  filteredGyms: Array<{ equip_y: number; equip_x: number; inst_nom: string; inst_adresse: string }>;
  nearestGym: { equip_y: number; equip_x: number; inst_nom: string } | null;
  selectedUserCoords: Coordinates | null;
  onUserMarkerPress: (user: User) => void;
  selectedUserId: string | null;
  zoomOnUserChange?: boolean; // Option pour activer le zoom automatique
};

export const MapComponent: React.FC<MapComponentProps> = ({
  currentLocation,
  usersInArea,
  filteredGyms,
  nearestGym,
  selectedUserCoords,
  onUserMarkerPress,
  selectedUserId,
  zoomOnUserChange = true,
}) => {
  const mapRef = useRef<MapView>(null);

  // Gestion du zoom et du recentrage
  useEffect(() => {
    if (mapRef.current && zoomOnUserChange && selectedUserCoords) {
      const points = [currentLocation, selectedUserCoords];
      if (nearestGym) {
        points.push({ latitude: nearestGym.equip_y, longitude: nearestGym.equip_x });
      }

      const latitudes = points.map((p) => p.latitude);
      const longitudes = points.map((p) => p.longitude);

      const minLatitude = Math.min(...latitudes);
      const maxLatitude = Math.max(...latitudes);
      const minLongitude = Math.min(...longitudes);
      const maxLongitude = Math.max(...longitudes);

      const paddingPercentage = 0.2;
      const latitudeDelta = (maxLatitude - minLatitude) * (1 + paddingPercentage);
      const longitudeDelta = (maxLongitude - minLongitude) * (1 + paddingPercentage);

      const region = {
        latitude: (minLatitude + maxLatitude) / 2,
        longitude: (minLongitude + maxLongitude) / 2,
        latitudeDelta,
        longitudeDelta,
      };

      mapRef.current.animateToRegion(region, 800);
    }
  }, [selectedUserCoords, nearestGym, currentLocation]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.07,
      }}
      showsScale
      showsCompass
      zoomTapEnabled={false}
      showsUserLocation
    >
      {/* Markers pour les utilisateurs */}
      {usersInArea.map((user, index) => (
        <Marker
          key={`user-${index}`}
          coordinate={{
            latitude: user.current_location[0],
            longitude: user.current_location[1],
          }}
          title={user.username}
          description={`Classement: ${user.ranking}, Age: ${user.age}`}
          onPress={() => onUserMarkerPress(user)}
          image={
            selectedUserId === user.id
              ? require("../../assets/images/icon_users_large.png")
              : require("../../assets/images/icon_users_small.png")
          }
        />
      ))}

      {/* Markers pour les gymnases */}
      {filteredGyms.map((location, index) => (
        <Marker
          key={`gym-${index}`}
          coordinate={{
            latitude: location.equip_y,
            longitude: location.equip_x,
          }}
          title={location.inst_nom}
          description={location.inst_adresse}
          image={require("../../assets/images/icon_badminton.png")}
        />
      ))}

      {/* Polylines */}
      {nearestGym && currentLocation && (
        <Polyline
          coordinates={[
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
          ]}
          strokeColor="#45b4ea"
          strokeWidth={5}
        />
      )}
      {nearestGym && selectedUserCoords && (
        <Polyline
          coordinates={[
            { latitude: selectedUserCoords.latitude, longitude: selectedUserCoords.longitude },
            { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
          ]}
          strokeColor="#4676d9"
          strokeWidth={5}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
});
