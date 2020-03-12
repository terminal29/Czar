import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SpellListsScreen from "./screens/SpellListsScreen";
import { SpellList } from "./structs/SpellList";
import SpellSourcesScreen from "./screens/SpellSourcesScreen";
import SpellsKnownScreen from "./screens/SpellsKnownScreen";
import SpellInfoScreen from "./screens/SpellInfoScreen";
import SpellListScreen from "./screens/SpellListScreen";

export default function App() {
  const spellLists: Array<SpellList> = [
    {
      name: "Wizzo the Wizard",
      thumbnailURL: "",
      spellIDs: [
        { id: "1212" },
        { id: "2121" },
        { id: "1212" },
        { id: "2121" },
        { id: "1212" },
        { id: "2121" }
      ]
    },
    {
      name: "Clarence the Cleric",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Sal the Sorcerer",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Perry the Paladin",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Wam the Warlock",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    },
    {
      name: "Alberto the Artificer",
      thumbnailURL: "",
      spellIDs: [{ id: "1212" }, { id: "2121" }]
    }
  ];

  const spellSources = [
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index",
    "https://raw.githubusercontent.com/aurorabuilder/elements/master/core.index"
  ];

  return (
    <>
      {/*<SpellListsScreen spellLists={spellLists} />*/}
      <SpellSourcesScreen spellSources={spellSources} />
      {/*<SpellsKnownScreen />*/}
      {/*<SpellListScreen list={spellLists[0]} />*/}
    </>
  );
}
