import { StyleSheet } from "react-native";

import LoginScreen from "@/components/auth/LoginForm";
import { Text, View } from "@/components/Themed";

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test</Text>
      <LoginScreen />
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
