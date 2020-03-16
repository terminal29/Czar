import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SpellID } from "../structs/SpellID";
import { AppStyles } from "../styles/AppStyles";
import { useState, useEffect } from "react";
import SpellProvider from "../data/SpellProvider";
import { Spell } from "../structs/Spell";
import * as xml2js from "react-native-xml2js";
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

  const formatSpellDescription = async (spell: Spell): Promise<object> => {
    const parser = new xml2js.Parser({ explicitArray: true });

    const tagFix = spell.formattedText
      .replace("<0>", "<root>")
      .replace("</0>", "</root>");
    console.log(spell.formattedText);
    const descriptionXML = (await new Promise((resolve, reject) => {
      parser.parseString(tagFix, (err, xml) => {
        if (err) {
          reject(err);
        }
        resolve(xml);
      });
    })) as object;
    console.log(descriptionXML);
    return descriptionXML;
  };

  useEffect(() => {
    let cancelled = false;

    const doXML = async () => {
      if (spellInfo) {
        const descXML = await formatSpellDescription(spellInfo);
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

  const makeDescriptionComponents = (
    object: any
  ): React.ReactElement | any[] => {
    console.log(object);
    if (object["_"]) {
      // has text
      if (object["$"]) {
        // has some formatted text
        if (object["$"].class === "indent") {
          return (
            <Text style={[AppStyles.infoText, { fontStyle: "italic" }]}>
              {object["_"]}
            </Text>
          );
        } else {
          return (
            <Text style={[AppStyles.infoText, { fontStyle: "italic" }]}>
              {object["_"]}
            </Text>
          );
        }
      }
      return makeDescriptionComponents(object["_"]);
    }
    if (object["p"]) {
      return makeDescriptionComponents(object["p"]);
    }
    if (Array.isArray(object)) {
      return object.map(subObject => makeDescriptionComponents(subObject));
    }
    if (typeof object === "string" || object instanceof String) {
      return <Text style={[AppStyles.infoText]}>{object}</Text>;
    }
  };

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
        <TouchableOpacity onPress={() => props.onPress && props.onPress()}>
          <View style={styles.mainContainer}>
            <View style={styles.leftContainer}>
              <Text style={AppStyles.smallHeaderText}>{spellInfo.name}</Text>
              <View style={styles.smallDescriptionContainer}>
                {(() => {
                  if (spellDescXML) {
                    const comps = makeDescriptionComponents(spellDescXML);
                    if (Array.isArray(comps)) {
                      if (comps.length > 0) {
                        comps[0] = React.cloneElement(comps[0], {
                          numberOfLines: 4
                        });
                      }
                    }
                    return comps[0];
                  }
                })()}
              </View>
            </View>
            <View style={styles.rightContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={AppStyles.smallHeaderSubtext}
              >
                {spellInfo.level === "0"
                  ? "Cantrip"
                  : `Level ${spellInfo.level}`}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  AppStyles.smallHeaderSubtext,
                  styles.spellSmallInfoMargin
                ]}
              >
                {spellInfo.time}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  AppStyles.smallHeaderSubtext,
                  styles.spellSmallInfoMargin
                ]}
              >
                {spellInfo.hasMaterialComponent ? "V" : ""}
                {spellInfo.hasSomaticComponent ? "S" : ""}
                {spellInfo.hasMaterialComponent ? "M" : ""}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  AppStyles.smallHeaderSubtext,
                  styles.spellSmallInfoMargin
                ]}
              >
                {spellInfo.range}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
    paddingVertical: 20
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
    flex: 1
  },
  rightContainer: {
    flex: 0,
    flexBasis: 90,
    marginLeft: 20,
    justifyContent: "space-between"
  },
  spellSmallInfoMargin: {},
  mainContainer: {
    flex: 1,
    flexDirection: "row"
  },
  smallDescriptionContainer: {
    marginTop: 10
  }
});
