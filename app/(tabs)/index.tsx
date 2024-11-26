import { Button, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { FIREBASE_AUTH } from "@/config/firebase";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home screen</Text>
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
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
});
