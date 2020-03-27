import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellSourceItemProps {
  style?: any;
  sourceURL: string;
  onRemoveButtonPressed?: Function;
  disabled: boolean;
}

const SpellSourceItem = (props: SpellSourceItemProps) => {
  return (
    <View style={[styles.addBoxContainer, props.style]}>
      <Text
        style={[
          props.disabled
            ? StyleProvider.styles.listItemTextWeak
            : StyleProvider.styles.listItemTextStrong,
          styles.sourceTextInput
        ]}
      >
        {props.sourceURL}
      </Text>
      <TouchableOpacity
        onPress={() => props.onRemoveButtonPressed?.(props.sourceURL)}
        containerStyle={[styles.addSourceButton]}
      >
        <MdIcon
          name="close"
          size={30}
          style={[
            props.disabled
              ? StyleProvider.styles.listItemIconWeak
              : StyleProvider.styles.listItemIconStrong
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SpellSourceItem;

const styles = StyleSheet.create({
  addBoxContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    paddingVertical: StyleProvider.styles.edgePadding.padding,
    paddingLeft: StyleProvider.styles.edgePadding.padding,
    flexDirection: "row"
  },
  sourceTextInput: { flex: 1 },
  addSourceButton: {
    flexBasis: 60,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  ptrContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: StyleProvider.styles.edgePadding.padding
  },
  ptrIcon: {
    fontSize: 30
  }
});
