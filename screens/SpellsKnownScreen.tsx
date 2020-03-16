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

interface SpellsKnownScreenProps {}

const SpellsKnownScreen = (props: SpellsKnownScreenProps) => {
  const [filterBoxVisible, setFilterBoxVisibility] = useState(false);
  const [filteredSpellIDs, setFilteredSpellIDs] = useState<Array<SpellID>>([]);

  const [spellName, setSpellName] = useState("");

  const [spellClasses, setSpellClasses] = useState([]);
  const [selectedSpellClass, setSelectedSpellClass] = useState("any");

  const [spellLevels, setSpellLevels] = useState([]);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState("any");

  const [spellSchools, setSpellSchools] = useState([]);
  const [selectedSpellSchool, setSelectedSpellSchool] = useState("any");

  useEffect(() => {
    let cancelled = false;
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
      setFilteredSpellIDs(shownSpells);
    };
    //setFilteredSpellIDs([]);

    getSpells();
    return () => {
      cancelled = true;
    };
  }, [spellName, selectedSpellClass, selectedSpellLevel, selectedSpellSchool]);

  const updateClassList = (classList: Array<string>) =>
    setSpellClasses(classList.sort());
  const updateLevelList = (levelList: Array<string>) =>
    setSpellLevels(levelList.sort());
  const updateSchoolList = (schoolList: Array<string>) =>
    setSpellSchools(schoolList.sort());

  useEffect(() => {
    SpellProvider.observeClassList(updateClassList);
    SpellProvider.observeLevelList(updateLevelList);
    SpellProvider.observeSchoolList(updateSchoolList);
    return () => {
      SpellProvider.unObserveClassList(updateClassList);
      SpellProvider.unObserveLevelList(updateLevelList);
      SpellProvider.unObserveSchoolList(updateSchoolList);
    };
  }, []);

  return (
    <View style={[AppStyles.appBackground, styles.container]}>
      {filterBoxVisible && (
        <TouchableWithoutFeedback onPress={() => setFilterBoxVisibility(false)}>
          <View
            style={[StyleSheet.absoluteFillObject, styles.backgroundOverlay]}
          />
        </TouchableWithoutFeedback>
      )}
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
                onChangeText={text => setSpellName(text)}
              ></TextInput>
              <TouchableOpacity
                onPress={() => setFilterBoxVisibility(!filterBoxVisible)}
                style={styles.searchFiltersButton}
              >
                <Icon
                  style={[
                    AppStyles.inputPlaceholder,
                    styles.searchFiltersButtonLines
                  ]}
                  name={"filter-list"}
                  size={25}
                ></Icon>
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
        <ScrollView>
          {filteredSpellIDs.map(spellID => (
            <SpellItemCompact
              key={spellID.id}
              spellID={spellID}
              style={styles.spellListItem}
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
    flex: 1
  },
  headerHeightOverride: {
    height: 200
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
  backgroundOverlay: {
    backgroundColor: "#0f0f0f",
    opacity: 0.9,
    zIndex: 100
  },
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
    marginTop: 10,
    marginBottom: 20
  }
});
