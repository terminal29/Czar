import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { SpellID } from "../structs/SpellID";
import { AppStyles } from "../styles/AppStyles";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import { Spell } from "../structs/Spell";

import Spinner from "react-native-spinkit";

interface SpellItemCompactProps {
  style?: any;
  spellID: SpellID;
}

const SpellItemCompact = (props: SpellItemCompactProps) => {
  const [spellInfo, setSpellInfo] = useState<Spell | null>();
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

  return (
    <View
      style={[
        styles.container,
        AppStyles.boxBackground,
        AppStyles.boxRounded,
        props.style
      ]}
    >
      {loading ? (
        <View style={styles.center}>
          <Spinner type={"Wave"} color={AppStyles.smallHeaderText.color} />
        </View>
      ) : spellInfo ? (
        <>
          <Text style={AppStyles.smallHeaderText}>{spellInfo.name}</Text>
          <View style={styles.subHeaderContainer}>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>
                {spellInfo.level == "0"
                  ? "Cantrip"
                  : `Level ${spellInfo.level}`}
              </Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>-</Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>{spellInfo.time}</Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>-</Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>
                {spellInfo.hasVerbalComponent && "V"}
                {spellInfo.hasSomaticComponent && "S"}
                {spellInfo.hasMaterialComponent && "M"}
              </Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>-</Text>
            </View>
            <View style={AppStyles.smallRightMargin}>
              <Text style={AppStyles.smallHeaderSubtext}>
                {spellInfo.range}
              </Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              style={AppStyles.infoText}
            >
              {spellInfo.formattedText}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={AppStyles.smallHeaderSubtext}>{props.spellID.id}</Text>
          <View style={styles.infoContainer}>
            <Text style={AppStyles.headerSubtext}>
              Unable to load spell data.
            </Text>
            <Text style={AppStyles.headerSubtext}>
              Reload spell database with the source this spell was from.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SpellItemCompact;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 12
  },
  subHeaderContainer: {
    marginTop: 5,
    flexDirection: "row"
  },
  infoContainer: {
    marginTop: 5
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20
  }
});
