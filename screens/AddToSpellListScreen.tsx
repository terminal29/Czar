import * as React from "react";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import { SpellListItemCompact } from "../components/SpellListItemCompact";
import { SpellListAddBox } from "../components/SpellListAddBox";
import { Spell } from "../structs/Spell";
import { SpellID } from "../structs/SpellID";
import RoundedIconButton from "../components/RoundedIconButton";

interface AddToSpellListScreen {
  spellID: SpellID;
  spellLists: SpellList[];
  onListPressed: Function;
  onCancelPressed: Function;
}

const AddToSpellListScreen = (props: AddToSpellListScreen) => {
  return (
    <View style={[styles.container, AppStyles.appBackground]}>
      <View style={[AppStyles.headerContainer]}>
        <Text style={[AppStyles.headerText]}>Add a Spell</Text>
        <Text style={[AppStyles.headerSubtext]}>
          Add {props.spellID.id} to a spell list
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
            />
          ))}
          <RoundedIconButton
            text={"Cancel"}
            iconName={"ios-close"}
            disabled={false}
            onPressed={props.onCancelPressed}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default AddToSpellListScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  spellListsScroll: {
    paddingTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  }
});
