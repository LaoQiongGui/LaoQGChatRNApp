import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AuthInfo } from '../Account/AuthEntity';
import { Chat, ChatRes } from '../APIs/Chat';
import { StartChat } from '../APIs/StartChat';
import { CustomTheme } from '../Common/Colors';
import { LaoQGError } from '../Common/Errors';
import LaoQGImage from '../Common/Image';
import { LaoQGProps } from '../Common/Props';
import { myServer } from '../Common/Server';
import { iconStyles } from '../Common/Styles';
import ChatContent from './ChatContent';
import ChatRichInput, { ChatRichInputRef } from './ChatRichInput';
import { ChatQuestionContent, ChatSessionEntity } from './ChatSessionEntity';

interface ChatSessionProps extends LaoQGProps {
  authInfo: AuthInfo,
  session: ChatSessionEntity,
  updateSession: () => void,
}

enum Status {
  NORMAL, WARNING, ERROR, LOADING,
}

const ChatSession: React.FC<ChatSessionProps> = (props: ChatSessionProps) => {
  /** 页面状态 */
  const [status, setStatus] = useState<Status>(Status.NORMAL);
  /** 问答区域布局 */
  const [contextAreaContainerLayouts, setContextAreaContainerLayouts] = useState<LayoutRectangle[]>([]);
  /** 滚动区域 */
  const scrollViewRef = useRef<ScrollView>(null);
  /** 提问输入框 */
  const chatRichInputRef = useRef<ChatRichInputRef>(null);

  const submit = async (chatQuestionContents: ChatQuestionContent[]) => {
    // 提问内容为空或处于加载状态直接返回
    if (!chatQuestionContents || chatQuestionContents.length === 0 || status === Status.LOADING) { return; }

    // 去除上一条发送失败的信息
    if (status === Status.ERROR) { props.session.contexts.pop(); }

    // 将提问加入聊天内容中
    props.session.contexts.push({ type: 'question', contents: chatQuestionContents });

    // 更新视图
    props.updateSession();

    // 清空提问内容
    chatRichInputRef.current?.clear();

    // 切换为加载状态
    setStatus(Status.LOADING);

    // 滚动到最新的提问
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd();
    });

    // 发送请求
    try {
      const data: ChatRes = await chat(props.authInfo, props.session, chatQuestionContents);
      if (data) {
        props.session.sessionId = data.sessionId;

        // 将回答加入聊天内容中
        props.session.contexts.push({ type: 'answer', contents: data.answer });

        // 更新视图
        props.updateSession();

        setStatus(Status.NORMAL);
        requestAnimationFrame(() => {
          if (contextAreaContainerLayouts.length >= 2) {
            scrollViewRef.current?.scrollTo({ y: contextAreaContainerLayouts[contextAreaContainerLayouts.length - 1].y, animated: true, });
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
      props.showError(error as LaoQGError);
    }
  }

  return (
    <View style={styles.container}>
      {/* 聊天记录区域 */}
      <View style={styles.conversationContainer}>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          {props.session.contexts.map((item, index) => (
            <View
              key={'context' + index}
              style={[
                styles.contextAreaContainer,
                item.type === 'question' ? styles.contextAreaContainerQuestion : styles.contextAreaContainerAnswer
              ]}
              // 保存布局信息
              onLayout={(event: LayoutChangeEvent) => {
                const layoutTmp = event.nativeEvent.layout;
                setContextAreaContainerLayouts(
                  (contextAreaContainerLayouts) => {
                    const contextAreaContainerLayoutsTmp = [...contextAreaContainerLayouts];
                    for (let i = index; i < contextAreaContainerLayoutsTmp.length; i++) {
                      contextAreaContainerLayoutsTmp.push({ x: 0, y: 0, width: 0, height: 0, });
                    }
                    contextAreaContainerLayoutsTmp[index] = layoutTmp;
                    return contextAreaContainerLayoutsTmp;
                  }
                );
              }}>
              {/* 加载图标 */}
              {status === Status.LOADING && index === props.session.contexts.length - 1
                ? <LaoQGImage
                  style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/loading.gif")} />
                : null}
              {/* 警告图标 */}
              {status === Status.ERROR && index === props.session.contexts.length - 1
                ? <TouchableOpacity onPress={() => {
                  props.showDialog({
                    title: '提示',
                    context: '是否重新发送该消息？',
                    actions: [
                      {
                        text: '确认', pressHandler: (setDialogProps) => {
                          // 再次发送消息
                          if (props.session.contexts[props.session.contexts.length - 1].type === 'question') {
                            const questionTextTmp = props.session.contexts[props.session.contexts.length - 1].contents;
                            submit(questionTextTmp as ChatQuestionContent[]);
                          }

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
                }}><LaoQGImage style={[iconStyles.medium, styles.contextAreaIcon]}
                  source={require("../../resources/icons/error.png")} /></TouchableOpacity>
                : null}
              <View
                style={[
                  styles.contextArea,
                  item.type === 'question' ? styles.contextAreaQuestion : styles.contextAreaAnswer
                ]}>
                <ChatContent sessionContext={item} showImage={props.showImage} showDialog={props.showDialog} showError={props.showError} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* 提问区域 */}
      <ChatRichInput
        containerStyle={styles.questionContainer}
        ref={chatRichInputRef}
        showImage={props.showImage}
        showDialog={props.showDialog}
        showError={props.showError}
        sendChatQuestionContents={submit} />
    </View>
  )
}

export default ChatSession

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
  questionContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: CustomTheme.colors.primaryContainer,
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

const chat = async (authInfo: AuthInfo, session: ChatSessionEntity, questionContents: ChatQuestionContent[]): Promise<ChatRes> => {
  // 没有聊天记录先清除sessionId
  if (session.contexts.length === 0) {
    session.sessionId = null;
  }

  const res = session.sessionId ?
    await Chat({ server: myServer, authInfo: authInfo, sessionId: session.sessionId, questionContents: questionContents }) :
    await StartChat({ server: myServer, authInfo: authInfo, questionContents: questionContents });

  return res;
}
