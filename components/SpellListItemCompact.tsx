import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity
} from "react-native";
import { SpellList } from "../structs/SpellList";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellListItemCompactProps {
  style?: any;
  list: SpellList;
  onPress?: Function;
  onEditPress?: Function;
}

const SpellListItemCompact = (props: SpellListItemCompactProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, props.style]}
      onPress={() => props.onPress?.(props.list)}
    >
      <Image
        style={styles.cardImage}
        source={{ uri: props.list.thumbnailURI }}
      />
      <View style={styles.cardInfoContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[StyleProvider.styles.listItemTextStrong, styles.cardTitle]}
        >
          {props.list.name}
        </Text>
        <TouchableOpacity
          style={[styles.editCardIconContainer]}
          onPress={() => props.onEditPress?.(props.list)}
        >
          <MdIcon
            name="more-horiz"
            size={25}
            style={[StyleProvider.styles.listItemTextWeak, styles.editButton]}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export { SpellListItemCompact };

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover"
  },
  cardTitle: {
    flex: 1,
    padding: StyleProvider.styles.edgePadding.padding
  },
  cardInfoContainer: {
    flexDirection: "row"
  },
  editCardIconContainer: {
    padding: StyleProvider.styles.edgePadding.padding,
    justifyContent: "center",
    alignItems: "center",
    flex: 0
  },
  editButton: {
    marginVertical: -15,
    fontSize: 20
  }
});
