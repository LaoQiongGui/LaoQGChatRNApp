import React, { useEffect, useState } from 'react';
import { Image, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { CustomTheme } from './src/Common/Colors';
import Chat from './src/Chat/Chat';
import Account from './src/Account/Account';
import { iconStyles } from './src/Common/Styles';
import { PaperProvider } from 'react-native-paper';
import { AuthEntity } from './src/Account/AuthEntity';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LaoQGError } from './src/Common/Errors';
import { Login, LoginRes } from './src/APIs/Login';
import { myServer } from './src/Common/Server';
import Administrator from './src/Administrator/Administrator';

const Tab = createMaterialBottomTabNavigator();
const iconMap: Map<string, any> = new Map([
  ['Chat', require('./resources/icons/chat_bubble.png')],
  ['Administrator', require('./resources/icons/administrator.png')],
  ['Account', require('./resources/icons/person.png')],
]);

const App: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<AuthEntity>(new AuthEntity());

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestStoragePermission();
    }
    loadAuthInfo().then((authInfoTmp: AuthEntity | null) => {
      if (authInfoTmp) {
        setAuthInfo(authInfoTmp);
        try {
          login(authInfoTmp.userName, authInfoTmp.password);
        } catch (error) { }
      }
    });
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
            >
              <Tab.Screen name='Chat'>
                {() => <Chat authInfo={authInfo} />}
              </Tab.Screen>
              {Platform.OS === 'windows' && authInfo.permission === 'super' ? <Tab.Screen name='Administrator'>
                {() => <Administrator />}
              </Tab.Screen> : null}
              <Tab.Screen name='Account'>
                {() => <Account authInfo={authInfo} updateAuthInfo={(authInfoTmp) => {
                  saveAuthInfo(authInfoTmp);
                  setAuthInfo(authInfoTmp);
                }} />}
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

const loadAuthInfo = async (): Promise<AuthEntity | null> => {
  try {
    const authInfoStr = await AsyncStorage.getItem('AuthInfo');
    if (!authInfoStr) {
      return null;
    }
    const authInfo = JSON.parse(authInfoStr) as AuthEntity;
    return authInfo;
  } catch (error) {
    return null;
  }
}

const saveAuthInfo = async (authInfo: AuthEntity): Promise<void> => {
  try {
    const authInfoStr = JSON.stringify(authInfo);
    await AsyncStorage.setItem('AuthInfo', authInfoStr);
    return;
  } catch (error) {
    return;
  }
}

const login = async (userName: string, password: string): Promise<LoginRes> => {
  // 账号密码为空立即返回
  if (!userName || !password || password.length < 8) {
    throw new LaoQGError(100, "账号或密码为空或格式错误");
  }

  const res = await Login({ server: myServer, userName: userName, password: password });

  if (res.status != 200) {
    throw new LaoQGError(300, "网络异常");
  }

  // 异常返回
  if (res.data.common.status != 0) {
    throw new LaoQGError(res.data.common.status, res.data.common.message_text);
  }

  // 正常返回
  return res.data.data;
}
