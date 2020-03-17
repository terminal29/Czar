import * as React from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import { useState } from "react";
import { AppStyles } from "../styles/AppStyles";
import { SpellList } from "../structs/SpellList";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import RoundedIconButton from "../components/RoundedIconButton";
import ImagePicker from "react-native-image-picker";
import Toast from "react-native-root-toast";
import { v4 as uuid } from "react-native-uuid";

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
    const list = props.existingList ? props.existingList : new SpellList();
    list.name = listName;
    list.thumbnailURI = thumbnailURI;
    list.id = list.id ? list.id : uuid();
    return list;
  };

  const showPicker = () => {
    ImagePicker.showImagePicker(options, response => {
      console.log("Response = ", response);
      if (response.error) {
        console.log("ImagePicker Error: ", response.error);
        Toast.show("Unable to load image");
      } else {
        setThumbnailURI(`data:image/jpeg;base64,${response.data}`);
      }
    });
  };

  return (
    <ScrollView
      style={[AppStyles.appBackground, styles.container]}
      contentContainerStyle={{
        padding: AppStyles.edgePadding.paddingHorizontal
      }}
    >
      <View
        style={[
          AppStyles.boxRounded,
          AppStyles.boxBackground,
          styles.innerBox,
          styles.marginBottom
        ]}
      >
        <Text style={[AppStyles.headerText, styles.marginBottom]}>
          {props.existingList ? "Modify" : "Add"} Spell List
        </Text>
        <TextInput
          value={listName}
          onChangeText={text => setListName(text)}
          style={[
            AppStyles.headerSubtext,
            styles.nameInput,
            styles.boxBorder,
            styles.marginBottom
          ]}
          placeholderTextColor={AppStyles.inputPlaceholder.color}
          placeholder={"List name..."}
        />
        <TouchableOpacity
          style={[styles.imageContainer, styles.boxBorder]}
          onPress={() => showPicker()}
        >
          {thumbnailURI ? (
            <Image
              style={styles.imageThumbnail}
              resizeMode={"cover"}
              source={{ uri: thumbnailURI }}
            />
          ) : (
            <View>
              <Text style={[AppStyles.inputPlaceholder]}>Add an image</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <RoundedIconButton
        iconName={"ios-add"}
        text={props.existingList ? "Save" : "Done"}
        disabled={!listName}
        onPressed={() => props?.onDone(makeListFromState())}
        onPressedWhileDisabled={() =>
          Toast.show("Your spell list must have a name.", {
            duration: Toast.durations.LONG
          })
        }
        style={[styles.marginBottom]}
      />
      {props.existingList && (
        <RoundedIconButton
          iconName={"ios-close"}
          text={"Delete"}
          disabled={false}
          onPressed={() => props?.onDelete()}
          style={[styles.marginBottom]}
        />
      )}
      <RoundedIconButton
        iconName={"ios-arrow-back"}
        text={"Cancel"}
        disabled={false}
        onPressed={() => props?.onCancel()}
        style={[styles.marginBottom]}
      />
    </ScrollView>
  );
};

export default SpellListAddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  innerBox: {
    padding: 20
  },
  boxBorder: {
    borderColor: AppStyles.appBackground.backgroundColor,
    borderWidth: 2,
    borderRadius: AppStyles.boxRounded.borderRadius
  },
  marginBottom: {
    marginBottom: AppStyles.edgePadding.paddingHorizontal
  },
  nameInput: {
    padding: 13,
    flex: 1,
    paddingLeft: 20,
    fontSize: 20
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: AppStyles.appBackground.backgroundColor,
    alignItems: "center",
    justifyContent: "center"
  },
  imageThumbnail: {
    flex: 1,
    alignSelf: "stretch"
  }
});
