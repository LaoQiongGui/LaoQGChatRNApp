import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import { PaperProvider, Snackbar, Text } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Account from './src/Account/Account';
import { AuthInfo } from './src/Account/AuthEntity';
import Administrator from './src/Administrator/Administrator';
import Chat from './src/Chat/Chat';
import { CustomTheme } from './src/Common/Colors';
import { LaoQGError } from './src/Common/Errors';
import { RootStackParamList } from './src/Common/Navigation';
import { iconStyles } from './src/Common/Styles';

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();
const iconMap: Map<string, any> = new Map([
  ['Chat', require('./resources/icons/chat_bubble.png')],
  ['Administrator', require('./resources/icons/administrator.png')],
  ['Account', require('./resources/icons/person.png')],
]);

const App: React.FC = () => {
  /** 异常信息 */
  const [error, setError] = useState<LaoQGError>();
  /** 认证信息 */
  const [authInfo, setAuthInfo] = useState<AuthInfo>(new AuthInfo());

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestStoragePermission();
    }
    return () => {}
  }, []);

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
              initialRouteName='Account'
            >
              <Tab.Screen name='Chat'>
                {() => <Chat
                  authInfo={authInfo}
                  emitError={(error: LaoQGError) => { setError(error); }} />}
              </Tab.Screen>
              {Platform.OS === 'windows' && authInfo.permission === 'super' ? <Tab.Screen name='Administrator'>
                {() => <Administrator />}
              </Tab.Screen> : null}
              <Tab.Screen name='Account'>
                {() => <Account
                  authInfo={authInfo}
                  updateAuthInfo={(authInfoTmp) => {
                    saveAuthInfo(authInfoTmp);
                    setAuthInfo(authInfoTmp);
                  }}
                  emitError={(error: LaoQGError) => { setError(error); }} />}
              </Tab.Screen>
            </Tab.Navigator>
          </View>
          <Snackbar
            visible={!!error}
            style={[
              (() => {
                if (!error) { return null; }
                else if (error.getStatusCode() < 100) { return styles.errorAreaInfo; }
                else if (error.getStatusCode() < 200) { return styles.errorAreaWarning; }
                else { return styles.errorAreaError; }
              })(),
            ]}
            onDismiss={() => setError(undefined)}
            action={{
              label: '隐藏',
            }}
          ><Text>{error ? error.toString() : ""}</Text></Snackbar>
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
  errorAreaInfo: {
    backgroundColor: CustomTheme.colors.primaryContainer,
  },
  errorAreaWarning: {
    backgroundColor: CustomTheme.colors.tertiary,
  },
  errorAreaError: {
    backgroundColor: CustomTheme.colors.error,
  },
});

const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '申请本地读写权限',
          message: '本应用需要本地读写权限储存密码和对话记录。',
          buttonPositive: '同意',
          buttonNegative: '拒绝',
        },
      );
    }
  } catch (error) { }
};

const loadAuthInfo = async (): Promise<AuthInfo | null> => {
  try {
    const authInfoStr = await AsyncStorage.getItem('AuthInfo');
    if (!authInfoStr) {
      return null;
    }
    const authInfo = JSON.parse(authInfoStr) as AuthInfo;
    return authInfo;
  } catch (error) {
    return null;
  }
}

const saveAuthInfo = async (authInfo: AuthInfo): Promise<void> => {
  try {
    const authInfoTmp = authInfo;
    authInfoTmp.loginToken = null;
    const authInfoStr = JSON.stringify(authInfoTmp);
    await AsyncStorage.setItem('AuthInfo', authInfoStr);
    return;
  } catch (error) {
    return;
  }
}
