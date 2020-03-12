import * as React from "react";
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import { SpellList } from "../structs/SpellList";
import { AppStyles } from "../styles/AppStyles";

interface SpellListItemCompactProps {
  list: SpellList;
}

const width = Dimensions.get("window").width;
const cardWidth = width / 2.5;

const SpellListItemCompact = (props: SpellListItemCompactProps) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.cardImage}
        source={{ uri: props.list.thumbnailURL }}
      />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[AppStyles.smallHeaderSubtext, styles.cardTitle]}
      >
        {props.list.name}
      </Text>
    </View>
  );
};

export { SpellListItemCompact };

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginTop: 10,
    marginBottom: 20
  },
  cardImage: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: cardWidth,
    height: cardWidth * 0.7,
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 18
  }
});
