import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Login, LoginRes } from '../APIs/Login';
import { LaoQGError } from '../Common/Errors';
import { RootStackParamList } from '../Common/Navigation';
import { myServer } from '../Common/Server';
import { AuthEntity } from './AuthEntity';

export interface AccountProps {
  authInfo: AuthEntity,
  updateAuthInfo: (authInfo: AuthEntity) => void,
  emitError: (error: LaoQGError) => void,
}

export interface AccountRef {
  handleLogin: () => void;
}

const Account = forwardRef<AccountRef, AccountProps>((props: AccountProps, ref: ForwardedRef<AccountRef>) => {
  /** 导航 */
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  /** 账号 */
  const [userName, setUserName] = useState<null | string>(props.authInfo.userName);
  /** 密码 */
  const [password, setPassword] = useState<null | string>(props.authInfo.password);

  // 登录函数
  useImperativeHandle(ref, () => ({
    handleLogin: handleLogin,
  }));

  const handleLogin = async () => {
    const userNameTmp: string = userName ? userName : "";
    const passwordTmp: string = password ? password : "";
    try {
      const data: LoginRes = await Login({
        server: myServer,
        userName: userNameTmp,
        password: passwordTmp
      });
      // 登陆成功
      // 记录账号密码
      props.authInfo.userName = userNameTmp;
      props.authInfo.password = passwordTmp;
      props.authInfo.loginToken = data.loginToken;
      props.authInfo.permission = data.permission;
      props.updateAuthInfo(props.authInfo);

      // 跳转到Chat页面
      navigation.navigate('Chat');

      // 弹出登陆成功提示
      props.emitError(new LaoQGError(0, "NCMRN00", "登陆成功。"));
    } catch (error) {
      // 登陆失败 清空密码和认证情报
      props.authInfo.password = null;
      props.authInfo.loginToken = null;
      props.authInfo.permission = null;
      props.updateAuthInfo(props.authInfo);
      if (error instanceof LaoQGError) {
        props.emitError(error);
      } else if (error instanceof Error) {
        props.emitError(new LaoQGError(900, "ECMRN00", error.message));
      } else {
        props.emitError(new LaoQGError(990, "ECMRN00", "未知异常。"));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          style={styles.icon}
          source={require('../../resources/icons/account_circle.png')}
        />
      </View>
      <View style={styles.accountContainer}>
        <TextInput
          label={'账号'}
          style={styles.accountInput}
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
        onPress={handleLogin}>
        <Text style={styles.loginText}>登录</Text>
      </Button>
    </View>
  )
});

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
