import * as React from "react";
import { Text, View, StyleSheet, TextInput, Picker } from "react-native";

interface SpellsKnownScreenProps {}

const SpellsKnownScreen = (props: SpellsKnownScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>Spells Known</Text>
      <Text>Find a spell by name, class, school, or level.</Text>
      <View>
        <TextInput placeholder={"Spell name..."}></TextInput>
        <View>
          <Text>Class</Text>
          <Picker></Picker>
        </View>
        <View>
          <Text>School</Text>
          <Picker></Picker>
        </View>
        <View>
          <Text>Level</Text>
          <Picker></Picker>
        </View>
        <View>
          <Text>Order by</Text>
          <Picker></Picker>
        </View>
      </View>

      <View>
        <Text>Absorb Elements</Text>
        <Text>Cantrips</Text>
        <Text>Reaction</Text>
        <Text>VS</Text>
        <Text>Self</Text>
        <Text>
          The spell captures some of the incoming energy, lessening its effect
          on you and storing it for your next melee attack. You have resistance
          to the...
        </Text>
      </View>
    </View>
  );
};

export default SpellsKnownScreen;

const styles = StyleSheet.create({
  container: {}
});
