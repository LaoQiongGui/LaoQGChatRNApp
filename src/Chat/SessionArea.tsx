import React, { useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, LayoutRectangle, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { AuthInfo } from '../Account/AuthEntity';
import { Chat, ChatRes } from '../APIs/Chat';
import { StartChat } from '../APIs/StartChat';
import { CustomTheme } from '../Common/Colors';
import { LaoQGError } from '../Common/Errors';
import { myServer } from '../Common/Server';
import { iconStyles } from '../Common/Styles';
import { SessionContext, SessionEntity } from './SessionEntity';
import FastImage from 'react-native-fast-image';

interface SessionAreaProps {
  authInfo: AuthInfo,
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
  /** 问答区域布局信息 */
  const QALayoutsRef = useRef<LayoutRectangle[]>([]);
  /** 滚动区域 */
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    return () => { }
  }, []);

  const submitHandler = async () => {
    if (status === Status.ERROR) { props.session.context.pop(); }
    props.session.context.push(new SessionContext(SessionContext.QUESTION, questionText));
    props.updateSession(props.session);
    setQuestionText('');
    setStatus(Status.LOADING);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true, });
    });
    try {
      const data: ChatRes = await chat(props.authInfo, props.session, questionText);
      if (data) {
        props.session.sessionId = data.sessionId;
        props.session.context.push(new SessionContext(SessionContext.ANSWER, data.answer));
        props.updateSession(props.session);
        setStatus(Status.NORMAL);
        requestAnimationFrame(() => {
          if (QALayoutsRef.current.length >= 2) {
            scrollViewRef.current?.scrollTo({ y: QALayoutsRef.current[QALayoutsRef.current.length - 1].y, animated: true, });
          }
        });
      }
    } catch (error) {
      if (error instanceof LaoQGError && error.getStatusCode() < 200) {
        setStatus(Status.WARNING);
      } else if (error instanceof LaoQGError) {
        setStatus(Status.ERROR);
      } else if (error instanceof Error) {
        setStatus(Status.ERROR);
        error = new LaoQGError(900, "ECMRN00", error.message);
      } else {
        setStatus(Status.ERROR);
        error = new LaoQGError(900, "ECMRN00", '未知错误。');
      }
      props.emitError(error as LaoQGError);
    }
  }

  return (
    <View style={styles.container}>
      {/* 聊天记录区域 */}
      <View style={styles.conversationContainer}>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          {props.session.context.map((item, index) => (
            <View
              key={'context' + index}
              style={[
                styles.contextAreaContainer,
                item.flag === SessionContext.QUESTION ? styles.contextAreaContainerQuestion : styles.contextAreaContainerAnswer
              ]}
              // 保存布局信息
              onLayout={(event: LayoutChangeEvent) => { QALayoutsRef.current[index] = event.nativeEvent.layout; }}>
              {status === Status.LOADING && index === props.session.context.length - 1
                ? <FastImage style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/loading.gif")}
                  resizeMode={FastImage.resizeMode.contain} />
                : null}
              {status === Status.ERROR && index === props.session.context.length - 1
                ? <Image style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/error.png")} />
                : null}
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
  contextAreaIcon: {
    marginTop: 5,
    marginRight: 5,
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

const chat = async (authInfo: AuthInfo, session: SessionEntity, question: string): Promise<ChatRes> => {
  // 没有聊天记录先清除sessionId
  if (session.context.length === 0) {
    session.sessionId = null;
  }

  const res = session.sessionId ?
    await Chat({ server: myServer, authInfo: authInfo, sessionId: session.sessionId, question: question }) :
    await StartChat({ server: myServer, authInfo: authInfo, question: question });

  return res;
}
