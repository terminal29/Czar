import * as React from "react";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import { SpellListItemCompact } from "../components/SpellListItemCompact";

interface SpellListsScreenProps {
  spellLists: SpellList[];
}

const SpellListsScreen = (props: SpellListsScreenProps) => {
  return (
    <View style={[styles.container, AppStyles.appBackground]}>
      <View style={[AppStyles.headerContainer]}>
        <Text style={[AppStyles.headerText]}>Spell Lists</Text>
        <Text style={[AppStyles.headerSubtext]}>
          Manage your characters' spells
        </Text>
      </View>
      <View style={[AppStyles.edgePadding]}>
        <ScrollView>
          <View style={styles.spellListsScroll}>
            {props.spellLists.map(spellList => (
              <SpellListItemCompact list={spellList} />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SpellListsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  spellListsScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly"
  }
});
