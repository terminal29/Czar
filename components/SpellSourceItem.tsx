import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { AppStyles } from "../styles/AppStyles";
import Icon from "react-native-vector-icons/Ionicons";

interface SpellSourceItemProps {
  style?: any;
  sourceURL: string;
  onRemoveButtonPressed?: Function;
}

const SpellSourceItem = (props: SpellSourceItemProps) => {
  return (
    <View
      style={[
        AppStyles.boxBackground,
        AppStyles.boxRounded,
        styles.container,
        props.style
      ]}
    >
      <View style={styles.sourceURL}>
        <Text style={[AppStyles.headerSubtext, { flex: 0 }]}>
          {props.sourceURL}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.sourceDeleteButton}
        onPress={() =>
          props.onRemoveButtonPressed &&
          props.onRemoveButtonPressed(props.sourceURL)
        }
      >
        <Icon
          style={[AppStyles.headerSubtext, styles.sourceDeleteButtonX]}
          name={"ios-close"}
          size={40}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SpellSourceItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
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
