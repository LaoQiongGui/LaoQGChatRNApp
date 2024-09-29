import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, IconButton, Text } from 'react-native-paper';
import { AuthInfo } from '../Account/AuthEntity';
import { EndChat } from '../APIs/EndChat';
import { CustomTheme } from '../Common/Colors';
import LaoQGImage from '../Common/Image';
import { RootStackParamList } from '../Common/Navigation';
import { LaoQGProps } from '../Common/Props';
import { myServer } from '../Common/Server';
import { iconStyles } from '../Common/Styles';
import ChatSession from './ChatSession';
import { ChatSessionEntity } from './ChatSessionEntity';

interface ChatProps extends LaoQGProps {
  authInfo: AuthInfo,
}

const Chat: React.FC<ChatProps> = (props: ChatProps) => {
  // 导航
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // 会话列表
  const [sessionEntities, setSessionEntities] = useState<ChatSessionEntity[]>([]);
  // 当前会话
  const [curSessionIndex, setCurSessionIndex] = useState<number>(0);

  const addSession = () => {
    const newSessionEntity = new ChatSessionEntity();
    newSessionEntity.title = `新建会话${sessionEntities.length + 1}`;

    setSessionEntities((sessionEntities) => {
      const sessionEntitiesTmp: ChatSessionEntity[] = [...sessionEntities, newSessionEntity];
      saveSessions(sessionEntitiesTmp);
      return sessionEntitiesTmp;
    });
    setCurSessionIndex(sessionEntities.length);
  }

  const closeSession = (index: number) => {
    // 通知服务器关闭会话
    if (sessionEntities[index].sessionId) {
      EndChat({ server: myServer, authInfo: props.authInfo, sessionId: sessionEntities[index].sessionId });
    }
    if (sessionEntities.length === 1) {
      // 没有会话时初始化一个会话
      setSessionEntities(() => {
        const sessionEntitiesTmp: ChatSessionEntity[] = [new ChatSessionEntity('', '新建会话1')];
        saveSessions(sessionEntitiesTmp);
        return sessionEntitiesTmp;
      });
    } else {
      // 是最后一个会话时激活前一个会话
      if (curSessionIndex === sessionEntities.length - 1) { setCurSessionIndex(curSessionIndex - 1); }
      setSessionEntities((sessionEntities) => {
        const sessionEntitiesTmp = [...sessionEntities.slice(0, index), ...sessionEntities.slice(index + 1)];
        saveSessions(sessionEntitiesTmp);
        return sessionEntitiesTmp;
      });
    }
  }

  useEffect(() => {
    loadSessions().then((sessionEntitiesIn) => {
      setSessionEntities(sessionEntitiesIn.map<ChatSessionEntity>((item) => {
        if (item.contexts === null || item.contexts === undefined) {
          item.contexts = [];
        }
        if (item.options === null || item.options === undefined) {
          item.options = [];
        }
        return item;
      }));
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* 会话导航栏 */}
      <ScrollView horizontal style={styles.sessionTabScroll} showsHorizontalScrollIndicator={false}>
        <View style={styles.sessionTabContainer}>
          {sessionEntities.map((item, index) => (
            <Chip
              key={`SessionTab${index}`}
              style={[styles.sessionTab, index !== curSessionIndex ? { backgroundColor: CustomTheme.colors.primary } : null, index !== 0 ? { marginLeft: 10 } : null]}
              closeIcon={() => <LaoQGImage style={iconStyles.medium} source={require("../../resources/icons/close.png")} />}
              onPress={() => { setCurSessionIndex(() => { return index; }); }}
              onClose={() => { closeSession(index); }}>
              <Text style={styles.sessionTabText}>{sessionEntities[index].title}</Text>
            </Chip>
          ))}
          <IconButton
            mode='contained'
            icon={() => {
              return (
                <LaoQGImage style={iconStyles.medium} source={require('../../resources/icons/add.png')} />
              )
            }}
            onPress={() => { return addSession(); }} />
        </View>
      </ScrollView>
      {/* 会话主体 */}
      {sessionEntities.map((item, index) => {
        return <View
          key={`Area${index}`}
          style={[styles.sessionAreaContainer,
          index !== curSessionIndex ? { display: 'none' } : {}]}>
          <ChatSession
            authInfo={props.authInfo}
            session={item}
            updateSession={() => {
              setSessionEntities(() => {
                saveSessions(sessionEntities);
                return sessionEntities;
              });
            }}
            showImage={props.showImage}
            showDialog={props.showDialog}
            showError={(error) => {
              if (error.getMessageCode().startsWith('EAU')) {
                navigation.navigate('Account');
              }
              props.showError(error);
            }} />
        </View>
      })}
    </View>
  )
}

export default Chat

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    paddingLeft: 35,
    paddingRight: 35,
  },
  sessionTabScroll: {
    width: '100%',
    height: 80,
    flexGrow: 0,
  },
  sessionTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTab: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTabText: {
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  sessionAreaContainer: {
    width: '100%',
    flex: 1,
  },
})

/** 加载会话记录 */
const loadSessions = async (): Promise<ChatSessionEntity[]> => {
  try {
    // 从本地缓存加载会话
    const sessionEntitiesStr: string | null = await AsyncStorage.getItem('SessionEntities');
    // 没有本地缓存时初始化一个会话
    if (sessionEntitiesStr === null) { throw new Error("Null Pointer Exception"); }
    const newSessionEntities: ChatSessionEntity[] = JSON.parse(sessionEntitiesStr);
    // 没有会话时初始化一个会话
    if (newSessionEntities.length === 0) { throw new Error("Null Pointer Exception"); }
    return newSessionEntities;
  } catch (exception) {
    return [new ChatSessionEntity('', '新建会话1')];
  }
}

/** 缓存会话记录 */
const saveSessions = async (sessionEntities: ChatSessionEntity[]): Promise<void> => {
  try {
    const sessionEntitiesStr: string = JSON.stringify(sessionEntities);
    // 缓存会话记录到本地缓存
    await AsyncStorage.setItem('SessionEntities', sessionEntitiesStr);
  } catch (exception) { }
}
