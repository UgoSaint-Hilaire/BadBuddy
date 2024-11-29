import { Coordinates } from "@/types/coordinates";
import { User } from "@/types/user";
import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { arrayToCoordinates } from "../../utils/coordinatesUtils";

interface MapContainerProps {
  currentLocation: Coordinates;
  usersInArea: User[];
  filteredGyms: any[];
  selectedUserId: string | null;
  nearestGym: any | null;
  selectedUserCoords: Coordinates | null;
  onUserMarkerPress: (user: User) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  currentLocation,
  usersInArea,
  filteredGyms,
  selectedUserId,
  nearestGym,
  selectedUserCoords,
  onUserMarkerPress,
  ...props
}) => {
  if (!currentLocation) return null;
  const mapRef = useRef<MapView>(null);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.07,
        }}
        showsScale={true}
        showsCompass={true}
        zoomTapEnabled={false}
        showsUserLocation>
        {usersInArea &&
          usersInArea.length > 0 &&
          usersInArea.map((user, index) => (
            <Marker
              key={`user-${index}`}
              coordinate={arrayToCoordinates(user.current_location)}
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
        {filteredGyms &&
          filteredGyms.map((location, index) => (
            <Marker
              key={`marker-${index}`}
              coordinate={{
                latitude: location.equip_y,
                longitude: location.equip_x,
              }}
              title={location.inst_nom}
              description={location.inst_adresse}
              image={require("../../assets/images/icon_badminton.png")}
            />
          ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "relative",
    zIndex: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapContainer;
