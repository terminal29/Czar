import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellID } from "../structs/SpellID";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { Spell } from "../structs/Spell";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useMemoOne, useCallbackOne } from "use-memo-one";

interface ModSpellItemCompactProps {
  style?: any;
  spellID: SpellID;
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

  const innerComponent = useCallbackOne(
    () => (
      <View style={styles.infoContainer}>
        <Text
          style={[
            StyleProvider.styles.listItemTextStrong,
            styles.spellTitleText
          ]}
        >
          {spellInfo ? spellInfo.name : props.spellID.id}
        </Text>
        ) : (
        <View style={styles.shortInfoContainer}>
          <Text
            style={[
              StyleProvider.styles.listItemTextWeak,
              styles.shortInfo,
              styles.shortInfoFirst
            ]}
          >
            Loading data...
          </Text>
        </View>
        )}
      </View>
    ),
    [spellInfo]
  );

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.innerContainer}>
        {innerComponent()}
        <View style={styles.chevronContainer}>
          <MdIcon
            size={20}
            name={"chevron-right"}
            style={[StyleProvider.styles.listItemIconWeak]}
          />
        </View>
      </View>
    </View>
  );
};

export default ModSpellItemCompact;

const styles = StyleSheet.create({
  container: {
    height: 65,
    justifyContent: "center"
  },
  innerContainer: {
    flexDirection: "row"
  },
  spellTitleText: {},
  infoContainer: {
    flex: 1,
    flexDirection: "column"
  },
  shortInfoContainer: {
    flexDirection: "row"
  },
  shortInfo: {
    flex: 1
  },
  shortInfoFirst: {},
  chevronContainer: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center"
  }
});
