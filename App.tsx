import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { CustomTheme } from './src/Common/Colors';
import Chat from './src/Chat/Chat';
import Account from './src/Account/Account';
import { iconStyles } from './src/Common/Styles';
import { PaperProvider } from 'react-native-paper';
import { AuthEntity } from './src/Account/AuthEntity';

const Tab = createMaterialBottomTabNavigator();
const iconMap: Map<string, any> = new Map([
  ['Chat', require('./resources/icons/chat_bubble.png')],
  ['Account', require('./resources/icons/person.png')],
]);

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthEntity>(new AuthEntity());

  return (
    <PaperProvider theme={CustomTheme}>
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
              <Tab.Screen name='Account'>
                {() => <Account auth={auth} updateAuth={(auth) => { setAuth(auth); }}></Account>}
              </Tab.Screen>
            </Tab.Navigator>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  navigator: {},
});