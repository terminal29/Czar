import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { AppStyles } from "../styles/AppStyles";
import { TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/Ionicons";
interface SpellListAddBoxProps {
  onPress?: Function;
}

const width = Dimensions.get("window").width;
const cardWidth = width / 2.5;

const SpellListAddBox = (props: SpellListAddBoxProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
        <View style={styles.cardButton}>
          <Icon style={styles.iconColor} name={"ios-add"} size={40} />
        </View>
      </TouchableOpacity>
      <View style={[styles.cardBottomPadding]} />
    </View>
  );
};

export { SpellListAddBox };

const styles = StyleSheet.create({
  container: {
    flexBasis: "50%",
    padding: 10
  },
  cardButton: {
    borderColor: AppStyles.boxBackground.backgroundColor,
    borderWidth: 3,
    borderRadius: 10,
    width: "100%",
    height: 150,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  cardBottomPadding: {
    marginBottom: 30,
    marginLeft: 0
  },
  iconColor: {
    color: AppStyles.boxBackground.backgroundColor
  }
});
