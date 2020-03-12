import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { AppStyles } from "../styles/AppStyles";
import Icon from "react-native-vector-icons/Ionicons";

interface SpellSourceItemProps {
  sourceURL: string;
}

const SpellSourceItem = (props: SpellSourceItemProps) => {
  return (
    <View
      style={[AppStyles.boxBackground, AppStyles.boxRounded, styles.container]}
    >
      <View style={styles.sourceURL}>
        <Text style={[AppStyles.headerSubtext, { flex: 0 }]}>
          {props.sourceURL}
        </Text>
      </View>
      <View style={styles.sourceDeleteButton}>
        <Icon
          style={[AppStyles.headerSubtext, styles.sourceDeleteButtonX]}
          name={"ios-close"}
          size={40}
        />
      </View>
    </View>
  );
};

export default SpellSourceItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20
  },
  sourceURL: {
    flex: 1,
    padding: 20
  },
  sourceDeleteButton: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20
  },
  sourceDeleteButtonX: { fontSize: 40 }
});
