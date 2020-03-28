import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AppStyles } from "../styles/AppStyles";
import SpellSourceItem from "../components/SpellSourceItem";
import { useState, useEffect } from "react";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";
import PullableScrollView from "../components/PullableScrollView";
import Spinner from "react-native-spinkit";

interface SpellSourcesScreenProps {
  spellSources: { id: number; url: string }[];
  onSpellSourceRemoved?: Function;
  onSpellSourceAdded?: Function;
  onSpellSourcesReloaded?: Function;
  isLoading: boolean;
  loadingButtonComponent: any;
}

const SpellSourcesScreen = (props: SpellSourcesScreenProps) => {
  const [addBoxText, setAddBoxText] = useState("");
  const [pasteWidthWorkaround, setPasteWidthWorkaround] = useState("99.9%");
  useEffect(() => {
    ///https://github.com/facebook/react-native/issues/23653
    setTimeout(() => setPasteWidthWorkaround("100%"));
  }, []);

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>Spell Sources</Text>
      </View>
      <View style={[styles.addBoxContainer]}>
        <TextInput
          style={[
            StyleProvider.styles.listItemTextStrong,
            styles.sourceTextInput,
            { width: pasteWidthWorkaround }
          ]}
          placeholder="Enter a URL..."
          placeholderTextColor={
            StyleProvider.styles.textInputPlaceholderText.color
          }
          value={addBoxText}
          onChangeText={value => !props.isLoading && setAddBoxText(value)}
          editable={!props.isLoading}
          selectTextOnFocus={true}
        />
        <TouchableOpacity
          onPress={() => props.onSpellSourceAdded?.(addBoxText)}
          containerStyle={[styles.addSourceButton]}
          disabled={props.isLoading}
        >
          <MdIcon
            name="add"
            size={30}
            style={[
              !props.isLoading
                ? StyleProvider.styles.listItemIconStrong
                : StyleProvider.styles.listItemIconWeak
            ]}
          />
        </TouchableOpacity>
      </View>
      <PullableScrollView
        threshold={50}
        onPull={() => {
          !props.isLoading && props.onSpellSourcesReloaded?.();
        }}
        contentContainerStyle={styles.sourcesContainer}
      >
        {props.spellSources.map((spellSource, index) => (
          <SpellSourceItem
            key={spellSource.id}
            sourceURL={spellSource.url}
            style={index == 0 && styles.extraTopBorder}
            onRemoveButtonPressed={url =>
              props.onSpellSourceRemoved && props.onSpellSourceRemoved(url)
            }
            disabled={props.isLoading}
          />
        ))}
        {props.isLoading ? (
          <View style={styles.ptrContainer}>
            <Spinner
              type={"FadingCircleAlt"}
              size={30}
              color={StyleProvider.styles.listItemTextWeak.color}
            />
          </View>
        ) : (
          <View style={styles.ptrContainer}>
            <Text style={[StyleProvider.styles.listItemTextWeak]}>
              Pull to Refresh
            </Text>
            <MdIcon
              name="keyboard-arrow-down"
              size={30}
              style={[StyleProvider.styles.listItemTextWeak, styles.ptrIcon]}
            />
          </View>
        )}
      </PullableScrollView>
    </View>
  );
};

export default SpellSourcesScreen;

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
  addBoxContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    paddingVertical: StyleProvider.styles.edgePadding.padding - 10,
    paddingLeft: StyleProvider.styles.edgePadding.padding,
    flexDirection: "row"
  },
  extraTopBorder: {
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle
  },
  sourceTextInput: { flex: 1 },
  addSourceButton: {
    flexBasis: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  ptrContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: StyleProvider.styles.edgePadding.padding
  },
  ptrIcon: {
    fontSize: 30
  },
  sourcesContainer: {
    padding: StyleProvider.styles.edgePadding.padding,
    paddingTop: 0,
    marginTop: -1
  }
});
