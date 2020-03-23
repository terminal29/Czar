import React, { useState, useEffect, useReducer, useCallback } from "react";
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
import { SpellListAddBox } from "./components/SpellListAddBox";
import SpellListAddScreen from "./screens/SpellListAddScreen";
import { SpellID } from "./structs/SpellID";
import SpellListProvider from "./data/SpellListProvider";
import AddToSpellListScreen from "./screens/AddToSpellListScreen";
import SpellListEditScreen from "./screens/SpellListEditScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
export default function App() {
  const [spellLists, setSpellLists] = useState<Array<SpellList>>([]);
  const [spellSources, setSpellSources] = useState([]);
  const [spellsLoading, setSpellsLoading] = useState(false);

  const updateSourceURLs = () =>
    SpellProvider.getSourceURLs().then(urls => setSpellSources(urls));

  useEffect(() => {
    let cancelled = false;
    updateSourceURLs();
    SpellProvider.updateSpellDataFromStorage();

    const updateSpellLists = async () => {
      await SpellListProvider.observeSpellLists((lists: Array<SpellList>) => {
        if (!cancelled) setSpellLists(lists);
      });
    };

    updateSpellLists();

    return () => {
      cancelled = true;
      SpellListProvider.unObserveSpellLists(updateSpellLists);
    };
  }, []);

  const SourcesScreen = useCallback(
    () => (
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
    ),
    [spellSources, spellsLoading, setSpellsLoading, updateSourceURLs]
  );
  const ListsScreen = useCallback(
    ({ navigation }) => (
      <SpellListsScreen
        spellLists={spellLists}
        onAddListPressed={() => navigation.push("SpellListAddScreen")}
        onListPressed={list => {
          navigation.push("SpellListScreen", { list });
        }}
        onListEditPressed={list => {
          navigation.push("ModifySpellListScreen", { list });
        }}
      />
    ),
    [spellLists]
  );
  const KnownScreen = useCallback(
    ({ navigation }) => (
      <SpellsKnownScreen
        onSpellPressed={spellID =>
          navigation.push("SpellPopupScreen", { spellID })
        }
      />
    ),
    []
  );

  const MainAppScreen = useCallback(
    () => (
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
        initialRouteName={"SpellLists"}
      >
        <Tab.Screen name="Sources">{SourcesScreen}</Tab.Screen>
        <Tab.Screen name="SpellLists">{ListsScreen}</Tab.Screen>
        <Tab.Screen name="Search">{KnownScreen}</Tab.Screen>
      </Tab.Navigator>
    ),
    [SourcesScreen, ListsScreen, KnownScreen, spellsLoading]
  );

  const SpellPopupScreen = useCallback(
    ({ route, navigation }) => (
      <SpellInfoScreen
        spellID={route.params.spellID}
        extraButtons={[
          <RoundedIconButton
            key={"add"}
            onPressed={() =>
              navigation.push("AddToSpellListScreen", {
                spellID: route.params.spellID
              })
            }
            text={"Add to List"}
            iconName={"ios-add"}
            disabled={false}
            style={styles.overlayButtonTopMargin}
          />,
          <RoundedIconButton
            key={"back"}
            onPressed={() => navigation.goBack()}
            text={"Back"}
            iconName={"ios-arrow-back"}
            disabled={false}
            style={styles.overlayButtonFullMargin}
          />
        ]}
      />
    ),
    []
  );

  const SpellListSpellPopupScreen = useCallback(
    ({ route, navigation }) => (
      <SpellInfoScreen
        spellID={route.params.spellID}
        extraButtons={[
          <RoundedIconButton
            key={"remove"}
            onPressed={() => {
              SpellListProvider.removeSpellIDFromList(
                route.params.spellList,
                route.params.spellID
              );
              navigation.goBack();
            }}
            text={"Remove from list"}
            iconName={"ios-close"}
            disabled={false}
            style={styles.overlayButtonTopMargin}
          />,
          <RoundedIconButton
            key={"back"}
            onPressed={() => navigation.goBack()}
            text={"Back"}
            iconName={"ios-arrow-back"}
            disabled={false}
            style={styles.overlayButtonFullMargin}
          />
        ]}
      />
    ),
    []
  );

  const AddSpellListPopupScreen = useCallback(
    ({ route, navigation }) => (
      <SpellListAddScreen
        onDone={newList => {
          // submit new list to lists
          navigation.goBack();
          SpellListProvider.addSpellList(newList);
        }}
        onCancel={() => navigation.goBack()}
      />
    ),
    []
  );

  const ModifySpellListScreen = useCallback(
    ({ route, navigation }) => (
      <SpellListAddScreen
        existingList={route.params.list}
        onDone={async newList => {
          // submit new list to lists
          await SpellListProvider.removeSpellList(route.params.list);
          await SpellListProvider.addSpellList(newList);
          navigation.goBack();
        }}
        onDelete={() => {
          SpellListProvider.removeSpellList(route.params.list);
          navigation.goBack();
        }}
        onCancel={() => {
          navigation.goBack();
        }}
      />
    ),
    []
  );

  const SingleSpellListScreen = useCallback(
    ({ route, navigation }) => (
      <SpellListScreen
        list={route.params.list}
        onSpellPressed={(spellID: SpellID) => {
          navigation.push("SpellListSpellPopupScreen", {
            spellID,
            spellList: route.params.list
          });
        }}
        onEditMode={() =>
          navigation.push("EditSpellSelectionScreen", {
            list: route.params.list
          })
        }
      />
    ),
    []
  );

  const EditSpellSelectionScreen = useCallback(
    ({ route, navigation }) => {
      return (
        <SpellListEditScreen
          list={route.params.list}
          onAddDivider={() => Toast.show("Not implemented yet :)")}
          onConfirmed={async newList => {
            await SpellListProvider.removeSpellList(route.params.list);
            await SpellListProvider.addSpellList(newList);
            navigation.goBack();
          }}
          onSpellRemoved={spellID =>
            SpellListProvider.removeSpellIDFromList(route.params.list, spellID)
          }
          onSpellReordered={() => Toast.show("Not implemented yet :)")}
        />
      );
    },
    [spellLists]
  );

  const AddSpellToSpellListScreen = useCallback(
    ({ route, navigation }) => {
      return (
        <AddToSpellListScreen
          spellID={route.params.spellID}
          spellLists={spellLists}
          onListPressed={(list: SpellList) => {
            SpellListProvider.addSpellIDToList(list, route.params.spellID);
            navigation.goBack();
          }}
          onCancelPressed={() => navigation.goBack()}
        />
      );
    },
    [spellLists, SingleSpellListScreen]
  );

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName="MainApp">
        <Stack.Screen name="MainAppScreen">{MainAppScreen}</Stack.Screen>
        <Stack.Screen name="SpellPopupScreen">{SpellPopupScreen}</Stack.Screen>
        <Stack.Screen name="SpellListAddScreen">
          {AddSpellListPopupScreen}
        </Stack.Screen>
        <Stack.Screen name="SpellListScreen">
          {SingleSpellListScreen}
        </Stack.Screen>
        <Stack.Screen name="AddToSpellListScreen">
          {AddSpellToSpellListScreen}
        </Stack.Screen>
        <Stack.Screen name="ModifySpellListScreen">
          {ModifySpellListScreen}
        </Stack.Screen>
        <Stack.Screen name="EditSpellSelectionScreen">
          {EditSpellSelectionScreen}
        </Stack.Screen>
        <Stack.Screen name="SpellListSpellPopupScreen">
          {SpellListSpellPopupScreen}
        </Stack.Screen>
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
