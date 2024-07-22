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
import { AuthEntity } from '../Account/AuthEntity';

interface SessionAreaProps {
  authInfo: AuthEntity,
  session: SessionEntity,
  updateSession: (session: SessionEntity) => void,
  emitError: (error: LaoQGError) => void,
}

enum Status {
  NORMAL, WARNING, ERROR, LOADING,
}

const SessionArea: React.FC<SessionAreaProps> = (props: SessionAreaProps) => {
  /** 页面状态 */
  const [status, setStatus] = useState<Status>(Status.NORMAL);
  /** 提问内容 */
  const [questionText, setQuestionText] = useState<string>('');

  const submitHandler = async () => {
    props.session.context.push(new SessionContext(SessionContext.QUESTION, questionText));
    props.updateSession(props.session);
    setQuestionText('');
    setStatus(Status.LOADING);
    try {
      const data: ChatRes = await chat(props.authInfo, props.session, questionText);
      if (data) {
        props.session.sessionId = data.sessionId;
        props.session.context.push(new SessionContext(SessionContext.ANSWER, data.answer));
        props.updateSession(props.session);
        setStatus(Status.NORMAL);
      }
    } catch (error) {
      if (error instanceof LaoQGError && error.getStatusCode() < 200) {
        setStatus(Status.WARNING);
        props.emitError(error);
      } else if (error instanceof LaoQGError) {
        setStatus(Status.ERROR);
        props.emitError(error);
      } else if (error instanceof Error) {
        setStatus(Status.ERROR);
        props.emitError(new LaoQGError(900, "ECMRN00", error.message));
      } else {
        setStatus(Status.ERROR);
        props.emitError(new LaoQGError(900, "ECMRN00", '未知错误。'));
      }
    }
  }

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
            onPress={submitHandler}
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
  errorAreaInfo: {
    backgroundColor: CustomTheme.colors.primaryContainer,
  },
  errorAreaWarning: {
    backgroundColor: CustomTheme.colors.tertiary,
  },
  errorAreaError: {
    backgroundColor: CustomTheme.colors.error,
  },
})

const chat = async (authInfo: AuthEntity, session: SessionEntity, question: string): Promise<ChatRes> => {
  // 没有聊天记录先清除sessionId
  if (session.context.length === 0) {
    session.sessionId = null;
  }

  const res = session.sessionId ?
    await Chat({ server: myServer, authInfo: authInfo, sessionId: session.sessionId, question: question }) :
    await StartChat({ server: myServer, authInfo: authInfo, question: question });

  return res;
}
