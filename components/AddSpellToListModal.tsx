import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { StyleProvider } from "../data/StyleProvider";
import { SpellID } from "../structs/SpellID";
import { useState } from "react";
import SpellProvider from "../data/SpellProvider";
import { SpellList } from "../structs/SpellList";

interface AddSpellToListModalProps {
  spellID: SpellID;
  lists?: Array<SpellList>;
  onSpellListPressed?: (spellID: SpellID, list: SpellList) => void;
  onBackPressed?: () => void;
}

const useAsyncEffect = (
  effect: (status: { cancelled: boolean }) => void,
  deps
) =>
  React.useEffect(() => {
    let status = { cancelled: false };
    effect(status);
    return () => {
      status.cancelled = true;
    };
  }, deps);

const AddSpellToListModal = (props: AddSpellToListModalProps) => {
  const [spellName, setSpellName] = useState(null);
  useAsyncEffect(async status => {
    const spellInfoPromise = await SpellProvider.getSpellByID(props.spellID);
    if (!status.cancelled) {
      setSpellName(spellInfoPromise.name);
    }
  }, []);

  return (
    <View style={[styles.container]}>
      <View
        key="info"
        style={[StyleProvider.styles.mainBackground, styles.infoBoxContainer]}
      >
        <Text style={[StyleProvider.styles.listItemTextStrong]}>
          <Text>Pick a spell list to add </Text>
          <Text
            style={
              spellName
                ? [StyleProvider.styles.listItemTextStrong, styles.boldText]
                : StyleProvider.styles.listItemTextWeak
            }
          >
            {spellName ? spellName : "(loading)"}
          </Text>{" "}
          to:
        </Text>
      </View>
      <ScrollView>
        {props.lists &&
          props.lists.map(list => (
            <TouchableOpacity
              key={list.id}
              style={[
                StyleProvider.styles.mainBackground,
                styles.infoBoxContainer
              ]}
              onPress={() => props.onSpellListPressed?.(props.spellID, list)}
            >
              <Text style={StyleProvider.styles.listItemTextStrong}>
                {list.name}
              </Text>
            </TouchableOpacity>
          ))}
        <TouchableOpacity
          key={"cancel"}
          style={[StyleProvider.styles.mainBackground, styles.infoBoxContainer]}
          onPress={() => props.onBackPressed?.()}
        >
          <Text style={StyleProvider.styles.listItemTextStrong}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddSpellToListModal;

const styles = StyleSheet.create({
  container: {},
  infoBoxContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    padding: StyleProvider.styles.edgePadding.padding,
    marginBottom: StyleProvider.styles.edgePadding.padding
  },
  boldText: {
    fontWeight: "bold"
  }
});
