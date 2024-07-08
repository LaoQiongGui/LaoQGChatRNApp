import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { MaterialColors, Transparent } from './src/Common/Colors';
import Chat from './src/Chat/Chat';
import Account from './src/Account/Account';
import { iconStyles } from './src/Common/Styles';

const Tab = createMaterialBottomTabNavigator();
const iconMap: Map<string, any> = new Map([
  ['Chat', require('./resources/icons/chat_bubble.png')],
  ['Account', require('./resources/icons/person.png')],
]);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <Tab.Navigator
            style={styles.navigator}
            screenOptions={({ route }) => ({
              tabBarIcon: () => {
                return <Image
                  style={iconStyles.medium}
                  source={iconMap.get(route.name)}
                />
              }
            })}
          >
            <Tab.Screen name='Chat' component={Chat}></Tab.Screen>
            <Tab.Screen name='Account' component={Account}></Tab.Screen>
          </Tab.Navigator>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: MaterialColors[0],
  },
  navigator: {
    backgroundColor: Transparent,
  },
});