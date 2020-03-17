import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { AppStyles } from "../styles/AppStyles";
import Icon from "react-native-vector-icons/Ionicons";

interface RoundedIconButtonProps {
  style?: any;
  text: string;
  iconName: string;
  onPressed?: Function;
  onPressedWhileDisabled?: Function;
  disabled: boolean;
}

const RoundedIconButton = (props: RoundedIconButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        AppStyles.boxBackground,
        AppStyles.boxRounded,
        styles.container,
        props.style
      ]}
      onPress={() =>
        props.disabled
          ? props.onPressedWhileDisabled && props.onPressedWhileDisabled()
          : props.onPressed && props.onPressed()
      }
    >
      <View style={styles.sourceURL}>
        <Text
          style={[
            AppStyles.headerSubtext,
            props.disabled && styles.sourceDeleteButtonXDisabled,
            { flex: 0 }
          ]}
        >
          {props.text}
        </Text>
      </View>
      <View style={styles.sourceDeleteButton}>
        <Icon
          style={[
            AppStyles.headerSubtext,
            styles.sourceDeleteButtonX,
            props.disabled && styles.sourceDeleteButtonXDisabled
          ]}
          name={props.iconName}
          size={40}
        />
      </View>
    </TouchableOpacity>
  );
};

export default RoundedIconButton;

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
  sourceDeleteButtonX: { fontSize: 40 },
  sourceDeleteButtonXDisabled: { color: "#a0a0a0" }
});
