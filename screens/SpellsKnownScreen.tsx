import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Picker,
  ScrollView,
  FlatList,
  Dimensions
} from "react-native";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import { useState, useEffect, useCallback, useRef } from "react";
import SpellProvider from "../data/SpellProvider";
import { SpellID } from "../structs/SpellID";
import nextFrame from "next-frame";
import { StyleProvider } from "../data/StyleProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import SpellItemCompact from "../components/SpellItemCompact";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import Toast from "react-native-root-toast";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider
} from "recyclerlistview";
import Spinner from "react-native-spinkit";

interface SpellsKnownScreenProps {
  onSpellPressed?: Function;
}

let { width } = Dimensions.get("window");

const makeCancelable = promise => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      error => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    }
  };
};

const SpellsKnownScreen = (props: SpellsKnownScreenProps) => {
  const [filterBoxVisible, setFilterBoxVisibility] = useState(false);

  const maxFilteredSpells = useRef(0);
  const filteredSpellIDs = useRef<Array<SpellID>>([]);

  const onSearchFiltersSettled = useRef(0);
  const onUpdatingSearchResults = useRef(null);

  const spellsPerBatch = 30;

  const [spellName, setSpellName] = useState("");
  const [spellClasses, setSpellClasses] = useState([]);
  const [selectedSpellClass, setSelectedSpellClass] = useState("any");
  const [spellLevels, setSpellLevels] = useState([]);
  const [selectedSpellLevel, setSelectedSpellLevel] = useState("any");
  const [spellSchools, setSpellSchools] = useState([]);
  const [selectedSpellSchool, setSelectedSpellSchool] = useState("any");

  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1.id !== r2.id;
    })
  );

  const getNewSpellIDs = () =>
    new Promise<Array<SpellID>>(async (resolve, reject) => {
      const name = spellName;
      const spellClass =
        selectedSpellClass !== "any" ? [selectedSpellClass] : [];
      const spellSchool =
        selectedSpellSchool !== "any" ? [selectedSpellSchool] : [];
      const spellLevel =
        selectedSpellLevel !== "any" ? [selectedSpellLevel] : [];

      const spellIDCount = await SpellProvider.getNumSpellsByFilters(
        name,
        spellClass,
        spellSchool,
        spellLevel
      );
      const spellIDs = await SpellProvider.getSpellIDsByFiltersSection(
        name,
        0,
        spellIDCount,
        spellClass,
        spellSchool,
        spellLevel
      );
      resolve(spellIDs);
    });

  useEffect(() => {
    if (onSearchFiltersSettled.current) {
      clearTimeout(onSearchFiltersSettled.current);
    }
    onSearchFiltersSettled.current = setTimeout(() => {
      onUpdatingSearchResults.current = makeCancelable(getNewSpellIDs());
      onUpdatingSearchResults.current.promise.then(spellIDs => {
        filteredSpellIDs.current = spellIDs;
        maxFilteredSpells.current = spellIDs.length;
        setDataProvider(dataProvider.cloneWithRows(filteredSpellIDs.current));
        console.log("Updated spell list");
      });
    }, 500);
    return () => {
      if (onSearchFiltersSettled.current)
        // timeout has handle so cancel
        clearTimeout(onSearchFiltersSettled.current);
      if (onUpdatingSearchResults.current) {
        // Currently getting data so cancel
        onUpdatingSearchResults.current.cancel();
      }
    };
  }, [spellName, selectedSpellClass, selectedSpellLevel, selectedSpellSchool]);

  const updateClassList = (classList: Array<string>) => {
    setSpellClasses(classList.sort());
  };
  const updateLevelList = (levelList: Array<string>) => {
    setSpellLevels(levelList.sort());
  };
  const updateSchoolList = (schoolList: Array<string>) => {
    setSpellSchools(schoolList.sort());
  };

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

  const renderSpellItem = ({ item, index }) => {
    return (
      <SpellItemCompact
        key={item.id}
        spellID={item}
        onPress={() => props.onSpellPressed?.(item)}
        style={[
          index !== dataProvider.getSize() - 1 && styles.listItemBorderBottom
        ]}
      />
    );
  };

  const layoutProvider = new LayoutProvider(
    () => 0,
    (type, dim) => {
      dim.width = width - 2 * styles.listContainer.paddingHorizontal;
      dim.height = 65;
    }
  );

  const renderFooter = () =>
    dataProvider.getSize() !== maxFilteredSpells.current && (
      <View style={styles.ptrContainer}>
        <Text style={[StyleProvider.styles.listItemTextWeak, styles.ptrText]}>
          Loading
        </Text>
        <Spinner
          type={"FadingCircleAlt"}
          size={30}
          color={StyleProvider.styles.listItemTextWeak.color}
        />
      </View>
    );

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>Spell Search</Text>
      </View>
      {makeFiltersContainer()}
      {/*<FlatList
        keyExtractor={keyExtractor}
        data={filteredSpellIDs}
        renderItem={renderSpellItem}
        contentContainerStyle={styles.listContainer}
        getItemLayout={getItemHeight}
        removeClippedSubviews={false}
        onEndReached={() => setToLoadMore(true)}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
      />*/}

      {dataProvider.getSize() > 0 && (
        <RecyclerListView
          onEndReachedThreshold={0.5}
          renderAheadOffset={65 * spellsPerBatch}
          scrollViewProps={{ style: [styles.listContainer] }}
          dataProvider={dataProvider}
          rowRenderer={(type, data, index) =>
            renderSpellItem({ item: data, index })
          }
          layoutProvider={layoutProvider}
          renderFooter={renderFooter}
          extendedState={{ asdf: filteredSpellIDs }}
        />
      )}
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
  },
  ptrContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: StyleProvider.styles.edgePadding.padding
  },
  ptrText: {
    marginBottom: 8
  }
});
