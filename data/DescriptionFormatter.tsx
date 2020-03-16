import * as React from "react";
import { Text } from "react-native";
import { AppStyles } from "../styles/AppStyles";
import { Spell } from "../structs/Spell";
import * as xml2js from "react-native-xml2js";
import { v4 as uuid } from "react-native-uuid";

function DescriptionXML2ReactElements(
  object: any,
  options?: { extraStyles?: Array<object> }
): React.ReactElement | any[] {
  if (object["_"]) {
    // has text
    if (object["$"]) {
      // has some formatted text
      if (object["$"].class === "indent") {
        return (
          <Text
            key={uuid()}
            style={[
              AppStyles.infoText,
              { fontStyle: "italic" },
              ...(options
                ? options.extraStyles
                  ? options.extraStyles
                  : []
                : [])
            ]}
          >
            {object["_"]}
          </Text>
        );
      } else {
        return (
          <Text
            key={uuid()}
            style={[
              AppStyles.infoText,
              { fontStyle: "italic" },
              ...(options
                ? options.extraStyles
                  ? options.extraStyles
                  : []
                : [])
            ]}
          >
            {object["_"]}
          </Text>
        );
      }
    }
    return DescriptionXML2ReactElements(object["_"], options);
  }
  if (object["p"]) {
    return DescriptionXML2ReactElements(object["p"], options);
  }
  if (Array.isArray(object)) {
    return object.map(subObject =>
      DescriptionXML2ReactElements(subObject, options)
    );
  }
  if (typeof object === "string" || object instanceof String) {
    return (
      <Text
        key={uuid()}
        style={[
          AppStyles.infoText,
          ...(options ? (options.extraStyles ? options.extraStyles : []) : [])
        ]}
      >
        {object}
      </Text>
    );
  }
}

async function DescriptionString2XML(spell: Spell): Promise<object> {
  const parser = new xml2js.Parser({ explicitArray: true });
  const tagFix = spell.formattedText
    .replace("<0>", "<root>")
    .replace("</0>", "</root>");
  const descriptionXML = (await new Promise((resolve, reject) => {
    parser.parseString(tagFix, (err, xml) => {
      if (err) {
        reject(err);
      }
      resolve(xml);
    });
  })) as object;
  return descriptionXML;
}

async function FormatSpellDescription(
  spell: Spell
): Promise<React.ReactElement | any[]> {
  return DescriptionXML2ReactElements(await DescriptionString2XML(spell));
}

export default {
  DescriptionXML2ReactElements,
  DescriptionString2XML,
  FormatSpellDescription
};
