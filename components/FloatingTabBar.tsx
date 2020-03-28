import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { StyleProvider } from "../data/StyleProvider";
import { TouchableOpacity } from "react-native-gesture-handler";

interface FloatingTabBarProps {
  navigationState: any;
  navigationDescriptors: any;
  navigation: any;
  getIconForRouteName: (name: string, active: boolean) => React.ReactElement;
}

const FloatingTabBar = (props: FloatingTabBarProps) => {
  console.log(props.navigationState);
  return (
    <View style={styles.container}>
      <View style={styles.navOuterContainer}>
        <View style={styles.navInnerContainer}>
          {props.navigationState.routeNames.map((routeName, index) => (
            <TouchableOpacity
              containerStyle={styles.buttonTouchArea}
              onPress={() => props.navigation.navigate(routeName)}
              disabled={props.navigationState.index === index}
            >
              {props.getIconForRouteName(
                routeName,
                props.navigationState.index === index
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FloatingTabBar;

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
    height: 0
  },
  navOuterContainer: {
    top: -StyleProvider.styles.navbar.height,
    padding: StyleProvider.styles.edgePadding.padding / 2,
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute"
  },
  navInnerContainer: {
    backgroundColor: StyleProvider.styles.mainBackground.backgroundColor,
    flex: 1,
    borderRadius: 10,
    paddingVertical: StyleProvider.styles.edgePadding.padding,
    paddingHorizontal: StyleProvider.styles.edgePadding.padding / 2,
    borderColor: StyleProvider.styles.navbarItemUnfoccused.color,
    borderWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    flexDirection: "row",
    alignItems: "center"
  },
  buttonTouchArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderRadius: 10,
    marginHorizontal: StyleProvider.styles.edgePadding.padding / 2
  }
});
