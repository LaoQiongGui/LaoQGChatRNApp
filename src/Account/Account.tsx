import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Login, LoginRes } from '../APIs/Login';
import { LaoQGError } from '../Common/Errors';
import LaoQGImage from '../Common/Image';
import { RootStackParamList } from '../Common/Navigation';
import { LaoQGProps } from '../Common/Props';
import { myServer } from '../Common/Server';
import { windowsStyles } from '../Common/Styles';
import { AuthInfo, UserInfo } from './AuthEntity';

export interface AccountProps extends LaoQGProps {
  authInfo: AuthInfo,
  updateAuthInfo: (authInfo: AuthInfo) => void,
}

const Account: React.FC<AccountProps> = (props: AccountProps) => {
  /** 导航 */
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  /** 账号 */
  const [userName, setUserName] = useState<string>('');
  /** 密码 */
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    loadUserInfo().then((userInfo: UserInfo | null) => {
      if (!userInfo) { return; }
      if (userInfo.userName) { setUserName(userInfo.userName); }
      if (userInfo.password) { setPassword(userInfo.password); }
      if (userInfo.userName && userInfo.password) {
        handleLogin(userInfo.userName, userInfo.password);
      }
    });
    return () => { }
  }, []);

  const handleLogin = async (userNameIn: string = userName, passwordIn: string = password) => {
    try {
      const data: LoginRes = await Login({
        server: myServer,
        userName: userNameIn,
        password: passwordIn,
      });
      // 登陆成功
      // 记住账号密码
      saveUserInfo(new UserInfo(userNameIn, passwordIn));

      // 更新登录状态
      props.authInfo.loginToken = data.loginToken;
      props.authInfo.permission = data.permission;
      props.updateAuthInfo(props.authInfo);

      // 跳转到Chat页面
      navigation.navigate('Chat');

      // 弹出登陆成功提示
      props.showError(new LaoQGError(0, "NCMRN00", "登陆成功。"));
    } catch (error) {
      // 登陆失败
      // 清空密码
      saveUserInfo(new UserInfo(userNameIn, ''));

      // 清空认证情报
      props.authInfo.loginToken = null;
      props.authInfo.permission = null;
      props.updateAuthInfo(props.authInfo);
      if (error instanceof LaoQGError) {
        props.showError(error);
      } else if (error instanceof Error) {
        props.showError(new LaoQGError(900, "ECMRN00", error.message));
      } else {
        props.showError(new LaoQGError(900, "ECMRN00", "未知异常。"));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <LaoQGImage
          style={styles.icon}
          source={require('../../resources/icons/account_circle.png')}
        />
      </View>
      <View style={styles.accountContainer}>
        <TextInput
          label={'账号'}
          style={styles.accountInput}
          contentStyle={Platform.OS === 'windows' ? windowsStyles.input : null}
          value={userName ? userName : ""}
          onChangeText={(input: string) => {
            // 账号只接受英文字母与数字
            const filteredText = input.replace('[^a-zA-Z0-9]', '');
            setUserName(filteredText);
          }} />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          label={'密码'}
          style={styles.passwordInput}
          contentStyle={Platform.OS === 'windows' ? windowsStyles.input : null}
          secureTextEntry
          value={password ? password : ""}
          onChangeText={(input: string) => {
            // 密码只接受英文字母，数字与特殊字符!@#$%^&*()+-*/_=
            const filteredText = input.replace('[^a-zA-Z0-9!@#$%\^&*()+\-*/_=]', '');
            setPassword(filteredText);
          }} />
      </View>
      <Button
        mode='contained' style={styles.loginBtn}
        onPress={() => { return handleLogin(); }}>
        <Text style={styles.loginText}>登录</Text>
      </Button>
    </View>
  )
};

export default Account

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    paddingLeft: 35,
    paddingRight: 35,
  },
  iconContainer: {
    width: '100%',
    height: '35%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
  },
  accountContainer: {
    marginTop: 20,
    height: 60,
    width: '100%',
    flexDirection: 'row',
  },
  accountInput: {
    width: '100%',
    fontSize: 16,
  },
  passwordContainer: {
    marginTop: 20,
    height: 60,
    width: '100%',
    flexDirection: 'row',
  },
  passwordInput: {
    width: '100%',
    fontSize: 16,
  },
  loginBtn: {
    marginTop: 20,
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    width: '80%',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

const loadUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const userInfoStr = await AsyncStorage.getItem('UserInfo');
    if (!userInfoStr) { return null; }
    const userInfo = JSON.parse(userInfoStr) as UserInfo;
    return userInfo;
  } catch (error) {
    return null;
  }
}

const saveUserInfo = async (userInfo: UserInfo): Promise<void> => {
  try {
    const userInfoStr = JSON.stringify(userInfo);
    await AsyncStorage.setItem('UserInfo', userInfoStr);
    return;
  } catch (error) {
    return;
  }
}
