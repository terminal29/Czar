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
import { createStackNavigator } from "@react-navigation/stack";
import RoundedIconButton from "./components/RoundedIconButton";
import Toast from "react-native-root-toast";

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
    SpellProvider.updateSpellDataFromStorage();
  }, []);

  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();

  const SourcesScreen = () => (
    <SpellSourcesScreen
      spellSources={spellSources}
      onSpellSourcesReloaded={() => {
        setSpellsLoading(true);
        SpellProvider.downloadSpellsFromSources().then(() => {
          updateSourceURLs();
          setSpellsLoading(false);
        });
      }}
      onSpellSourceAdded={sourceURL =>
        !spellsLoading &&
        SpellProvider.addSource(sourceURL).then(updateSourceURLs)
      }
      onSpellSourceRemoved={sourceURL =>
        !spellsLoading &&
        SpellProvider.removeSource(sourceURL).then(updateSourceURLs)
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
  const KnownScreen = ({ navigation }) => (
    <SpellsKnownScreen
      onSpellPressed={spellID =>
        navigation.push("SpellPopupScreen", { spellID })
      }
    />
  );

  const MainAppScreen = () => (
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
      initialRouteName={"Search"}
    >
      <Tab.Screen name="Sources" component={SourcesScreen} />
      <Tab.Screen name="Spells" component={ListsScreen} />
      <Tab.Screen name="Search" component={KnownScreen} />
    </Tab.Navigator>
  );

  const SpellPopupScreen = ({ route, navigation }) => (
    <SpellInfoScreen
      spellID={route.params.spellID}
      extraButtons={[
        <RoundedIconButton
          onPressed={() => Toast.show("Not implemented yet ;)")}
          text={"Add to List"}
          iconName={"ios-add"}
          disabled={false}
          style={styles.overlayButtonTopMargin}
        />,
        <RoundedIconButton
          onPressed={() => navigation.goBack()}
          text={"Back"}
          iconName={"ios-arrow-back"}
          disabled={false}
          style={styles.overlayButtonFullMargin}
        />
      ]}
    ></SpellInfoScreen>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName="MainApp">
        <Stack.Screen name="MainAppScreen" component={MainAppScreen} />
        <Stack.Screen name="SpellPopupScreen" component={SpellPopupScreen} />
      </Stack.Navigator>
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
  },
  overlayButtonTopMargin: {
    marginTop: 10
  },
  overlayButtonFullMargin: {
    marginVertical: 10
  }
});
