import * as React from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import SpellItemCompact from "../components/SpellItemCompact";

interface SpellListScreenProps {
  list: SpellList;
}

const SpellListScreen = (props: SpellListScreenProps) => {
  return (
    <View style={[styles.container, AppStyles.appBackground]}>
      <View style={[AppStyles.headerContainer, styles.headerContainer]}>
        <View style={styles.headerTextContainer}>
          <Text style={AppStyles.headerText}>{props.list.name}</Text>
        </View>
        <View style={styles.headerImageContainer}>
          <Image style={styles.listImage} source={{ uri: "" }} />
        </View>
      </View>

      <ScrollView>
        {props.list.spellIDs.map(spellID => (
          <SpellItemCompact key={spellID.id} spellID={spellID} />
        ))}
      </ScrollView>
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
    flexDirection: "row"
  },
  headerTextContainer: {
    flex: 1
  },
  headerImageContainer: {
    flex: 0
  }
});
