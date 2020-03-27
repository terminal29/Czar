import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { StyleProvider } from "../data/StyleProvider";

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
          {props.navigationState.routeNames.map((routeName, index) =>
            props.getIconForRouteName(
              routeName,
              props.navigationState.index === index
            )
          )}
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
    top: -70 - 2 * StyleProvider.styles.edgePadding.padding,
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
    padding: StyleProvider.styles.edgePadding.padding,
    borderColor: StyleProvider.styles.navbarItemUnfoccused.color,
    borderWidth: StyleProvider.styles.listItemDivider.borderWidth,
    borderStyle: StyleProvider.styles.listItemDivider.borderStyle,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  }
});
