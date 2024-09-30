import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import EnhancedImageViewing from 'react-native-image-viewing';
import { ImageSource } from 'react-native-image-viewing/dist/@types';
import { Button, Dialog, PaperProvider, Portal, Snackbar, Text } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Account from './src/Account/Account';
import { AuthInfo } from './src/Account/AuthEntity';
import Administrator from './src/Administrator/Administrator';
import Chat from './src/Chat/Chat';
import { CustomTheme } from './src/Common/Colors';
import { LaoQGError } from './src/Common/Errors';
import LaoQGImage from './src/Common/Image';
import { RootStackParamList } from './src/Common/Navigation';
import { iconStyles } from './src/Common/Styles';
import { DialogProps } from './src/Interfaces/Dialog';

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();
const iconMap: Map<string, any> = new Map([
  ['Chat', require('./resources/icons/chat_bubble.png')],
  ['Test', require('./resources/icons/chat_bubble.png')],
  ['Administrator', require('./resources/icons/administrator.png')],
  ['Account', require('./resources/icons/person.png')],
]);

const App: React.FC = () => {
  /** 弹出框显示信息 */
  const [dialogProps, setDialogProps] = useState<null | DialogProps>(null);
  /** 异常信息 */
  const [error, setError] = useState<LaoQGError>();
  /** 认证信息 */
  const [authInfo, setAuthInfo] = useState<AuthInfo>(new AuthInfo());
  /** 全屏显示图片 */
  const [imageSource, setImageSource] = useState<null | ImageSource>(null);

  useEffect(() => {
    // 请求存储权限
    requestStoragePermission().catch(
      (error) => {
        if (error instanceof LaoQGError) {
          setError(error);
        } else if (error instanceof Error) {
          setError(new LaoQGError(900, "EPRRN00", error.message));
        } else {
          setError(new LaoQGError(900, "ECMRN00", "未知异常。"));
        }
      }
    );
    return () => { }
  }, []);
  /** 全屏显示图片 */
  const showImage = (imageSource: ImageSource) => { setImageSource(imageSource); };
  /** 显示提示框 */
  const showDialog = (dialogProps: DialogProps) => { setDialogProps(dialogProps); };
  /** 显示消息框 */
  const showError = (error: LaoQGError) => { setError(error); };

  return (
    <PaperProvider theme={CustomTheme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <Tab.Navigator
              style={styles.navigator}
              screenOptions={({ route }) => ({
                tabBarIcon: () => {
                  return <LaoQGImage
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
                  showImage={showImage}
                  showDialog={showDialog}
                  showError={showError} />}
              </Tab.Screen>
              {Platform.OS === 'windows' && authInfo.permission === 'super' ? <Tab.Screen name='Administrator'>
                {() => <Administrator />}
              </Tab.Screen> : null}
              <Tab.Screen name='Account'>
                {() => <Account
                  authInfo={authInfo}
                  updateAuthInfo={(authInfoTmp) => {
                    setAuthInfo(authInfoTmp);
                  }}
                  showImage={showImage}
                  showDialog={showDialog}
                  showError={showError} />}
              </Tab.Screen>
            </Tab.Navigator>
          </View>
          {/* 确认框 */}
          <Portal>
            <Dialog visible={!!dialogProps} onDismiss={() => { setDialogProps(null); }}>
              <Dialog.Title>
                <Text>{!!dialogProps ? dialogProps.title : ''}</Text>
              </Dialog.Title>
              <Dialog.Content>
                <Text>{!!dialogProps ? dialogProps.context : ''}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                {dialogProps?.actions.map((item, index) => (
                  <Button key={`DialogActionButton${index}`} onPress={() => { item.pressHandler(setDialogProps); }}>
                    <Text>{item.text}</Text>
                  </Button>
                ))}
              </Dialog.Actions>
            </Dialog>
          </Portal>
          {/* 消息提示框 */}
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
          ><Text>{error ? error.toString() : ""}</Text>
          </Snackbar>
          {/* 图片全屏显示 */}
          <EnhancedImageViewing
            images={imageSource ? [imageSource] : []}
            imageIndex={0}
            visible={!!imageSource}
            onRequestClose={() => { setImageSource(null); }} />
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

    if (granted === 'denied') {
      throw new LaoQGError(300, "EPRRN00", "获取本地读写权限失败，可能无法记住账号密码与对话记录。");
    }
  }
};
