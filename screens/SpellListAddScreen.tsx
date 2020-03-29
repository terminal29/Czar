import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity
} from "react-native";
import { useState } from "react";
import { SpellList } from "../structs/SpellList";
import ImagePicker from "react-native-image-picker";
import Toast from "react-native-root-toast";
import { v4 as uuid } from "react-native-uuid";
import { StyleProvider } from "../data/StyleProvider";
import MdIcon from "react-native-vector-icons/MaterialIcons";

interface SpellListAddScreenProps {
  existingList?: SpellList;
  onDone?: Function;
  onCancel?: Function;
  onDelete?: Function;
}

let options = {
  title: "Select Thumbnail",
  storageOptions: {
    skipBackup: true,
    path: "images"
  }
};

const SpellListAddScreen = (props: SpellListAddScreenProps) => {
  const [listName, setListName] = useState(
    props.existingList ? props.existingList.name : null
  );
  const [thumbnailURI, setThumbnailURI] = useState(
    props.existingList ? props.existingList.thumbnailURI : null
  );

  const makeListFromState = () => {
    const list = props.existingList
      ? props.existingList
      : new SpellList(uuid(), listName, thumbnailURI);
    list.name = listName;
    list.thumbnailURI = thumbnailURI;
    return list;
  };

  const showPicker = () => {
    ImagePicker.showImagePicker(options, response => {
      if (response.error) {
        Toast.show("Unable to load image", { duration: Toast.durations.LONG });
      } else if (response.data) {
        console.log(response.uri);
        setThumbnailURI(response.uri);
      }
    });
  };

  const isValid = (): boolean => !!(thumbnailURI && listName);

  const makeButton = (enabled: boolean, text: string, onPress: Function) => (
    <TouchableOpacity
      style={styles.buttonContainer}
      disabled={!enabled}
      onPress={() => onPress()}
    >
      <Text
        style={[
          enabled
            ? StyleProvider.styles.listItemTextStrong
            : StyleProvider.styles.listItemTextWeak,
          styles.buttonText
        ]}
      >
        {text}
      </Text>
      <View style={styles.chevronContainer}>
        <MdIcon
          size={20}
          name={"chevron-right"}
          style={[
            enabled
              ? StyleProvider.styles.listItemTextStrong
              : StyleProvider.styles.listItemTextWeak
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, StyleProvider.styles.mainBackground]}>
      <View style={[styles.pageTitleContainer]}>
        <Text style={StyleProvider.styles.pageTitleText}>
          {props.existingList ? "Edit Spell List" : "New Spell List"}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainerPadding}>
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={showPicker}>
            <Image style={styles.cardImage} source={{ uri: thumbnailURI }} />
            <Text
              style={[
                StyleProvider.styles.listItemTextStrong,
                styles.cardPictureEditText,
                styles.cardPictureEditTextUnderlay
              ]}
            >
              {thumbnailURI ? "Change picture..." : "Add a picture..."}
            </Text>
            <Text
              style={[
                StyleProvider.styles.listItemTextStrong,
                styles.cardPictureEditText
              ]}
            >
              {thumbnailURI ? "Change picture..." : "Add a picture..."}
            </Text>
          </TouchableOpacity>
          <View style={styles.cardInfoContainer}>
            <TextInput
              numberOfLines={1}
              style={[
                StyleProvider.styles.listItemTextStrong,
                styles.cardTitle
              ]}
              value={listName}
              onChangeText={text => setListName(text)}
              placeholder="Enter a name..."
              placeholderTextColor={StyleProvider.styles.listItemTextWeak.color}
            />
          </View>
        </View>

        {makeButton(isValid(), "Finish", () =>
          props.onDone?.(makeListFromState())
        )}
        {props.existingList &&
          makeButton(true, "Delete", () =>
            props.onDelete?.(props.existingList)
          )}

        {makeButton(true, "Cancel", () => props.onCancel?.(props.existingList))}
      </ScrollView>
    </View>
  );
};

export default SpellListAddScreen;

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
  scrollContainerPadding: {
    padding: StyleProvider.styles.edgePadding.padding
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover"
  },
  cardTitle: {
    flex: 1,
    paddingLeft: StyleProvider.styles.edgePadding.padding,
    paddingVertical: StyleProvider.styles.edgePadding.padding - 5
  },
  cardPictureEditText: {
    position: "absolute",
    bottom: StyleProvider.styles.edgePadding.padding,
    left: StyleProvider.styles.edgePadding.padding
  },
  cardPictureEditTextUnderlay: {
    color: StyleProvider.styles.mainBackground.backgroundColor,
    bottom: StyleProvider.styles.edgePadding.padding - 1,

    left: StyleProvider.styles.edgePadding.padding - 1
  },
  cardInfoContainer: {
    flexDirection: "row"
  },
  cardContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    marginBottom: StyleProvider.styles.edgePadding.padding
  },
  buttonContainer: {
    borderBottomColor: StyleProvider.styles.listItemDivider.borderColor,
    borderBottomWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderTopColor: StyleProvider.styles.listItemDivider.borderColor,
    borderTopWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    padding: StyleProvider.styles.edgePadding.padding,
    paddingRight: StyleProvider.styles.edgePadding.padding - 10,
    flexDirection: "row",
    marginBottom: StyleProvider.styles.edgePadding.padding
  },
  buttonText: {
    flex: 1
  },
  chevronContainer: {
    marginVertical: -10,
    flex: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});
