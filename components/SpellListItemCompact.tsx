import * as React from "react";
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";
import { TouchableOpacity } from "react-native-gesture-handler";

interface SpellListItemCompactProps {
  list: SpellList;
  onPress?: Function;
}

const SpellListItemCompact = (props: SpellListItemCompactProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
        <Image
          style={styles.cardImage}
          source={{ uri: props.list.thumbnailURI }}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[AppStyles.smallHeaderSubtext, styles.cardTitle]}
        >
          {props.list.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export { SpellListItemCompact };

const styles = StyleSheet.create({
  container: {
    flexBasis: "50%",
    padding: 10
  },
  cardImage: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    height: 150,
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 30,
    marginLeft: 0
  }
});
