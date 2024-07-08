import React, { ReactNode, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialColors } from '../Common/Colors';
import { EndChat } from '../APIs/EndChat';
import { myServer } from '../Common/Server';
import { SessionEntity } from './SessionEntity';
import SessionTab from './SessionTab';
import SessionArea from './SessionArea';
import { iconStyles } from '../Common/Styles';

const Chat: React.FC = () => {
  const [sessionEntities, setSessionEntities] = useState<SessionEntity[]>([]);
  const [curSessionIndex, setCurSessionIndex] = useState<number>(0);

  const addSession = () => {
    const newSessionEntity = new SessionEntity();
    newSessionEntity.title = `新建会话${sessionEntities.length + 1}`;
    setSessionEntities((sessionEntities) => { return [...sessionEntities, newSessionEntity]; });
    setCurSessionIndex(() => { return (sessionEntities.length - 1); });
  }

  const closeSession = (index: number) => {
    // 通知服务器关闭会话
    if (sessionEntities[index].sessionId) {
      EndChat({ server: myServer, sessionId: sessionEntities[index].sessionId });
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
            <TouchableOpacity
              key={`SessionTab${index}`}
              style={styles.sessionTab}
              onPress={() => {
                setCurSessionIndex(() => { return index; });
              }}>
              <SessionTab title={item.title} isActive={index === curSessionIndex} onCloseBtnClicked={() => { closeSession(index) }} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => { return addSession(); }} style={styles.addButton}>
            <Image
              style={iconStyles.medium}
              source={require('../../resources/icons/add.png')}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {sessionEntities.map((item, index) => {
        return <View
          key={`Area${index}`}
          style={[styles.sessionAreaContainer,
          index !== curSessionIndex ? { display: 'none' } : {}]}>
          <SessionArea
            session={item}
            updateSession={(session: SessionEntity) => {
              setSessionEntities((sessionEntities) => {
                return sessionEntities.map<SessionEntity>((sessionTmp) => { return session.getInstanceId() === sessionTmp.getInstanceId() ? session : sessionTmp; });
              });
            }} /></View>
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
    backgroundColor: MaterialColors[0],
    paddingLeft: 35,
    paddingRight: 35,
  },
  sessionTabScroll: {
    width: '100%',
    height: 80,
    flexGrow: 0,
    backgroundColor: MaterialColors[0],
  },
  sessionTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: MaterialColors[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTab: {
    marginRight: 10,
  },
  sessionAreaContainer: {
    width: '100%',
    flex: 1,
  },
})
