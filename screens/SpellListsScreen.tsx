import * as React from "react";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import { SpellListItemCompact } from "../components/SpellListItemCompact";
import { SpellListAddBox } from "../components/SpellListAddBox";

interface SpellListsScreenProps {
  spellLists: SpellList[];
  onListPressed?: Function;
  onAddListPressed?: Function;
  onListLongPressed?: Function;
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
      <View style={[AppStyles.edgePadding, styles.container]}>
        <ScrollView contentContainerStyle={styles.spellListsScroll}>
          {props.spellLists.map(spellList => (
            <SpellListItemCompact
              key={spellList.id}
              list={spellList}
              onPress={() =>
                props.onListPressed && props.onListPressed(spellList)
              }
              onLongPress={() => {
                props.onListLongPressed && props.onListLongPressed(spellList);
              }}
            />
          ))}
          <SpellListAddBox
            key={"addBox"}
            onPress={() => {
              props.onAddListPressed && props.onAddListPressed();
            }}
          ></SpellListAddBox>
        </ScrollView>
      </View>
    </View>
  );
};

export default SpellListsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  spellListsScroll: {
    paddingTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  }
});
