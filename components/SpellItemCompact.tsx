import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SpellID } from "../structs/SpellID";
import { AppStyles } from "../styles/AppStyles";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { Spell } from "../structs/Spell";
import Spinner from "react-native-spinkit";

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
    `${spellInfo.hasMaterialComponent ? "V" : ""}${
      spellInfo.hasSomaticComponent ? "S" : ""
    }${spellInfo.hasMaterialComponent ? "M" : ""}`;

  const getCRString = () =>
    `${spellInfo.isConcentration ? "C" : ""}${spellInfo.isRitual ? "R" : ""}`;

  return (
    <View style={[styles.container, AppStyles.boxBackground, props.style]}>
      {loading ? (
        <View style={styles.center}>
          <Spinner type={"Wave"} color={AppStyles.smallHeaderText.color} />
        </View>
      ) : spellInfo ? (
        <TouchableOpacity
          style={styles.mainContainer}
          onPress={() => props.onPress && props.onPress()}
        >
          <View style={styles.leftContainer} />
          <View style={styles.rightContainer}>
            <View style={styles.spellNameContainer}>
              <Text
                style={[
                  styles.spellName,
                  AppStyles.appFont,
                  AppStyles.headingTextColor
                ]}
              >
                {spellInfo.name}
              </Text>
            </View>
            <View style={styles.spellInfoContainer}>
              <Text
                numberOfLines={1}
                style={[
                  styles.spellInfoString,
                  AppStyles.appFont,
                  AppStyles.subheadingTextColor
                ]}
              >
                {spellInfo.level === "0"
                  ? "Cantrip"
                  : `Level ${spellInfo.level}`}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.spellInfoString,
                  AppStyles.appFont,
                  AppStyles.subheadingTextColor
                ]}
              >
                {spellInfo.time}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.spellInfoString,
                  AppStyles.appFont,
                  AppStyles.subheadingTextColor,
                  { flexShrink: 1 }
                ]}
              >
                {spellInfo.range}
              </Text>
              {getVSMString().length > 0 && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.spellInfoString,
                    AppStyles.appFont,
                    AppStyles.subheadingTextColor
                  ]}
                >
                  {getVSMString()}
                </Text>
              )}

              {getCRString().length > 0 && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.spellInfoString,
                    AppStyles.appFont,
                    AppStyles.subheadingTextColor
                  ]}
                >
                  {getCRString()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoContainer}></View>
      )}
    </View>
  );
};

export default SpellItemCompact;

const styles = StyleSheet.create({
  container: {
    height: 60
  },
  subHeaderContainer: {
    marginTop: 5,
    flexDirection: "row"
  },
  infoContainer: {
    marginTop: 5
  },
  spellInfoTextMargin: {
    marginTop: 10
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20
  },
  leftContainer: {
    flexBasis: 35
  },
  rightContainer: {
    flex: 1,
    flexDirection: "column"
  },
  spellSmallInfoMargin: {},
  mainContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  smallDescriptionContainer: {
    marginTop: 10
  },
  spellNameContainer: { flex: 0, marginTop: 6, height: 34 },
  spellName: {
    fontSize: 30
  },
  spellInfoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "nowrap"
  },
  spellInfoString: {
    fontSize: 13,
    marginRight: 12
  }
});
