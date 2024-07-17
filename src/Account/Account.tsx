import React, { useState } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Login, LoginRes } from '../APIs/Login';
import { LaoQGError } from '../Common/Errors';
import { myServer } from '../Common/Server';
import { AuthEntity } from './AuthEntity';

interface AccountProps {
  authInfo: AuthEntity,
  updateAuthInfo: (authInfo: AuthEntity) => void,
}

const Account: React.FC<AccountProps> = (props: AccountProps) => {
  // 账号
  const [userName, setUserName] = useState<string>(props.authInfo.userName);
  // 密码
  const [password, setPassword] = useState<string>(props.authInfo.password);

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
          value={userName}
          onChangeText={setUserName} />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          label={'密码'}
          style={styles.passwordInput}
          secureTextEntry
          value={password}
          onChangeText={setPassword} />
      </View>
      <Button
        mode='contained' style={styles.loginBtn}
        onPress={async () => {
          const userNameTmp: string = userName;
          const passwordTmp: string = password;
          try {
            const data: LoginRes = await login(userName, password);
            if (data) {
              props.authInfo.userName = userNameTmp;
              props.authInfo.password = passwordTmp;
              props.authInfo.loginToken = data.loginToken;
              props.authInfo.permission = data.permission;
              props.updateAuthInfo(props.authInfo);
            }
          } catch { }
        }}>
        <Text style={styles.loginText}>登录</Text>
      </Button>
    </View>
  )
}

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
    fontSize: 18,
    fontWeight: 'bold',
  },
})

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
