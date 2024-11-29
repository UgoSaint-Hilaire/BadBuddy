import React, { useRef, useState } from "react";
import { StyleSheet, Dimensions, ActivityIndicator, View } from "react-native";
import { Text } from "@/components/Themed";
import MapView, { Marker, Polyline } from "react-native-maps";
import { User } from "../../types/user";
import { Coordinates } from "../../types/coordinates";
import { UserCardCarousel } from "@/components/index/UserCardCarrousel";
import { arrayToCoordinates } from "@/utils/coordinatesUtils";

interface MapDisplayProps {
  currentLocation: Coordinates | null;
  locationStatus: string;
  usersInArea: User[];
  filteredGyms: any[];
  onUserMarkerPress: (user: User) => void;
  selectedUserId: string | null;
  nearestGym: any;
  selectedUserCoords: Coordinates | null;
  activeUserIndex: number;
  setActiveUserIndex: (index: number) => void;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  currentLocation,
  locationStatus,
  usersInArea,
  filteredGyms,
  onUserMarkerPress,
  selectedUserId,
  nearestGym,
  selectedUserCoords,
  activeUserIndex,
  setActiveUserIndex,
}) => {
  const mapRef = useRef<MapView>(null);

  if (locationStatus === "loading") {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Chargement de la localisation...</Text>
      </View>
    );
  }

  if (locationStatus === "error") {
    return (
      <View>
        <Text>Erreur lors de la récupération de la localisation</Text>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View>
        <Text>En attente de la localisation...</Text>
      </View>
    );
  }

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
        showsUserLocation
      >
        {usersInArea.map((user, index) => (
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

        {filteredGyms.map((location, index) => (
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
              currentLocation,
              {
                latitude: nearestGym.equip_y,
                longitude: nearestGym.equip_x,
              },
            ]}
            strokeColor="#45b4ea"
            strokeWidth={5}
          />
        )}

        {nearestGym && selectedUserCoords && (
          <Polyline
            coordinates={[
              selectedUserCoords,
              {
                latitude: nearestGym.equip_y,
                longitude: nearestGym.equip_x,
              },
            ]}
            strokeColor="#4676d9"
            strokeWidth={5}
          />
        )}
      </MapView>

      <View style={styles.userCardCarousel}>
        <UserCardCarousel
          data={usersInArea}
          onActiveIndexChange={setActiveUserIndex}
        />
      </View>
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
  userCardCarousel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "transparent",
    elevation: 5,
  },
});
