import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SpellListsScreen from "./screens/SpellListsScreen";
import { SpellList } from "./structs/SpellList";
import SpellSourcesScreen from "./screens/SpellSourcesScreen";
import SpellsKnownScreen from "./screens/SpellsKnownScreen";
import SpellInfoScreen from "./screens/SpellInfoScreen";
import SpellListScreen from "./screens/SpellListScreen";

import { NavigationContainer, TabActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export default function App() {
  const spellLists: Array<SpellList> = [
    {
      name: "Wizzo the Wizard",
      thumbnailURL: "",
      spellIDs: [
        { id: "1212" },
        { id: "2121" },
        { id: "1212" },
        { id: "2121" },
        { id: "1212" },
        { id: "2121" }
      ]
    },
    {
      name: "Clarence the Cleric",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Sal the Sorcerer",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Perry the Paladin",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Wam the Warlock",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Alberto the Artificer",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    }
  ];

  const spellSources = [
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index"
  ];

  const Tab = createBottomTabNavigator();

  const SourcesScreen = () => (
    <SpellSourcesScreen spellSources={spellSources} />
  );
  const ListsScreen = () => <SpellListsScreen spellLists={spellLists} />;
  const KnownScreen = () => <SpellsKnownScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Sources" component={SourcesScreen} />
        <Tab.Screen name="Spells" component={ListsScreen} />
        <Tab.Screen name="Search" component={KnownScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
