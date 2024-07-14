import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Text, TextInput, TouchableRipple } from 'react-native-paper';

const Account: React.FC = () => {
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
          style={styles.accountInput} />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          label={'密码'}
          style={styles.passwordInput}
          secureTextEntry />
      </View>
      <Button mode='contained' style={styles.loginBtn}>
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