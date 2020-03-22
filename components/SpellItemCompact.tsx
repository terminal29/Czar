import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SpellID } from "../structs/SpellID";
import { AppStyles } from "../styles/AppStyles";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { Spell } from "../structs/Spell";
import Spinner from "react-native-spinkit";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellItemCompactProps {
  style?: any;
  spellID: SpellID;
  onPress?: Function;
}

const SpellItemCompact = (props: SpellItemCompactProps) => {
  const [spellInfo, setSpellInfo] = useState<Spell | null>();
  const [spellDescXML, setSpellDescXML] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (loading) {
      const getSpell = async () => {
        const spellInfoPromise = await SpellProvider.getSpellByID(
          props.spellID
        );
        if (!cancelled) {
          setSpellInfo(spellInfoPromise);
          setLoading(false);
        }
      };
      getSpell();
    }
    return () => {
      cancelled = true;
    };
  }, [loading]);

  useEffect(() => {
    let cancelled = false;

    const doXML = async () => {
      if (spellInfo) {
        const descXML = await DescriptionFormatter.DescriptionString2XML(
          spellInfo
        );
        if (!cancelled) {
          setSpellDescXML(descXML["root"]);
        }
      } else {
        setSpellDescXML(null);
      }
    };
    doXML();

    return () => {
      cancelled = true;
    };
  }, [spellInfo]);

  const getVSMString = () =>
    `${spellInfo.hasVerbalComponent ? "V" : ""}${
      spellInfo.hasSomaticComponent ? "S" : ""
    }${spellInfo.hasMaterialComponent ? "M" : ""}`;

  const getCRString = () =>
    `${spellInfo.isConcentration ? "C" : ""}${spellInfo.isRitual ? "R" : ""}`;

  return (
    <TouchableOpacity
      style={[styles.container, props.style]}
      disabled={!spellInfo}
      onPress={() => props.onPress?.()}
    >
      <View style={styles.innerContainer}>
        <View style={styles.infoContainer}>
          <Text
            style={[
              StyleProvider.styles.listItemTextStrong,
              styles.spellTitleText
            ]}
          >
            {spellInfo ? spellInfo.name : props.spellID.id}
          </Text>
          {spellInfo ? (
            <View style={styles.shortInfoContainer}>
              <Text
                numberOfLines={1}
                style={[
                  StyleProvider.styles.listItemTextWeak,
                  styles.shortInfo,
                  styles.shortInfoFirst
                ]}
              >
                {spellInfo.level === "0"
                  ? "Cantrip"
                  : `Level ${spellInfo.level}`}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  StyleProvider.styles.listItemTextWeak,
                  styles.shortInfo
                ]}
              >
                {spellInfo.time}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  StyleProvider.styles.listItemTextWeak,
                  styles.shortInfo
                ]}
              >
                {spellInfo.range}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  StyleProvider.styles.listItemTextWeak,
                  styles.shortInfo
                ]}
              >
                {getVSMString()}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  StyleProvider.styles.listItemTextWeak,
                  styles.shortInfo
                ]}
              >
                {getCRString()}
              </Text>
            </View>
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
        <View style={styles.chevronContainer}>
          <MdIcon
            size={20}
            name={"chevron-right"}
            style={[StyleProvider.styles.listItemIconWeak]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SpellItemCompact;

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
