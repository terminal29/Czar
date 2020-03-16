import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellID } from "../structs/SpellID";

interface SpellInfoScreenProps {
  spellID: SpellID;
  onBackPressed?: Function;
  extraButtons?: any[];
}

const SpellInfoScreen = (props: SpellInfoScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>Absorb Elements</Text>
      <View>
        <Text>Level</Text>
        <Text>1</Text>
      </View>
      <View>
        <Text>School</Text>
        <Text>Abjuration</Text>
      </View>
      <View>
        <Text>Class</Text>
        <Text>Artificer, Druid, Ranger, Sorcerer, Wizard</Text>
      </View>
      <View>
        <Text>Range</Text>
        <Text>Self</Text>
      </View>
      <View>
        <Text>Components</Text>
        <Text>V</Text>
      </View>
      <View>
        <Text>Duration</Text>
        <Text>1 round</Text>
      </View>
      <View>
        <Text>Ritual</Text>
        <Text>No</Text>
      </View>
      <View>
        <Text>Concentration</Text>
        <Text>No</Text>
      </View>
      <View>
        <Text>
          The spell captures some of the incoming energy, lessening its effect
          on you and storing it for your next melee attack. You have resistance
          to the triggering damage type until the start of your next turn. Also,
          the first time you hit with a melee attack on your next turn, the
          target takes an extra 1d6 damage of the triggering type, and the spell
          ends.
        </Text>
        <Text>
          At Higher Levels. When you cast this spell using a spell slot of 2nd
          level or higher, the extra damage increases by 1d6 for each slot level
          above 1st.
        </Text>
        <Text>Pg. 34 PHB</Text>
      </View>
      <View>
        <Text>Add to List</Text>
      </View>
      <View>
        <Text>Remove from List</Text>
      </View>
    </View>
  );
};

export default SpellInfoScreen;

const styles = StyleSheet.create({
  container: {}
});
