import { StyleSheet } from "react-native";

enum Theme {
  DARK,
  LIGHT
}

class StyleProvider {
  private static styleTheme: Theme = Theme.DARK;

  public static setTheme(newTheme: Theme) {
    StyleProvider.styleTheme = newTheme;
  }

  public static styles = StyleSheet.create({
    pageTitleText: {
      fontFamily: "Rubik-Regular",
      fontSize: 25,
      color: "#EFEFEF"
    },
    mainBackground: {
      backgroundColor: "#1C1C1C"
    },
    edgePadding: {
      padding: 17
    },
    listItemDivider: {
      borderWidth: 1,
      borderColor: "#3D3D3D",
      borderStyle: "solid"
    },
    listItemIconStrong: {
      color: "#EFEFEF"
      //size: 10
    },
    listItemIconWeak: {
      color: "#3D3D3D"
    },
    listItemTextStrong: {
      fontFamily: "Rubik-Regular",
      fontSize: 14,
      color: "#EFEFEF"
    },
    listItemTextWeak: {
      fontFamily: "Rubik-Regular",
      fontSize: 13,
      color: "#919191"
    },
    navbarItem: {
      //size:22.25
    },
    navbarItemFocussed: {
      color: "#EFEFEF"
    },
    navbarItemUnfoccused: {
      color: "#919191"
    },
    textInputPlaceholderText: {
      fontFamily: "Rubik-Regular",
      fontSize: 14,
      color: "#6A6A6A"
    }
  });

  /*
    Dark Theme
    PageTitleText Rubik 25 Regular #EFEFEF
    Background #1C1C1C
    EdgePadding

    ListItemDivider borderRadius:1 #3D3D3D
    ListItemIconStrong  size: 10 #EFEFEF
    ListItemIconWeak  size: 10 #3D3D3D
    InfoTextStrong Rubik 14 Regular #EFEFEF
    InfoTextWeak Rubik 13 Regular #919191

    NavbarItem SquareSize: 22.25 
    FocussedNavbarItem #EFEFEF
    UnfocussedNavbarItem #919191

    TextInputPlaceholderText Rubik 14 Regular #6A6A6A
  */
}

export { StyleProvider, Theme };
