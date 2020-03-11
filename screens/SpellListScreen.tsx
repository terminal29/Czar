import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellList } from "../structs/SpellList";

interface SpellListScreenProps {
  list: SpellList;
}

const SpellListScreen = (props: SpellListScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>{props.list.name}</Text>
      <View>
        {props.list.spellIDs.map(spellID => (
          <Text>{spellID.id}</Text>
        ))}
      </View>
    </View>
  );
};

export default SpellListScreen;

const styles = StyleSheet.create({
  container: {}
});
