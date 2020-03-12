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
import { useState } from "react";
import SpellProvider from "../data/SpellProvider";
import SpellItemCompact from "../components/SpellItemCompact";
import { SpellID } from "../structs/SpellID";

interface SpellsKnownScreenProps {}

const SpellsKnownScreen = (props: SpellsKnownScreenProps) => {
  const [filterBoxVisible, setFilterBoxVisibility] = useState(true);
  const [filteredSpellIDs, setFilteredSpellIDs] = useState<Array<SpellID>>([
    { id: "0" },
    { id: "0" },
    { id: "0" },
    { id: "0" },
    { id: "0" },
    { id: "0" },
    { id: "0" },
    { id: "0" }
  ]);

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
                  >
                    {SpellProvider.getClasses().length == 0 ? (
                      <Picker.Item label={"No classes available"} value="" />
                    ) : (
                      SpellProvider.getClasses().map(spellLevel => (
                        <Picker.Item label={spellLevel} value={spellLevel} />
                      ))
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
                  >
                    {SpellProvider.getSchools().length == 0 ? (
                      <Picker.Item label={"No schools available"} value="" />
                    ) : (
                      SpellProvider.getSchools().map(spellClass => (
                        <Picker.Item label={spellClass} value={spellClass} />
                      ))
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
                  >
                    {SpellProvider.getLevels().length == 0 ? (
                      <Picker.Item label={"No levels available"} value="" />
                    ) : (
                      SpellProvider.getLevels().map(spellLevel => (
                        <Picker.Item label={spellLevel} value={spellLevel} />
                      ))
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
