import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellID } from "../structs/SpellID";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { Spell } from "../structs/Spell";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import McIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useMemoOne, useCallbackOne } from "use-memo-one";

interface ModSpellItemCompactProps {
  style?: any;
  spellID: SpellID;
  removeEnabled?: boolean;
  upEnabled?: boolean;
  downEnabled?: boolean;
  onRemovePressed?: () => void;
  onUpPressed?: () => void;
  onDownPressed?: () => void;
}

const ModSpellItemCompact = (props: ModSpellItemCompactProps) => {
  const [spellInfo, setSpellInfo] = useState<Spell | null>();

  useEffect(() => {
    let cancelled = false;
    const getSpell = async () => {
      const spellInfoPromise = await SpellProvider.getSpellByID(props.spellID);
      if (!cancelled) {
        setSpellInfo(spellInfoPromise);
      }
    };
    getSpell();

    return () => {
      cancelled = true;
    };
  }, [props.spellID]);

  const getVSMString = () =>
    `${spellInfo.hasVerbalComponent ? "V" : ""}${
      spellInfo.hasSomaticComponent ? "S" : ""
    }${spellInfo.hasMaterialComponent ? "M" : ""}`;

  const getCRString = () =>
    `${spellInfo.isConcentration ? "C" : ""}${spellInfo.isRitual ? "R" : ""}`;

  const isUpEnabled = props.upEnabled ? props.upEnabled : true;
  const isDownEnabled = props.downEnabled ? props.downEnabled : true;
  const isRemoveEnabled = props.downEnabled ? props.downEnabled : true;

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.infoContainer}>
        <Text
          style={[
            StyleProvider.styles.listItemTextStrong,
            styles.spellTitleText
          ]}
        >
          {spellInfo ? spellInfo.name : props.spellID.id}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          containerStyle={styles.buttonContainer}
          disabled={!isUpEnabled}
          onPress={() => props.onUpPressed?.()}
        >
          <McIcon
            size={20}
            name={"chevron-up"}
            style={[
              isUpEnabled
                ? StyleProvider.styles.listItemIconStrong
                : StyleProvider.styles.listItemIconWeak
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          containerStyle={styles.buttonContainer}
          disabled={!isDownEnabled}
        >
          <McIcon
            size={20}
            name={"chevron-down"}
            style={[
              isUpEnabled
                ? StyleProvider.styles.listItemIconStrong
                : StyleProvider.styles.listItemIconWeak
            ]}
            onPress={() => props.onDownPressed?.()}
          />
        </TouchableOpacity>
        <TouchableOpacity
          containerStyle={styles.buttonContainer}
          disabled={!isRemoveEnabled}
          onPress={() => props.onRemovePressed?.()}
        >
          <MdIcon
            size={20}
            name={"close"}
            style={[
              isUpEnabled
                ? StyleProvider.styles.listItemIconStrong
                : StyleProvider.styles.listItemIconWeak
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModSpellItemCompact;

const styles = StyleSheet.create({
  container: {
    height: 65,
    justifyContent: "center",
    flexDirection: "row"
  },
  spellTitleText: {},
  infoContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  },
  buttonsContainer: {
    flex: 0,
    flexDirection: "row"
  },
  buttonContainer: {
    flex: 1,
    flexBasis: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
});
