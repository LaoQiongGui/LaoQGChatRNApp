import { View, StyleSheet, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { SessionContext, SessionEntity } from './SessionEntity';
import { Text, TextInput } from 'react-native-paper';
import { myServer } from '../Common/Server';
import { LaoQGError } from '../Common/Errors';
import { iconStyles } from '../Common/Styles';
import { StartChat } from '../APIs/StartChat';
import { Chat, ChatRes } from '../APIs/Chat';
import { CustomTheme } from '../Common/Colors';

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
                <Text selectable={true}>{item.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* 提问区域 */}
      <TextInput
        label={'提问'}
        style={styles.questionTextArea}
        multiline={true}
        value={questionText}
        onChangeText={setQuestionText}
        scrollEnabled={true}
        right={
          <TextInput.Icon
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
            icon={() => <Image style={iconStyles.medium} source={require('../../resources/icons/arrow_forward.png')} />} />
        }
      />
    </View>
  )
}

export default SessionArea

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  conversationContainer: {
    marginBottom: 20,
    flex: 1,
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
    borderRadius: 10,
    maxWidth: '80%',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  contextAreaQuestion: {
    backgroundColor: CustomTheme.colors.primaryContainer,
  },
  contextAreaAnswer: {
    backgroundColor: CustomTheme.colors.primary,
  },
  questionTextArea: {
    marginTop: 20,
    marginBottom: 20,
    height: 100,
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

    if (res.status != 200) {
      throw new LaoQGError(300, "网络异常");
    }

    // 异常返回
    if (res.data.common.status != 0) {
      throw new LaoQGError(res.data.common.status, res.data.common.message_text);
    }

    // 正常返回
    return res.data.data;
  } else {
    // sessionId已设置则调用Chat继续会话
    const res = await Chat({ server: myServer, sessionId: session.sessionId, question: question });
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
}
