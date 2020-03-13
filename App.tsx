import React, { useState, useEffect, useReducer } from "react";
import { StyleSheet, Text, View } from "react-native";
import SpellListsScreen from "./screens/SpellListsScreen";
import { SpellList } from "./structs/SpellList";
import SpellSourcesScreen from "./screens/SpellSourcesScreen";
import SpellsKnownScreen from "./screens/SpellsKnownScreen";
import SpellInfoScreen from "./screens/SpellInfoScreen";
import SpellListScreen from "./screens/SpellListScreen";
import Spinner from "react-native-spinkit";
import { NavigationContainer, TabActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppStyles } from "./styles/AppStyles";
import SpellProvider from "./data/SpellProvider";

export default function App() {
  const spellLists: Array<SpellList> = [
    {
      name: "Wizzo the Wizard",
      thumbnailURL: "a",
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
      thumbnailURL: "a",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Sal the Sorcerer",
      thumbnailURL: "a",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Perry the Paladin",
      thumbnailURL: "a",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Wam the Warlock",
      thumbnailURL: "a",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Alberto the Artificer",
      thumbnailURL: "a",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    }
  ];

  const [spellSources, setSpellSources] = useState([]);
  const [spellsLoading, setSpellsLoading] = useState(false);

  const updateSourceURLs = () =>
    SpellProvider.getSourceURLs().then(urls => setSpellSources(urls));

  useEffect(() => {
    updateSourceURLs();
  }, []);

  const Tab = createBottomTabNavigator();

  const SourcesScreen = () => (
    <SpellSourcesScreen
      spellSources={spellSources}
      onSpellSourcesReloaded={() => {
        setSpellsLoading(true);
        SpellProvider.downloadSpellsFromSources()
          .then(() => {
            updateSourceURLs();
            setSpellsLoading(false);
          })
          .catch(err => alert(err));
      }}
      onSpellSourceAdded={sourceURL =>
        !spellsLoading &&
        SpellProvider.addSource(sourceURL)
          .then(updateSourceURLs)
          .catch(err => alert(err))
      }
      onSpellSourceRemoved={sourceURL =>
        !spellsLoading &&
        SpellProvider.removeSource(sourceURL)
          .then(updateSourceURLs)
          .catch(err => alert(err))
      }
      isLoading={spellsLoading}
      loadingButtonComponent={
        <Text
          style={[
            AppStyles.smallHeaderSubtext,
            spellsLoading && styles.spellLoadingButton
          ]}
        >
          Downloading...
        </Text>
      }
    />
  );
  const ListsScreen = () => <SpellListsScreen spellLists={spellLists} />;
  const KnownScreen = () => <SpellsKnownScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Text
                style={[
                  AppStyles.headerSubtext,
                  styles.tabBarText,
                  focused && styles.tabBarTextHighlight
                ]}
              >
                {route.name === "Sources" && spellsLoading ? (
                  <Spinner
                    color={
                      focused
                        ? styles.tabBarTextHighlight.color
                        : AppStyles.smallHeaderText.color
                    }
                    size={25}
                    type={"Wave"}
                  />
                ) : (
                  route.name
                )}
              </Text>
            );
          }
        })}
        tabBarOptions={{
          showIcon: true,
          showLabel: false,
          style: { ...styles.tabBar }
        }}
      >
        <Tab.Screen name="Sources" component={SourcesScreen} />
        <Tab.Screen name="Spells" component={ListsScreen} />
        <Tab.Screen name="Search" component={KnownScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderWidth: 0,
    backgroundColor: AppStyles.boxBackground.backgroundColor
  },
  tabBarText: {
    fontSize: 18
  },
  tabBarTextHighlight: {
    color: "white"
  },
  spellLoadingButton: {
    color: "#a0a0a0"
  }
});
