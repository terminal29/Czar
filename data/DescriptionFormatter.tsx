import * as React from "react";
import { Text, View } from "react-native";
import { Spell } from "../structs/Spell";
import * as xml2js from "react-native-xml2js";
import { DOMParser } from "xmldom";
import { v4 as uuid } from "react-native-uuid";
import { StyleProvider } from "./StyleProvider";

const parser = new DOMParser();

function DescriptionXML2ReactElements(
  xmlString: string,
  options?: { extraStyles?: Array<object> }
): React.ReactElement | any[] {
  console.log(xmlString);
  let descriptionDOM = parser.parseFromString(xmlString, "text/xml");
  console.log(descriptionDOM);

  // const processRawTextData = node => {
  //   // Pure text node
  //   if (node.data) {
  //     if (node.data.trim().length > 0) {
  //       if (node.tagName === "xml") return;
  //       return (
  //         <Text key={uuid()} style={[StyleProvider.styles.listItemTextWeak]}>
  //           {node.data}
  //         </Text>
  //       );
  //     }
  //   }
  //   return null;
  // };

  // const processNode = node => {
  //   if (node.hasChildNodes()) {
  //     let childNodes = [];
  //     for (let i = 0; i < node.childNodes.length; i++) {
  //       if (node.childNodes[i].data) {
  //         if (node.childNodes[i].data.trim().length > 0) {
  //           childNodes.push(node.childNodes[i]);
  //         }
  //       } else {
  //         childNodes.push(node.childNodes[i]);
  //       }
  //     }

  //     const childNodeResults = childNodes.map(childNode =>
  //       processNode(childNode)
  //     );

  //     let indent = false;

  //     for (let j = 0; j < node.attributes?.length; j++) {
  //       if (node.attributes[j].name === "class") {
  //         if (node.attributes[j].value === "indent") {
  //           indent = true;
  //         }
  //       }
  //     }

  //     if (node.tagName == "p") {
  //       // Text container
  //       const textData = processRawTextData(node);
  //       if (indent) {
  //         return (
  //           <View key={uuid()}>
  //             {childNodeResults}
  //             {textData}
  //           </View>
  //         );
  //       } else {
  //         return (
  //           <View key={uuid()}>
  //             {textData}
  //             {childNodeResults}
  //           </View>
  //         );
  //       }
  //     } else if (node.tagName === "li") {
  //       return (
  //         <View key={uuid()} style={{ flexDirection: "row" }}>
  //           <Text
  //             key={uuid()}
  //             style={[
  //               StyleProvider.styles.listItemTextWeak,
  //               { marginTop: 5, marginRight: 5 }
  //             ]}
  //           >
  //             •
  //           </Text>
  //           {childNodeResults}
  //         </View>
  //       );
  //     } else {
  //       return <View key={uuid()}>{childNodeResults}</View>;
  //     }
  //   } else {
  //     return processRawTextData(node);
  //   }
  // };

  const processRawTextData = node => {
    // Pure text node
    if (node.data) {
      if (node.data.trim().length > 0) {
        if (node.tagName === "xml") return;
        return { textData: node.data.trim() };
      }
    }
    return null;
  };

  const processNode = node => {
    if (node.hasChildNodes()) {
      let childNodes = [];
      for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].data) {
          if (node.childNodes[i].data.trim().length > 0) {
            childNodes.push(node.childNodes[i]);
          }
        } else {
          childNodes.push(node.childNodes[i]);
        }
      }

      const childNodeResults = childNodes.map(childNode =>
        processNode(childNode)
      );

      let indent = false;

      for (let j = 0; j < node.attributes?.length; j++) {
        if (node.attributes[j].name === "class") {
          if (node.attributes[j].value === "indent") {
            indent = true;
          }
        }
      }

      if (node.tagName == "p") {
        // Text container
        const textData = processRawTextData(node);
        if (indent) {
          return { children: childNodeResults, textData, indent };
        } else {
          return { children: childNodeResults, textData, indent };
        }
      } else if (node.tagName === "ul") {
        return { children: childNodeResults, rowDirection: true };
      } else if (node.tagName === "li") {
        return { children: childNodeResults, bullet: true };
      } else if (node.tagName === "strong") {
        return { children: childNodeResults, bold: true };
      } else {
        return { children: childNodeResults };
      }
    } else {
      return processRawTextData(node);
    }
  };

  const elements = processNode(descriptionDOM);

  const nodeToElements = nodeList => {
    if (!nodeList) {
      return;
    }
    let nodeChildrenResults = [];
    if (nodeList.children)
      nodeChildrenResults = nodeList.children
        .filter(child => !!child)
        .map(child => nodeToElements(child));

    const textData = nodeList.textData;
    if (nodeList.indent) {
      nodeChildrenResults = [
        nodeChildrenResults[nodeChildrenResults.length - 1],
        nodeChildrenResults.slice(0, nodeChildrenResults.length - 1)
      ];
    }
    const textStyles = [
      StyleProvider.styles.listItemTextWeak,
      { marginTop: 5 }
    ];
    return (
      <View style={{ flexDirection: nodeList.bullet ? "row" : "column" }}>
        {nodeList.bullet && (
          <View>
            <Text style={textStyles}>-</Text>
          </View>
        )}
        <View>{nodeChildrenResults}</View>
        {textData && <Text style={textStyles}>{textData}</Text>}
      </View>
    );
  };

  console.log(JSON.stringify(elements, null, 3));

  return nodeToElements(elements);
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
