import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  ScrollView
} from "react-native";
import { SpellList } from "../structs/SpellList";
import SpellItemCompact from "../components/SpellItemCompact";
import SpellListProvider from "../data/SpellListProvider";
import { useState, useEffect } from "react";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import PullableScrollView from "../components/PullableScrollView";
import Animated from "react-native-reanimated";
import { useMemoOne } from "use-memo-one";
import ModSpellItemCompact from "../components/ModSpellItemCompact";
import SpellProvider from "../data/SpellProvider";

interface SpellListEditScreenProps {
  list: SpellList;
  onSpellRemoved: Function;
  onAddDivider: Function;
  onConfirmed: Function;
  onSpellReordered: Function;
}

const SpellListEditScreen = (props: SpellListEditScreenProps) => {
  const [spellIDs, setSpellIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollTranslateY = useMemoOne(() => new Animated.Value(0), []);

  useEffect(() => {
    let cancelled = false;
    const updateSpellIDs = spellIDs => {
      if (!cancelled) {
        setSpellIDs(spellIDs);
        setLoading(false);
      }
    };
    setLoading(true);
    SpellListProvider.observeSingleList(updateSpellIDs, props.list);
    return () => {
      cancelled = true;
      SpellListProvider.unObserveSingleList(updateSpellIDs);
    };
  }, []);

  const onPullDown = () => {
    props.onConfirmed?.(props.list);
  };

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      {props.list.thumbnailURI ? (
        <ImageBackground
          style={[styles.pageTitleContainer]}
          source={{ uri: props.list.thumbnailURI }}
          resizeMode="stretch"
        >
          <View style={styles.darkTitleBackgroundOverlay} />
          <Text style={StyleProvider.styles.pageTitleText}>
            Edit Spell Selection
          </Text>
        </ImageBackground>
      ) : (
        <View style={[styles.pageTitleContainer]}>
          <View style={styles.darkTitleBackgroundOverlay} />
          <Text style={StyleProvider.styles.pageTitleText}>
            Edit Spell Selection
          </Text>
        </View>
      )}
      <PullableScrollView
        contentContainerStyle={styles.scrollContainer}
        threshold={50}
        {...{ scrollTranslateY }}
        onPull={onPullDown}
        willPull={() => {}}
      >
        <View>
          {spellIDs.map(spellID => (
            <ModSpellItemCompact
              style={styles.spellListItemBorder}
              key={spellID.id}
              spellID={spellID}
              onRemovePressed={async () => {
                try {
                  await SpellListProvider.removeSpellIDFromList(
                    props.list,
                    spellID
                  );
                } catch (e) {
                  console.log(e);
                }
              }}
              onUpPressed={() => {}}
              onDownPressed={() => {}}
            />
          ))}
        </View>

        <View style={styles.ptrContainer}>
          <Text style={[StyleProvider.styles.listItemTextWeak]}>
            Pull to Confirm
          </Text>
          <MdIcon
            name="keyboard-arrow-down"
            size={30}
            style={[StyleProvider.styles.listItemTextWeak, styles.ptrIcon]}
          />
        </View>
      </PullableScrollView>
    </View>
  );
};

export default SpellListEditScreen;

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
  darkTitleBackgroundOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: StyleProvider.styles.mainBackground.backgroundColor,
    opacity: 0.7
  },
  ptrContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: StyleProvider.styles.edgePadding.padding
  },
  ptrIcon: {
    fontSize: 30
  },
  scrollContainer: {
    flex: 0,
    paddingHorizontal: StyleProvider.styles.edgePadding.padding
  },
  spellListItemBorder: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    paddingLeft: StyleProvider.styles.edgePadding.padding
  }
});
