import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Picker,
  ScrollView,
  FlatList
} from "react-native";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import { useState, useEffect, useCallback } from "react";
import SpellProvider from "../data/SpellProvider";
import { SpellID } from "../structs/SpellID";
import nextFrame from "next-frame";
import { StyleProvider } from "../data/StyleProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import SpellItemCompact from "../components/SpellItemCompact";

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
      let additionalShownSpells = [];
      while (!cancelled && !nextSpell.done) {
        if (nextSpell.value != null) {
          additionalShownSpells.push(nextSpell.value);
          await nextFrame();
        }
        if (additionalShownSpells.length == 20) {
          setFilteredSpellIDs(additionalShownSpells);
        }
        nextSpell = await iterator.next();
      }
      if (!cancelled) {
        setLoading(false);
        setFilteredSpellIDs(additionalShownSpells);
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

  const makeSpellFilter = (
    name: string,
    currentValue: string,
    possibleValues: string[],
    onValueChanged: Function,
    containerStyles?: any[]
  ) => (
    <View style={[styles.filterPickerContainer, ...[containerStyles]]}>
      <View style={styles.filterPickerNameContainer}>
        <Text style={StyleProvider.styles.listItemTextStrong}>{name}</Text>
      </View>
      <View style={styles.filterPickerPickerContainer}>
        <MdIcon
          name="arrow-drop-down"
          size={19}
          style={[
            StyleProvider.styles.listItemIconStrong,
            { position: "absolute", right: 14, top: 5 }
          ]}
          pointerEvents="none"
        />
        <Picker
          style={[
            styles.filterPickerPicker,
            { color: StyleProvider.styles.listItemTextWeak.color } // Not an error, works as intended
          ]}
          mode="dropdown"
          selectedValue={currentValue}
          onValueChange={value => onValueChanged(value)}
          itemStyle={StyleProvider.styles.listItemTextWeak}
        >
          {possibleValues.length === 0 ? (
            <Picker.Item label={"Not available"} value="" />
          ) : (
            [
              <Picker.Item key={"any"} label={"Any"} value="" />,
              ...possibleValues.map(value => (
                <Picker.Item key={value} label={value} value={value} />
              ))
            ]
          )}
        </Picker>
      </View>
    </View>
  );

  const makeFiltersContainer = () => (
    <View style={[styles.filtersContainer]}>
      <View style={[styles.visibleFiltersContainer]}>
        <TextInput
          style={[
            StyleProvider.styles.listItemTextStrong,
            styles.filtersTextInput
          ]}
          placeholder="Enter a spell name..."
          placeholderTextColor={
            StyleProvider.styles.textInputPlaceholderText.color
          }
          value={spellName}
          onChangeText={value => setSpellName(value)}
        />
        <TouchableOpacity
          onPress={() => setFilterBoxVisibility(!filterBoxVisible)}
          containerStyle={[styles.filterOpenButton]}
        >
          <MdIcon
            name="filter-list"
            size={30}
            style={[
              StyleProvider.styles.listItemIconStrong,
              filterBoxVisible && styles.filterOpenButtonIconToggled
            ]}
          />
        </TouchableOpacity>
      </View>
      {filterBoxVisible && (
        <View style={[styles.hiddenFiltersContainer]}>
          {makeSpellFilter(
            "Class",
            selectedSpellClass,
            spellClasses,
            setSelectedSpellClass,
            [styles.filterPickerBottomMargin]
          )}
          {makeSpellFilter(
            "Level",
            selectedSpellLevel,
            spellLevels,
            setSelectedSpellLevel,
            [styles.filterPickerBottomMargin]
          )}
          {makeSpellFilter(
            "School",
            selectedSpellSchool,
            spellSchools,
            setSelectedSpellSchool
          )}
        </View>
      )}
    </View>
  );
  const renderSpellItem = useCallback(
    ({ item, index }) => (
      <SpellItemCompact
        key={item.id}
        spellID={item}
        onPress={() => props.onSpellPressed?.(item)}
        style={[
          index !== filteredSpellIDs.length - 1 && styles.listItemBorderBottom
        ]}
      />
    ),
    [filteredSpellIDs]
  );

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>Spell Search</Text>
      </View>
      {makeFiltersContainer()}
      <FlatList
        data={filteredSpellIDs}
        renderItem={renderSpellItem}
        removeClippedSubviews={true} // Unmount components when outside of window
        initialNumToRender={2} // Reduce initial render amount
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default SpellsKnownScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pageTitleContainer: {
    height: 93,
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    justifyContent: "center",
    alignItems: "center"
  },
  filtersContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    paddingVertical: StyleProvider.styles.edgePadding.padding - 10
  },
  visibleFiltersContainer: {
    paddingLeft: StyleProvider.styles.edgePadding.padding,
    flexDirection: "row"
  },
  hiddenFiltersContainer: {
    marginTop: StyleProvider.styles.edgePadding.padding - 10,
    marginHorizontal: StyleProvider.styles.edgePadding.padding,
    paddingVertical: StyleProvider.styles.edgePadding.padding,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle
  },
  hiddenFiltersContainerVisible: {},
  filtersTextInput: { flex: 1 },
  filterOpenButton: {
    flexBasis: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  filterOpenButtonIconToggled: {
    transform: [
      {
        rotateZ: "180deg"
      }
    ]
  },
  filterPickerContainer: {
    flexDirection: "row"
  },
  filterPickerNameContainer: {
    flex: 0.5,
    justifyContent: "center",
    paddingTop: 2
  },
  filterPickerPickerContainer: {
    flex: 0.5
  },
  filterPickerPicker: {
    height: 30,
    backgroundColor: "transparent"
  },
  filterPickerItem: {},
  filterPickerBottomMargin: {
    marginBottom: StyleProvider.styles.edgePadding.padding - 10
  },
  listItemBorderBottom: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle
  },
  listContainer: {
    paddingHorizontal: StyleProvider.styles.edgePadding.padding
  }
});
