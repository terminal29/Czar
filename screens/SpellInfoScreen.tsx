import * as React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { SpellID } from "../structs/SpellID";
import { useEffect, useState } from "react";
import SpellProvider from "../data/SpellProvider";
import { Spell } from "../structs/Spell";
import SpellItemCompact from "../components/SpellItemCompact";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { AppStyles } from "../styles/AppStyles";

interface SpellInfoScreenProps {
  spellID: SpellID;
  onBackPressed?: Function;
  extraButtons?: any[];
}

const SpellInfoScreen = (props: SpellInfoScreenProps) => {
  const [spellInfo, setSpellInfo] = useState<Spell>(null);
  const [descriptionXML, setDescriptionXML] = useState(null);
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
          setDescriptionXML(descXML["root"]);
        }
      } else {
        setDescriptionXML(null);
      }
    };
    doXML();

    return () => {
      cancelled = true;
    };
  }, [spellInfo]);

  return (
    <ScrollView
      style={[AppStyles.appBackground, styles.container]}
      contentContainerStyle={{
        padding: AppStyles.edgePadding.paddingHorizontal
      }}
    >
      {loading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : spellInfo ? (
        <>
          <View
            style={[
              AppStyles.boxRounded,
              AppStyles.boxBackground,
              styles.innerBox
            ]}
          >
            <Text style={[AppStyles.headerText, styles.headerMargin]}>
              {spellInfo.name}
            </Text>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Level
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.level === "0" ? "Cantrip" : spellInfo.level}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                School
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.school}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Classes
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.classes.join(", ")}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Range
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.range}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Components
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.hasMaterialComponent ? "V" : ""}
                {spellInfo.hasSomaticComponent ? "S" : ""}
                {spellInfo.hasMaterialComponent ? "M" : ""}
              </Text>
            </View>
            {spellInfo.hasMaterialComponent && (
              <View style={styles.infoBox}>
                <Text
                  style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}
                >
                  Materials
                </Text>
                <Text
                  style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
                >
                  {spellInfo.materialComponents}
                </Text>
              </View>
            )}
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Duration
              </Text>
              <Text style={[AppStyles.smallHeaderSubtext]}>
                {spellInfo.duration}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Ritual
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.isRitual ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={[AppStyles.smallHeaderSubtext, styles.leftInfoItem]}>
                Concentration
              </Text>
              <Text
                style={[AppStyles.smallHeaderSubtext, styles.rightInfoItem]}
              >
                {spellInfo.isConcentration ? "Yes" : "No"}
              </Text>
            </View>
            <View>
              <View>
                {(() => {
                  if (descriptionXML) {
                    const comps = DescriptionFormatter.DescriptionXML2ReactElements(
                      descriptionXML,
                      { extraStyles: [styles.textTopMargin] }
                    );
                    return comps;
                  }
                })()}
              </View>

              <Text
                style={[
                  AppStyles.smallHeaderSubtext,
                  styles.rightText,
                  styles.textTopMargin
                ]}
              >
                {spellInfo.source}
              </Text>
            </View>
          </View>
          {props.extraButtons && props.extraButtons}
        </>
      ) : (
        <View>
          <Text>Unable to load spell data</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default SpellInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  innerBox: {
    paddingHorizontal: 30,
    paddingVertical: 20
  },
  headerMargin: {
    marginBottom: 40
  },
  infoBox: {
    flexDirection: "row",
    marginTop: 2
  },
  leftInfoItem: {
    flexBasis: 150
  },
  rightInfoItem: {
    flex: 1
  },
  textTopMargin: {
    marginTop: 20
  },
  rightText: {
    textAlign: "right"
  }
});
