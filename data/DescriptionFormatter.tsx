import * as React from "react";
import { Text, View } from "react-native";
import { Spell } from "../structs/Spell";
import * as xml2js from "react-native-xml2js";
import { DOMParser } from "xmldom";
import { v4 as uuid } from "react-native-uuid";

const parser = new DOMParser();

function DescriptionXML2ReactElements(
  xmlString: string,
  options?: { extraStyles?: Array<object> }
): React.ReactElement | any[] {
  console.log(xmlString);
  let descriptionDOM = parser.parseFromString(xmlString, "text/xml");
  console.log(descriptionDOM);

  const processNode = node => {
    if (node.hasChildNodes()) {
      const childNodeValues = [];
      for (let i = 0; i < node.childNodes.length; i++) {
        const nodeResult = processNode(node.childNodes[i]);
        if (nodeResult) {
          childNodeValues.push(<View>{nodeResult}</View>);
        }
      }
      return childNodeValues;
    } else {
      if (node.data.trim().length > 0) {
        if (node.tagName === "xml") return;
        return <Text style={options?.extraStyles}>{node.data}</Text>;
      }
    }
  };

  const elements = [processNode(descriptionDOM)].flat(Infinity);

  console.log(elements);

  return elements;
  // if (object["_"]) {
  //   // has text
  //   if (object["$"]) {
  //     // has some formatted text
  //     if (object["$"].class === "indent") {
  //       return (
  //         <Text
  //           key={uuid()}
  //           style={[
  //             { fontStyle: "italic" },
  //             ...(options
  //               ? options.extraStyles
  //                 ? options.extraStyles
  //                 : []
  //               : [])
  //           ]}
  //         >
  //           {object["_"].trim()}
  //         </Text>
  //       );
  //     } else {
  //       return (
  //         <Text
  //           key={uuid()}
  //           style={[
  //             { fontStyle: "italic" },
  //             ...(options
  //               ? options.extraStyles
  //                 ? options.extraStyles
  //                 : []
  //               : [])
  //           ]}
  //         >
  //           {object["_"].trim()}
  //         </Text>
  //       );
  //     }
  //   }
  //   return DescriptionXML2ReactElements(object["_"], options);
  // } else if (object["p"]) {
  //   return DescriptionXML2ReactElements(object["p"], options);
  // } else if (object["ul"]) {
  //   return DescriptionXML2ReactElements(object["ul"], options);
  // } else if (Array.isArray(object)) {
  //   return object.map(subObject =>
  //     DescriptionXML2ReactElements(subObject, options)
  //   );
  // } else if (typeof object === "string" || object instanceof String) {
  //   return (
  //     <Text
  //       key={uuid()}
  //       style={[
  //         ...(options ? (options.extraStyles ? options.extraStyles : []) : [])
  //       ]}
  //     >
  //       {object.trim()}
  //     </Text>
  //   );
  //} else {
  //  console.warn("Discarding description with unmatched type:");
  //  console.warn(object);
  //}
}

function FormatSpellDescription(
  spell: Spell,
  options: object
): React.ReactElement | any[] {
  return DescriptionXML2ReactElements(
    spell.formattedText.replace("<0>", "<root>").replace("</0>", "</root>"),
    options
  );
}

export default {
  DescriptionXML2ReactElements,
  FormatSpellDescription
};
