import * as React from "react";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { SpellList } from "../structs/SpellList";
import { SpellListItemCompact } from "../components/SpellListItemCompact";
import { SpellListAddBox } from "../components/SpellListAddBox";
import { StyleProvider } from "../data/StyleProvider";
import { TouchableOpacity } from "react-native-gesture-handler";

import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellListsScreenProps {
  spellLists: SpellList[];
  onListPressed?: Function;
  onAddListPressed?: Function;
  onListEditPressed?: Function;
}

const SpellListsScreen = (props: SpellListsScreenProps) => {
  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>Spell Lists</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <TouchableOpacity
          style={styles.addSpellListButtonContainer}
          onPress={() => props.onAddListPressed?.()}
        >
          <Text
            style={[
              StyleProvider.styles.listItemTextWeak,
              styles.addSpellListText
            ]}
          >
            Add a new spell list
          </Text>
          <View style={styles.chevronContainer}>
            <MdIcon
              size={20}
              name={"chevron-right"}
              style={[StyleProvider.styles.listItemIconStrong]}
            />
          </View>
        </TouchableOpacity>
        {props.spellLists.map(spellList => (
          <SpellListItemCompact
            key={spellList.id}
            list={spellList}
            style={styles.spellListItem}
            onPress={props.onListPressed}
            onEditPress={props.onListEditPressed}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default SpellListsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pageTitleContainer: {
    height: 93,
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    justifyContent: "center",
    alignItems: "center"
  },
  scrollViewContentContainer: {
    padding: StyleProvider.styles.edgePadding.padding
  },
  addSpellListButtonContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    padding: StyleProvider.styles.edgePadding.padding,
    paddingRight: StyleProvider.styles.edgePadding.padding - 10,
    flexDirection: "row"
  },
  addSpellListText: {
    flex: 1
  },
  chevronContainer: {
    marginVertical: -10,
    flex: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  spellListItem: {
    marginTop: StyleProvider.styles.edgePadding.padding,
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle
  }
});
