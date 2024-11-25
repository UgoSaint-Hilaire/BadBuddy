import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

import { useGetLocationsQuery } from "../apis/DataESApi";

export default function TabOneScreen() {
  const { data, isLoading, isSuccess, error } = useGetLocationsQuery("");
  if (data) {
    console.log(data.results);
  } else {
    console.log(error);
  }
  if (data !== undefined) {
    data.results.map((item) => console.log(item));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      {isLoading && <p>Chargement...</p>}
      {isSuccess && (
        <View>
          <Text style={{ fontWeight: "500", textAlign: "center" }}>Nombre de résultats : {data.total_count}</Text>
          {data.results.map((item, index) => (
            <Text style={{ textAlign: "center" }} key={index}>
              {item.equip_nom}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
