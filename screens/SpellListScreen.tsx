import * as React from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import SpellItemCompact from "../components/SpellItemCompact";
import SpellListProvider from "../data/SpellListProvider";
import { useState, useEffect } from "react";
import RoundedIconButton from "../components/RoundedIconButton";

interface SpellListScreenProps {
  list: SpellList;
  onSpellPressed: Function;
  onNavigateToSpellSearchPressed: Function;
}

const SpellListScreen = (props: SpellListScreenProps) => {
  const [spellIDs, setSpellIDs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={[styles.container, AppStyles.appBackground]}>
      <View style={[AppStyles.headerContainer, styles.headerContainer]}>
        <View style={styles.headerTextContainer}>
          <Text style={AppStyles.headerText}>{props.list.name}</Text>
        </View>
        <View style={styles.headerImageContainer}>
          <Image
            style={styles.listImage}
            source={{ uri: props.list.thumbnailURI }}
          />
        </View>
      </View>
      <View style={[AppStyles.edgePadding, styles.container]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <RoundedIconButton
            text={"Add Spells"}
            iconName={"ios-arrow-forward"}
            disabled={false}
            onPressed={props.onNavigateToSpellSearchPressed}
            style={[styles.bottomMargin]}
          />
          {spellIDs.map(spellID => (
            <SpellItemCompact
              key={spellID.id}
              spellID={spellID}
              style={styles.bottomMargin}
              onPress={() => props.onSpellPressed(spellID)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default SpellListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listImage: {
    width: 110,
    height: 100,
    marginTop: -5,
    backgroundColor: "#fff"
  },
  headerContainer: {
    flexDirection: "row",
    height: 150
  },
  headerTextContainer: {
    flex: 1
  },
  headerImageContainer: {
    flex: 0
  },
  bottomMargin: {
    marginBottom: 20
  },
  scrollContainer: {
    paddingTop: AppStyles.edgePadding.paddingHorizontal
  }
});
