import * as React from 'react';
import { Text, View, StyleSheet,Button } from 'react-native';
import { SpellList } from '../structs/SpellList';

interface SpellListsScreenProps {
    spellLists:SpellList[];
}

const SpellListsScreen = (props: SpellListsScreenProps) => {
  return (
    <View style={styles.container}>
        <Text>Spell Lists</Text>
        <Text>Manage your characters' spells</Text>
        {
            props.spellLists.map(spellList => 
            <Button title={spellList.name} onPress={()=>{}} />
            )
        }

    </View>
  );
};

export default SpellListsScreen;

const styles = StyleSheet.create({
  container: {}
});
