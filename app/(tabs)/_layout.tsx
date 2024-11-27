import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users(temp)",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
      />
    </Tabs>
  );
}
