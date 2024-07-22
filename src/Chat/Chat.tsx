import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, IconButton, Text } from 'react-native-paper';
import { AuthEntity } from '../Account/AuthEntity';
import { EndChat } from '../APIs/EndChat';
import { CustomTheme } from '../Common/Colors';
import { LaoQGError } from '../Common/Errors';
import { RootStackParamList } from '../Common/Navigation';
import { myServer } from '../Common/Server';
import { iconStyles } from '../Common/Styles';
import SessionArea from './SessionArea';
import { SessionEntity } from './SessionEntity';

interface ChatProps {
  authInfo: AuthEntity,
  emitError: (error: LaoQGError) => void,
}

const Chat: React.FC<ChatProps> = (props: ChatProps) => {
  // 导航
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // 会话列表
  const [sessionEntities, setSessionEntities] = useState<SessionEntity[]>([]);
  // 当前会话
  const [curSessionIndex, setCurSessionIndex] = useState<number>(0);

  const addSession = () => {
    const newSessionEntity = new SessionEntity();
    newSessionEntity.title = `新建会话${sessionEntities.length + 1}`;
    setSessionEntities((sessionEntities) => { return [...sessionEntities, newSessionEntity]; });
    setCurSessionIndex(() => { return (sessionEntities.length); });
  }

  const closeSession = (index: number) => {
    // 通知服务器关闭会话
    if (sessionEntities[index].sessionId) {
      EndChat({ server: myServer, authInfo: props.authInfo, sessionId: sessionEntities[index].sessionId });
    }
    if (sessionEntities.length === 1) {
      // 没有会话时初始化一个会话
      setSessionEntities(() => { return [new SessionEntity('', '新建会话1')]; });
    } else {
      // 是最后一个会话时激活前一个会话
      if (curSessionIndex === sessionEntities.length - 1) { setCurSessionIndex(curSessionIndex - 1); }
      setSessionEntities((sessionEntities) => { return [...sessionEntities.slice(0, index), ...sessionEntities.slice(index + 1)]; });
    }
  }

  /** 加载会话记录 */
  const loadSessions = async () => {
    try {
      // 从本地缓存加载会话
      const sessionEntitiesStr: string | null = await AsyncStorage.getItem('@session_entities');
      // 没有本地缓存时初始化一个会话
      if (sessionEntitiesStr === null) { throw new Error("Null Pointer Exception"); }
      setSessionEntities(() => { return JSON.parse(sessionEntitiesStr); });
      // 没有会话时初始化一个会话
      if (sessionEntities.length === 0) { throw new Error("Null Pointer Exception"); }
    } catch (exception) {
      setSessionEntities(() => { return [new SessionEntity('', '新建会话1')]; });
    }
  }

  /** 缓存会话记录 */
  const saveSessions = async () => {
    try {
      const sessionEntitiesStr: string = JSON.stringify(sessionEntities);
      // 缓存会话记录到本地缓存
      await AsyncStorage.setItem('@session_entities', sessionEntitiesStr);
    } catch (exception) { }
  }

  useEffect(() => {
    loadSessions();
    return () => { saveSessions() };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.sessionTabScroll} showsHorizontalScrollIndicator={false}>
        <View style={styles.sessionTabContainer}>
          {sessionEntities.map((item, index) => (
            <Chip
              key={`SessionTab${index}`}
              style={[styles.sessionTab, index !== curSessionIndex ? { backgroundColor: CustomTheme.colors.primary } : null, index !== 0 ? { marginLeft: 10 } : null]}
              closeIcon={() => <Image style={iconStyles.medium} source={require("../../resources/icons/close.png")} />}
              onPress={() => { setCurSessionIndex(() => { return index; }); }}
              onClose={() => { closeSession(index); }}>
              <Text style={styles.sessionTabText}>{sessionEntities[index].title}</Text>
            </Chip>
          ))}
          <IconButton
            mode='contained'
            icon={() => <Image style={iconStyles.medium} source={require('../../resources/icons/add.png')} />}
            onPress={() => { return addSession(); }} />
        </View>
      </ScrollView>
      {sessionEntities.map((item, index) => {
        return <View
          key={`Area${index}`}
          style={[styles.sessionAreaContainer,
          index !== curSessionIndex ? { display: 'none' } : {}]}>
          <SessionArea
            authInfo={props.authInfo}
            session={item}
            updateSession={(session: SessionEntity) => {
              setSessionEntities((sessionEntities) => {
                return sessionEntities.map<SessionEntity>((sessionTmp) => { return session.getInstanceId() === sessionTmp.getInstanceId() ? session : sessionTmp; });
              });
            }}
            emitError={props.emitError} />
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
