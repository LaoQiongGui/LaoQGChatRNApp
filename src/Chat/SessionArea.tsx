import { Image } from '@rneui/themed';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { AuthInfo } from '../Account/AuthEntity';
import { Chat, ChatRes } from '../APIs/Chat';
import { StartChat } from '../APIs/StartChat';
import { CustomTheme } from '../Common/Colors';
import { LaoQGError } from '../Common/Errors';
import { myServer } from '../Common/Server';
import { iconStyles, windowsStyles } from '../Common/Styles';
import { DialogProps } from '../Interfaces/Dialog';
import { SessionContext, SessionEntity } from './SessionEntity';

interface SessionAreaProps {
  authInfo: AuthInfo,
  session: SessionEntity,
  updateSession: () => void,
  emitDialog: (dialogProps: DialogProps) => void,
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

  const submitHandler = async (questionTextIn: string = questionText) => {
    // 提问内容为空或处于加载状态直接返回
    if (!questionTextIn || status === Status.LOADING) { return; }

    // 去除上一条发送失败的信息
    if (status === Status.ERROR) { props.session.context.pop(); }

    props.session.context.push(new SessionContext(SessionContext.QUESTION, questionTextIn));
    props.updateSession();
    setQuestionText('');

    // 切换为加载状态
    setStatus(Status.LOADING);

    // 滚动到最新的提问
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd();
    });

    // 发送请求
    try {
      const data: ChatRes = await chat(props.authInfo, props.session, questionTextIn);
      if (data) {
        props.session.sessionId = data.sessionId;
        props.session.context.push(new SessionContext(SessionContext.ANSWER, data.answer));
        props.updateSession();
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
                ? <Image style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/loading.gif")} />
                : null}
              {status === Status.ERROR && index === props.session.context.length - 1
                ? <TouchableOpacity onPress={() => {
                  props.emitDialog({
                    title: '提示',
                    context: '是否重新发送该消息？',
                    actions: [
                      {
                        text: '确认', pressHandler: (setDialogProps) => {
                          // 再次发送消息
                          const questionTextTmp = props.session.context[props.session.context.length - 1].content;
                          if (!!questionTextTmp) { submitHandler(questionTextTmp); }

                          // 隐藏对话框
                          setDialogProps(null);
                        }
                      },
                      {
                        text: '取消', pressHandler: (setDialogProps) => {
                          // 隐藏对话框
                          setDialogProps(null);
                        }
                      },
                    ],
                  });
                }}><Image style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/error.png")} /></TouchableOpacity>
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
        contentStyle={Platform.OS === 'windows' ? windowsStyles.input : null}
        multiline={true}
        value={questionText}
        onChangeText={setQuestionText}
        scrollEnabled={true}
        right={
          <TextInput.Icon
            style={styles.sendButton}
            onPress={() => { submitHandler(); }}
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
