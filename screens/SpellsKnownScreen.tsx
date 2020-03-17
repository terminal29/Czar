import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Picker,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView
} from "react-native";
import { AppStyles } from "../styles/AppStyles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useState, useCallback, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import SpellItemCompact from "../components/SpellItemCompact";
import { SpellID } from "../structs/SpellID";
import { useFocusEffect } from "@react-navigation/native";
import nextFrame from "next-frame";
import { createStackNavigator } from "@react-navigation/stack";
import SpellInfoScreen from "./SpellInfoScreen";
import Spinner from "react-native-spinkit";

const SpellInfoPopupStack = createStackNavigator();

interface SpellsKnownScreenProps {
  onSpellPressed?: Function;
}

const SpellsKnownScreen = (props: SpellsKnownScreenProps) => {
  const [filterBoxVisible, setFilterBoxVisibility] = useState(false);
  const [filteredSpellIDs, setFilteredSpellIDs] = useState<Array<SpellID>>([]);
  const [loading, setLoading] = useState(false);

  const [spellName, setSpellName] = useState("");

  const [spellClasses, setSpellClasses] = useState([]);
  const [selectedSpellClass, setSelectedSpellClass] = useState("any");

  const [spellLevels, setSpellLevels] = useState([]);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState("any");

  const [spellSchools, setSpellSchools] = useState([]);
  const [selectedSpellSchool, setSelectedSpellSchool] = useState("any");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const spellClass = selectedSpellClass !== "any" ? [selectedSpellClass] : [];
    const spellSchool =
      selectedSpellSchool !== "any" ? [selectedSpellSchool] : [];
    const spellLevel = selectedSpellLevel !== "any" ? [selectedSpellLevel] : [];
    const getSpells = async () => {
      const iterator = await SpellProvider.getSpellIDsByFilters(
        spellName,
        spellClass,
        spellSchool,
        spellLevel
      );
      let nextSpell = await iterator.next();
      let shownSpells = [];
      while (!cancelled && shownSpells.length <= 20 && !nextSpell.done) {
        if (nextSpell.value != null) {
          shownSpells.push(nextSpell.value);
          await nextFrame();
        }
        nextSpell = await iterator.next();
      }
      if (!cancelled) {
        setLoading(false);
        setFilteredSpellIDs(shownSpells);
      }
    };

    getSpells();

    return () => {
      cancelled = true;
    };
  }, [spellName, selectedSpellClass, selectedSpellLevel, selectedSpellSchool]);

  const updateClassList = (classList: Array<string>) => {
    setSpellClasses(classList.sort());
    setLoading(false);
  };
  const updateLevelList = (levelList: Array<string>) => {
    setSpellLevels(levelList.sort());
    setLoading(false);
  };
  const updateSchoolList = (schoolList: Array<string>) => {
    setSpellSchools(schoolList.sort());
    setLoading(false);
  };

  useEffect(() => {
    SpellProvider.observeClassList(updateClassList);
    SpellProvider.observeLevelList(updateLevelList);
    SpellProvider.observeSchoolList(updateSchoolList);
    setLoading(true);
    return () => {
      SpellProvider.unObserveClassList(updateClassList);
      SpellProvider.unObserveLevelList(updateLevelList);
      SpellProvider.unObserveSchoolList(updateSchoolList);
    };
  }, []);

  return (
    <View style={[AppStyles.appBackground, styles.container]}>
      <View style={[AppStyles.headerContainer, styles.headerHeightOverride]}>
        <Text style={[AppStyles.headerText]}>Spells Known</Text>
        <Text style={[AppStyles.headerSubtext]}>
          Find a spell by name, class, school, or level
        </Text>

        <View>
          <View
            style={[
              AppStyles.boxRounded,
              AppStyles.boxBackground,
              styles.searchBarContainer
            ]}
          >
            <View style={styles.mainSearchBox}>
              <TextInput
                placeholder={"Spell name..."}
                placeholderTextColor={AppStyles.inputPlaceholder.color}
                style={[AppStyles.headerSubtext, styles.searchInput]}
                onChangeText={text => text != spellName && setSpellName(text)}
                value={spellName}
              ></TextInput>
              <TouchableOpacity
                onPress={() => setFilterBoxVisibility(!filterBoxVisible)}
                style={styles.searchFiltersButton}
              >
                {!loading ? (
                  <Icon
                    style={[
                      AppStyles.inputPlaceholder,
                      styles.searchFiltersButtonLines
                    ]}
                    name={"filter-list"}
                    size={25}
                  />
                ) : (
                  <Spinner
                    style={[
                      AppStyles.inputPlaceholder,
                      styles.searchFiltersButtonLines
                    ]}
                    type={"Circle"}
                    size={25}
                  />
                )}
              </TouchableOpacity>
            </View>
            {filterBoxVisible && (
              <View style={styles.subSearchBox}>
                <View style={styles.subSearchBoxItemContainer}>
                  <Text
                    style={[
                      AppStyles.headerSubtext,
                      styles.subSearchBoxItemText
                    ]}
                  >
                    Class
                  </Text>
                  <Picker
                    mode="dropdown"
                    style={[
                      AppStyles.smallHeaderText,
                      styles.subSearchBoxItemPicker
                    ]}
                    itemStyle={[styles.subSearchBoxItemPickerItem]}
                    selectedValue={selectedSpellClass}
                    onValueChange={value => setSelectedSpellClass(value)}
                  >
                    {spellClasses.length == 0 ? (
                      <Picker.Item label={"No classes available"} value="" />
                    ) : (
                      [
                        <Picker.Item key={"any"} label={"Any"} value="" />,
                        ...spellClasses.map(spellClass => (
                          <Picker.Item
                            key={spellClass}
                            label={spellClass}
                            value={spellClass}
                          />
                        ))
                      ]
                    )}
                  </Picker>
                </View>
                <View style={styles.subSearchBoxItemContainer}>
                  <Text
                    style={[
                      AppStyles.headerSubtext,
                      styles.subSearchBoxItemText
                    ]}
                  >
                    School
                  </Text>
                  <Picker
                    mode="dropdown"
                    style={[
                      AppStyles.smallHeaderText,
                      styles.subSearchBoxItemPicker
                    ]}
                    itemStyle={[styles.subSearchBoxItemPickerItem]}
                    selectedValue={selectedSpellSchool}
                    onValueChange={value => setSelectedSpellSchool(value)}
                  >
                    {spellSchools.length == 0 ? (
                      <Picker.Item label={"No classes available"} value="" />
                    ) : (
                      [
                        <Picker.Item key={"any"} label={"Any"} value="" />,
                        ...spellSchools.map(spellSchool => (
                          <Picker.Item
                            key={spellSchool}
                            label={spellSchool}
                            value={spellSchool}
                          />
                        ))
                      ]
                    )}
                  </Picker>
                </View>
                <View style={styles.subSearchBoxItemContainer}>
                  <Text
                    style={[
                      AppStyles.headerSubtext,
                      styles.subSearchBoxItemText
                    ]}
                  >
                    Level
                  </Text>
                  <Picker
                    mode="dropdown"
                    style={[
                      AppStyles.smallHeaderText,
                      styles.subSearchBoxItemPicker
                    ]}
                    itemStyle={[styles.subSearchBoxItemPickerItem]}
                    selectedValue={selectedSpellLevel}
                    onValueChange={value => setSelectedSpellLevel(value)}
                  >
                    {spellLevels.length == 0 ? (
                      <Picker.Item label={"No levels available"} value="" />
                    ) : (
                      [
                        <Picker.Item key={"any"} label={"Any"} value="" />,
                        ...spellLevels.map(spellLevel => (
                          <Picker.Item
                            key={spellLevel}
                            label={spellLevel}
                            value={spellLevel}
                          />
                        ))
                      ]
                    )}
                  </Picker>
                </View>
                <View style={styles.subSearchBoxItemContainer}>
                  <Text
                    style={[
                      AppStyles.headerSubtext,
                      styles.subSearchBoxItemText
                    ]}
                  >
                    Order by
                  </Text>
                  <Picker
                    mode="dropdown"
                    style={[
                      AppStyles.smallHeaderText,
                      styles.subSearchBoxItemPicker
                    ]}
                  >
                    <Picker.Item label={"Alphabetical"} value={"alpha"} />
                    <Picker.Item label={"School"} value={"school"} />
                    <Picker.Item label={"Level"} value={"level"} />
                    <Picker.Item label={"Class"} value={"class"} />
                  </Picker>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={[AppStyles.edgePadding, styles.container]}>
        <ScrollView
          style={AppStyles.appBackground}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {filteredSpellIDs.map(spellID => (
            <SpellItemCompact
              key={spellID.id}
              spellID={spellID}
              style={styles.spellListItem}
              onPress={() => {
                props.onSpellPressed && props.onSpellPressed(spellID);
              }}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default SpellsKnownScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: -1
  },
  headerHeightOverride: {
    zIndex: 1
  },
  boxBorder: {
    borderColor: AppStyles.boxBackground.backgroundColor,
    borderWidth: 2
  },
  searchBarContainer: {
    flexDirection: "column",
    marginTop: 20,
    zIndex: 101
  },
  mainSearchBox: {
    flexDirection: "row"
  },
  subSearchBox: {
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  searchInput: {
    padding: 13,
    flex: 1,
    paddingLeft: 20,
    fontSize: 20
  },
  searchFiltersButton: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20
  },
  searchFiltersButtonLines: { fontSize: 25 },
  subSearchBoxItemContainer: {
    flexDirection: "row"
  },
  subSearchBoxItemText: {
    flexBasis: 100,
    textAlignVertical: "center",
    fontSize: 17
  },
  subSearchBoxItemPicker: { flex: 1, height: 35 },
  subSearchBoxItemPickerItem: {
    fontSize: 17,
    textTransform: "capitalize"
  },
  spellListItem: {
    marginBottom: 20
  },
  scrollViewContainer: {
    paddingTop: AppStyles.edgePadding.paddingHorizontal
  }
});
