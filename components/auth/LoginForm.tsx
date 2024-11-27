import React, { useState } from "react";
import { Text, View } from "../Themed";
import { FIREBASE_AUTH } from "@/config/firebase";
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button, Input } from "@rneui/themed";
import { router } from "expo-router";
import { FirebaseError } from "firebase/app";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    // Réinitialiser le message d'erreur
    setErrorMessage("");
    setLoading(true);

    // Validation de base
    if (!email || !password) {
      setErrorMessage("Veuillez saisir votre email et votre mot de passe");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection après connexion réussie
      router.push("/(tabs)"); // Ajustez la route selon votre navigation
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMessage("Aucun compte n'est associé à cet email");
            break;
          case "auth/wrong-password":
            setErrorMessage("Mot de passe incorrect");
            break;
          case "auth/invalid-email":
            setErrorMessage("Format d'email invalide");
            break;
          case "auth/user-disabled":
            setErrorMessage("Ce compte a été désactivé");
            break;
          case "auth/too-many-requests":
            setErrorMessage("Trop de tentatives. Veuillez réessayer plus tard");
            break;
          default:
            setErrorMessage("Une erreur est survenue lors de la connexion");
        }
      } else {
        setErrorMessage("Une erreur inattendue est survenue");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏸</Text>
      <Text style={styles.title}>Connexion</Text>
      <KeyboardAvoidingView behavior="padding">
        <Input
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
          value={email}
          errorMessage={errorMessage && email ? "" : undefined}
        />
        <Input
          placeholder="Mot de passe"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
          value={password}
          errorMessage={errorMessage && password ? "" : undefined}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button
              containerStyle={{
                marginHorizontal: 10,
                borderWidth: 0,
                borderRadius: 5,
              }}
              title="Connexion"
              onPress={signIn}
            />
            <Text style={styles.link} onPress={() => router.push("/(authentication)/register")}>
              Créer un compte
            </Text>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logo: {
    fontSize: 50,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    color: "blue",
    marginTop: 20,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
