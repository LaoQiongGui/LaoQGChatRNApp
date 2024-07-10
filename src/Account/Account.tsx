import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { MaterialColors, Transparent } from '../Common/Colors';

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
          style={styles.accountInput}
          placeholder='账号'
          placeholderTextColor={MaterialColors[2]} />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder='密码'
          placeholderTextColor={MaterialColors[2]}
          secureTextEntry />
      </View>
      <TouchableOpacity style={styles.loginBtn}>
        <Text style={styles.loginText}>登录</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Account

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: MaterialColors[0],
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
    borderColor: MaterialColors[2],
    borderWidth: 1,
    height: 50,
    width: '100%',
    backgroundColor: MaterialColors[1],
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  accountInput: {
    borderColor: Transparent,
    width: '100%',
    fontSize: 16,
    backgroundColor: Transparent,
  },
  passwordContainer: {
    marginTop: 20,
    borderColor: MaterialColors[2],
    borderWidth: 1,
    height: 50,
    width: '100%',
    backgroundColor: MaterialColors[1],
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  passwordInput: {
    borderColor: Transparent,
    width: '100%',
    fontSize: 16,
    backgroundColor: Transparent,
  },
  loginBtn: {
    marginTop: 20,
    borderRadius: 4,
    height: 50,
    backgroundColor: MaterialColors[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
})