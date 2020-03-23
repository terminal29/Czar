import * as React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { SpellID } from "../structs/SpellID";
import { useEffect, useState } from "react";
import SpellProvider from "../data/SpellProvider";
import { Spell } from "../structs/Spell";
import SpellItemCompact from "../components/SpellItemCompact";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { AppStyles } from "../styles/AppStyles";
import { StyleProvider } from "../data/StyleProvider";

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

  const up = (text: string) => text.replace(/^\w/, c => c.toLocaleUpperCase());

  const num2pos = num =>
    num == "1" ? "1st" : "2" ? "2nd" : "3" ? "3rd" : `${num}th`;

  const getSpellLevelAndType = () =>
    spellInfo.level === "0"
      ? `${up(spellInfo.school)} cantrip`
      : `${num2pos(
          spellInfo.level
        )}-level ${spellInfo.school.toLocaleLowerCase()} spell`;

  const getVSMString = () =>
    `${spellInfo.hasVerbalComponent ? "V" : ""}${
      spellInfo.hasSomaticComponent ? "S" : ""
    }${spellInfo.hasMaterialComponent ? "M" : ""}`;

  const makeFeature = (title: string, value: string) => (
    <View style={styles.featureItem}>
      <Text style={[StyleProvider.styles.listItemTextWeak, styles.featureText]}>
        {title}
      </Text>
      <Text style={[StyleProvider.styles.listItemTextWeak, styles.featureText]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>
          {spellInfo ? spellInfo.name : "Loading..."}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewPadding}>
        {spellInfo && (
          <View style={styles.infoContainer}>
            <Text style={[StyleProvider.styles.listItemTextStrong]}>
              {getSpellLevelAndType()}
            </Text>
            <View style={[styles.featuresContainer, styles.infoItem]}>
              {makeFeature("Casting Time", spellInfo.time)}
              {makeFeature("Range", spellInfo.range)}
              {makeFeature("Components", getVSMString())}
              {spellInfo.hasMaterialComponent &&
                makeFeature("Materials", spellInfo.materialComponents)}
              {makeFeature("Duration", spellInfo.duration)}
              {makeFeature(
                "Concentration",
                spellInfo.isConcentration ? "Yes" : "No"
              )}
              {makeFeature("Ritual", spellInfo.isRitual ? "Yes" : "No")}

              {makeFeature("Available to", spellInfo.classes.join(", "))}
            </View>
            <Text
              style={[StyleProvider.styles.listItemTextStrong, styles.infoItem]}
            >
              Description
            </Text>
            <Text
              style={[StyleProvider.styles.listItemTextWeak, styles.infoItem]}
            >
              {(() => {
                if (descriptionXML) {
                  const comps = DescriptionFormatter.DescriptionXML2ReactElements(
                    descriptionXML,
                    {
                      extraStyles: [
                        StyleProvider.styles.listItemTextWeak,
                        styles.infoItem
                      ]
                    }
                  );
                  return comps;
                }
              })()}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SpellInfoScreen;

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
  scrollViewPadding: {
    padding: StyleProvider.styles.edgePadding.padding
  },
  infoContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    padding: StyleProvider.styles.edgePadding.padding
  },
  infoItem: {
    marginTop: StyleProvider.styles.edgePadding.padding
  },
  featuresContainer: {},
  featureItem: {
    flexDirection: "row"
  },
  featureText: { flex: 0.5, lineHeight: 20 }
});
