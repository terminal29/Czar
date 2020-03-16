import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
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
    <View style={[AppStyles.appBackground, styles.container]}>
      {loading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : spellInfo ? (
        <>
          <Text>{spellInfo.name}</Text>
          <View>
            <Text>Level</Text>
            <Text>{spellInfo.level === "0" ? "Cantrip" : spellInfo.level}</Text>
          </View>
          <View>
            <Text>School</Text>
            <Text>{spellInfo.school}</Text>
          </View>
          <View>
            <Text>Class</Text>
            <Text>{spellInfo.classes.join(", ")}</Text>
          </View>
          <View>
            <Text>Range</Text>
            <Text>{spellInfo.range}</Text>
          </View>
          <View>
            <Text>Components</Text>
            <Text>
              {spellInfo.hasMaterialComponent ? "V" : ""}
              {spellInfo.hasSomaticComponent ? "S" : ""}
              {spellInfo.hasMaterialComponent ? "M" : ""}
            </Text>
          </View>
          <View>
            <Text>Duration</Text>
            <Text>{spellInfo.duration}</Text>
          </View>
          <View>
            <Text>Ritual</Text>
            <Text>{spellInfo.isRitual ? "Yes" : "No"}</Text>
          </View>
          <View>
            <Text>Concentration</Text>
            <Text>{spellInfo.isConcentration ? "Yes" : "No"}</Text>
          </View>
          <View>
            <View>
              {(() => {
                if (descriptionXML) {
                  const comps = DescriptionFormatter.DescriptionXML2ReactElements(
                    descriptionXML
                  );
                  console.log(Array.isArray(comps) && comps.length);
                  return comps;
                }
              })()}
            </View>

            <Text>{spellInfo.source}</Text>
          </View>
          {props.extraButtons && props.extraButtons}
        </>
      ) : (
        <View>
          <Text>Unable to load spell data</Text>
        </View>
      )}
    </View>
  );
};

export default SpellInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
