import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellID } from "../structs/SpellID";
import { AppStyles } from "../styles/AppStyles";

interface SpellItemCompactProps {
  spellID: SpellID;
}

const SpellItemCompact = (props: SpellItemCompactProps) => {
  return (
    <View
      style={[styles.container, AppStyles.boxBackground, AppStyles.boxRounded]}
    >
      <Text style={AppStyles.smallHeaderText}>Absorb Elements</Text>
      <View style={styles.subHeaderContainer}>
        <View style={AppStyles.smallRightMargin}>
          <Text style={AppStyles.smallHeaderSubtext}>Cantrip</Text>
        </View>
        <View style={AppStyles.smallRightMargin}>
          <Text style={AppStyles.smallHeaderSubtext}>Reaction</Text>
        </View>

        <View style={AppStyles.smallRightMargin}>
          <Text style={AppStyles.smallHeaderSubtext}>VS</Text>
        </View>

        <View style={AppStyles.smallRightMargin}>
          <Text style={AppStyles.smallHeaderSubtext}>Self</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text numberOfLines={3} ellipsizeMode="tail" style={AppStyles.infoText}>
          The spell captures some of the incoming energy, lessening its effect
          on you and storing it for your next melee attack. You have resistance
          to the
        </Text>
      </View>
    </View>
  );
};

export default SpellItemCompact;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 12
  },
  subHeaderContainer: {
    marginTop: 5,
    flexDirection: "row"
  },
  infoContainer: {
    marginTop: 5
  }
});
