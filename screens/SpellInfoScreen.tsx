import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { SpellID } from "../structs/SpellID";
import { useEffect, useState } from "react";
import SpellProvider from "../data/SpellProvider";
import { Spell } from "../structs/Spell";
import SpellItemCompact from "../components/SpellItemCompact";
import DescriptionFormatter from "../data/DescriptionFormatter";
import { AppStyles } from "../styles/AppStyles";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellInfoScreenProps {
  spellID: SpellID;
  onBackPressed?: Function;
  extraButtons?: Array<{ text: string; iconName: string; onPress: () => void }>;
}

const SpellInfoScreen = (props: SpellInfoScreenProps) => {
  const [spellInfo, setSpellInfo] = useState<Spell>(null);
  const [descriptionElements, setDescriptionElements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (loading) {
      const getSpell = async () => {
        const spellInfoPromise = await SpellProvider.getSpellByID(
          props.spellID
        );
        const spellDescription = DescriptionFormatter.FormatSpellDescription(
          spellInfoPromise
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

  const up = (text: string) => text.replace(/^\w/, c => c.toLocaleUpperCase());

  const num2pos = num => {
    switch (num) {
      case "1":
        return "1st";
      case "2":
        return "2nd";
      case "3":
        return "3rd";
    }
    return `${num}th`;
  };

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

  const makeButton = (text, iconName, onPress?) => (
    <TouchableOpacity
      key={text}
      style={styles.addSpellListButtonContainer}
      onPress={() => onPress?.()}
    >
      <Text
        style={[
          StyleProvider.styles.listItemTextStrong,
          styles.addSpellListText
        ]}
      >
        {text}
      </Text>
      <View style={styles.iconContainer}>
        <MdIcon
          size={20}
          name={iconName}
          style={[StyleProvider.styles.listItemIconStrong]}
        />
      </View>
    </TouchableOpacity>
  );

  const makeFeature = (title: string, value: string) => (
    <View style={styles.featureItem} key={title}>
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
            <View style={[styles.infoItem]}>
              {spellInfo &&
                DescriptionFormatter.FormatSpellDescription(spellInfo, {
                  extraStyles: [StyleProvider.styles.listItemTextWeak]
                })}
            </View>
            <View style={[styles.infoItem, styles.rightFloat]}>
              {spellInfo && (
                <Text
                  style={[
                    StyleProvider.styles.listItemTextWeak,
                    styles.rightFloat
                  ]}
                >
                  {spellInfo.source}
                </Text>
              )}
            </View>
          </View>
        )}
        {props.extraButtons &&
          props.extraButtons.map(b =>
            makeButton(b.text, b.iconName, b.onPress)
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
  featureText: { flex: 0.5, lineHeight: 20 },
  addSpellListButtonContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    padding: StyleProvider.styles.edgePadding.padding,
    paddingRight: StyleProvider.styles.edgePadding.padding - 10,
    marginTop: StyleProvider.styles.edgePadding.padding,
    flexDirection: "row"
  },
  addSpellListText: {
    flex: 1
  },
  iconContainer: {
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
  },
  rightFloat: {
    alignItems: "flex-end"
  }
});
