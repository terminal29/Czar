import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { AppStyles } from "../styles/AppStyles";
import SpellSourceItem from "../components/SpellSourceItem";
import Icon from "react-native-vector-icons/Ionicons";

interface SpellSourcesScreenProps {
  spellSources: string[];
}

const SpellSourcesScreen = (props: SpellSourcesScreenProps) => {
  return (
    <View style={[AppStyles.appBackground, styles.container]}>
      <View style={[AppStyles.headerContainer]}>
        <Text style={[AppStyles.headerText]}>Spell Sources</Text>
        <Text style={[AppStyles.headerSubtext]}>Manage your spell sources</Text>
      </View>
      <View style={[AppStyles.edgePadding, styles.container]}>
        <TouchableOpacity>
          <View
            style={[
              AppStyles.boxBackground,
              AppStyles.boxRounded,
              styles.reloadButton
            ]}
          >
            <Text style={AppStyles.smallHeaderSubtext}>
              Re-download Spell Data
            </Text>
            <Text style={AppStyles.infoText}>Updated 2/2/2020</Text>
          </View>
        </TouchableOpacity>

        <ScrollView>
          {props.spellSources.map(spellSource => (
            <SpellSourceItem
              sourceURL={spellSource}
              style={styles.sourceItem}
            />
          ))}
          <View
            style={[
              AppStyles.boxRounded,
              styles.boxBorder,
              styles.addButtonContainer
            ]}
          >
            <TextInput
              multiline={true}
              style={[AppStyles.headerSubtext, styles.sourceInput]}
            ></TextInput>
            <View style={styles.sourceAddButton}>
              <Icon
                style={[AppStyles.headerSubtext, styles.sourceAddButtonPlus]}
                name={"ios-add"}
                size={40}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default SpellSourcesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  reloadButton: {
    padding: 15,
    alignItems: "center",
    marginBottom: 20
  },
  boxBorder: {
    borderColor: AppStyles.boxBackground.backgroundColor,
    borderWidth: 2
  },
  addButtonContainer: {
    flexDirection: "row",
    marginBottom: 20
  },
  sourceInput: {
    padding: 20,
    flex: 1
  },
  sourceAddButton: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20
  },
  sourceAddButtonPlus: { fontSize: 40 },
  sourceScroll: {
    flex: 1
  },
  sourceItem: {
    marginTop: 10,
    marginBottom: 20
  }
});
