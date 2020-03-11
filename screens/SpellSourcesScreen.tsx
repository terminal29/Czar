import * as React from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";

interface SpellSourcesScreenProps {
  spellSources: string[];
}

const SpellSourcesScreen = (props: SpellSourcesScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>Spell Sources</Text>
      <Text>Manage your spell sources</Text>
      <Button title={"Reload Spell Data"} onPress={() => {}} />
      <TextInput></TextInput>
      {props.spellSources.map(spellSource => (
        <Text>{spellSource}</Text>
      ))}
    </View>
  );
};

export default SpellSourcesScreen;

const styles = StyleSheet.create({
  container: {}
});
