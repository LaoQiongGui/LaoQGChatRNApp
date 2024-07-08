import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { SessionContext, SessionEntity } from './SessionEntity';
import { MaterialColors, Transparent } from '../Common/Colors';
import { Text } from 'react-native-paper';
import { myServer } from '../Common/Server';
import { LaoQGError } from '../Common/Errors';
import { iconStyles } from '../Common/Styles';
import { CommonRes } from '../APIs/CommonAPI';
import { StartChat } from '../APIs/StartChat';
import { Chat, ChatRes } from '../APIs/Chat';

interface SessionAreaProps {
  session: SessionEntity,
  updateSession: (session: SessionEntity) => void,
}

enum Status {
  NORMAL, WARNING, ERROR, LOADING,
}

const SessionArea: React.FC<SessionAreaProps> = (props: SessionAreaProps) => {
  /** 页面状态 */
  const [status, setStatus] = useState<Status>(Status.NORMAL);
  /** 提问内容 */
  const [questionText, setQuestionText] = useState<string>('');

  return (
    <View style={styles.container}>
      {/* 聊天记录区域 */}
      <View style={styles.conversationContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {props.session.context.map((item, index) => (
            <View
              key={'context' + index}
              style={[
                styles.contextAreaContainer,
                item.flag === SessionContext.QUESTION ? styles.contextAreaContainerQuestion : styles.contextAreaContainerAnswer
              ]}>
              {status === Status.LOADING && index === props.session.context.length - 1 ? <View><Text>Loading...</Text></View> : null}
              <View
                style={[
                  styles.contextArea,
                  item.flag === SessionContext.QUESTION ? styles.contextAreaQuestion : styles.contextAreaAnswer
                ]}>
                <Text>{item.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* 提问区域 */}
      <View style={styles.questionContainer}>
        <TextInput
          style={styles.questionTextArea}
          multiline={true}
          numberOfLines={4}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="请输入提问内容"
          scrollEnabled={true}
        />
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={async () => {
              props.session.context.push(new SessionContext(SessionContext.QUESTION, questionText));
              props.updateSession(props.session);
              setQuestionText('');
              setStatus(Status.LOADING);
              try {
                const data: ChatRes = await chat(props.session, questionText);
                if (data) {
                  props.session.sessionId = data.sessionId;
                  props.session.context.push(new SessionContext(SessionContext.ANSWER, data.answer));
                  props.updateSession(props.session);
                  setStatus(Status.NORMAL);
                }
              } catch (error) {
                props.session.context.push(new SessionContext(SessionContext.ANSWER, `ERROR: ${error}`));
                props.updateSession(props.session);
                if (error instanceof LaoQGError && error.messageCode < 200) {
                  setStatus(Status.WARNING);
                } else {
                  setStatus(Status.ERROR);
                }
              }
            }}
          >
            <Image
              style={iconStyles.medium}
              source={require('../../resources/icons/arrow_forward.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default SessionArea

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Transparent,
    flexDirection: 'column',
  },
  conversationContainer: {
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    backgroundColor: Transparent,
    flexDirection: 'column',
  },
  contextAreaContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  contextAreaContainerQuestion: {
    justifyContent: 'flex-end',
  },
  contextAreaContainerAnswer: {
    justifyContent: 'flex-start',
  },
  contextArea: {
    marginBottom: 10,
    borderRadius: 15,
    maxWidth: '70%',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  contextAreaQuestion: {
    backgroundColor: MaterialColors[1],
  },
  contextAreaAnswer: {
    backgroundColor: MaterialColors[2],
  },
  questionContainer: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 15,
    height: 100,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: MaterialColors[1],
    flexDirection: 'row',
  },
  questionTextArea: {
    flex: 1,
    height: '100%',
  },
  sendButtonContainer: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
  },
  sendButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const chat = async (session: SessionEntity, question: string): Promise<ChatRes> => {
  // 没有提问内容立刻返回
  if (!question) {
    throw new LaoQGError(100, "请输入提问内容");
  }

  // 没有聊天记录先清除sessionId
  if (session.context.length === 0) {
    session.sessionId = null;
  }

  if (!session.sessionId) {
    // sessionId未设置则调用StartChat开启新会话
    const res = await StartChat({ server: myServer, question: question });

    if (!res.ok) {
      throw new LaoQGError(300, "网络异常");
    }

    const data = (await res.json()) as CommonRes<ChatRes>;

    // 异常返回
    if (data.common.status != 0) {
      throw new LaoQGError(data.common.status, data.common.message_text);
    }

    // 正常返回
    return data.data;
  } else {
    // sessionId已设置则调用Chat继续会话
    const res = await Chat({ server: myServer, sessionId: session.sessionId, question: question });
    if (!res.ok) {
      throw new LaoQGError(300, "网络异常");
    }

    const data = (await res.json()) as CommonRes<ChatRes>;

    // 异常返回
    if (data.common.status != 0) {
      throw new LaoQGError(data.common.status, data.common.message_text);
    }

    // 正常返回
    return data.data;
  }
}
