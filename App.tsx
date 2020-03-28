import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import SpellListsScreen from "./screens/SpellListsScreen";
import { SpellList } from "./structs/SpellList";
import SpellSourcesScreen from "./screens/SpellSourcesScreen";
import SpellsKnownScreen from "./screens/SpellsKnownScreen";
import SpellInfoScreen from "./screens/SpellInfoScreen";
import SpellListScreen from "./screens/SpellListScreen";
import { NavigationContainer, TabActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppStyles } from "./styles/AppStyles";
import SpellProvider from "./data/SpellProvider";
import { createStackNavigator } from "@react-navigation/stack";
import Toast from "react-native-root-toast";
import SpellListAddScreen from "./screens/SpellListAddScreen";
import { SpellID } from "./structs/SpellID";
import SpellListProvider from "./data/SpellListProvider";
import SpellListEditScreen from "./screens/SpellListEditScreen";
import FloatingTabBar from "./components/FloatingTabBar";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import McIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { StyleProvider } from "./data/StyleProvider";
import Modal from "react-native-modal";
import AddSpellToListModal from "./components/AddSpellToListModal";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
export default function App() {
  const [spellLists, setSpellLists] = useState<Array<SpellList>>([]);
  const [spellSources, setSpellSources] = useState([]);
  const [spellsLoading, setSpellsLoading] = useState(false);
  const [addToListModalVisible, setAddToListModalVisible] = useState(false);
  const lastShownSpellID = useRef("");

  useEffect(() => {
    SpellProvider.getSpellIDs().then(ids =>
      Promise.all(ids.map(id => SpellProvider.getSpellByID(id)))
    );
  }, []);

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
          SpellProvider.downloadSpellsFromSources()
            .then(() => {
              updateSourceURLs();
              setSpellsLoading(false);
            })
            .catch(e => {
              console.log(e);
              setSpellsLoading(false);
              Toast.show("Failed to download spell data");
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

  const TabBar = ({ state, descriptors, navigation }) => {
    return (
      <FloatingTabBar
        navigationState={state}
        navigationDescriptors={descriptors}
        navigation={navigation}
        getIconForRouteName={(routeName, active) => {
          switch (routeName) {
            case "Sources":
              return (
                <McIcon
                  name={"file-download"}
                  size={30}
                  color={
                    active
                      ? StyleProvider.styles.navbarItemFocussed.color
                      : StyleProvider.styles.navbarItemUnfoccused.color
                  }
                />
              );
            case "SpellLists":
              return (
                <MdIcon
                  name={"book"}
                  size={30}
                  color={
                    active
                      ? StyleProvider.styles.navbarItemFocussed.color
                      : StyleProvider.styles.navbarItemUnfoccused.color
                  }
                />
              );
            case "Search":
              return (
                <McIcon
                  name={"file-search"}
                  size={30}
                  color={
                    active
                      ? StyleProvider.styles.navbarItemFocussed.color
                      : StyleProvider.styles.navbarItemUnfoccused.color
                  }
                />
              );
          }
        }}
      ></FloatingTabBar>
    );
  };

  const MainAppScreen = () => (
    <>
      <Tab.Navigator tabBar={TabBar} initialRouteName={"Sources"}>
        <Tab.Screen name="Sources">{SourcesScreen}</Tab.Screen>
        <Tab.Screen name="SpellLists">{ListsScreen}</Tab.Screen>
        <Tab.Screen name="Search">{KnownScreen}</Tab.Screen>
      </Tab.Navigator>
      <Modal
        isVisible={addToListModalVisible}
        onBackButtonPress={() => setAddToListModalVisible(false)}
        useNativeDriver={true}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <AddSpellToListModal
          spellID={new SpellID(lastShownSpellID.current)}
          lists={spellLists}
          onBackPressed={() => setAddToListModalVisible(false)}
          onSpellListPressed={async (spellID, spellList) => {
            setAddToListModalVisible(false);
            try {
              await SpellListProvider.addSpellIDToList(spellList, spellID);
              Toast.show("Added spell to list", {
                duration: Toast.durations.LONG
              });
            } catch (e) {
              Toast.show("This spell is already on that list", {
                duration: Toast.durations.LONG
              });
            }
          }}
        />
      </Modal>
    </>
  );

  const SpellPopupScreen = useCallback(
    ({ route, navigation }) => (
      <SpellInfoScreen
        spellID={route.params.spellID}
        extraButtons={[
          {
            text: "Add to list",
            iconName: "add",
            onPress: () => {
              lastShownSpellID.current = route.params.spellID.id;
              setAddToListModalVisible(true);
            }
          },
          {
            text: "Go back",
            iconName: "keyboard-backspace",
            onPress: () => navigation.goBack()
          }
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
          {
            text: "Go back",
            iconName: "ios-arrow-back",
            onPress: () => navigation.goBack()
          }
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
