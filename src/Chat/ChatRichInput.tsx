import { AnyNode, Element } from "domhandler";
import { ElementType, parseDocument } from "htmlparser2";
import { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Image as RNImage, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import type { Image } from "react-native-image-crop-picker";
import ImageCropPicker from "react-native-image-crop-picker";
import { IconButton, useTheme } from "react-native-paper";
import { RichEditor } from "react-native-pell-rich-editor";
import uuid from 'react-native-uuid';
import { LaoQGError } from "../Common/Errors";
import LaoQGImage from "../Common/Image";
import { LaoQGProps } from "../Common/Props";
import { iconStyles } from "../Common/Styles";
import { ChatQuestionContent } from "./ChatSessionEntity";

export interface ChatRichInputRef {
  clear: () => void,
}

interface ChatRichInputProps extends LaoQGProps {
  containerStyle?: StyleProp<ViewStyle>,
  sendChatQuestionContents?: (chatQuestionContents: ChatQuestionContent[]) => void,
}

const ChatRichInput = forwardRef<ChatRichInputRef, ChatRichInputProps>((props: ChatRichInputProps, ref: ForwardedRef<ChatRichInputRef>) => {
  /** 主题 */
  const theme = useTheme();
  /** 插入图片的图标Uri */
  const imageIconUri = RNImage.resolveAssetSource(require('../../resources/icons/image.png')).uri;
  /** 初始Html内容 */
  const initialContentHTML = ``;
  /** 展开扩展组件 */
  const [isExtensionsDisplayed, setIsExtensionsDisplayed] = useState<boolean>(false);
  /** 富文本 */
  const [richText, setRichText] = useState<string>(initialContentHTML);
  /** 富文本编辑器 */
  const richEditorRef = useRef<RichEditor>(null);

  // 将 clear 方法暴露给父组件
  useImperativeHandle(ref, () => ({
    clear() {
      richEditorRef.current?.setContentHTML('');
    }
  }));

  const handleMessage = (message: { type: string; id: string; data?: any }) => {
    switch (message.type) {
      case 'ClickImage':
        return handleClickImageMessage(message);
    }
  }

  const handleClickImageMessage = (message: { type: string; id: string; data?: any }) => {
    const imageElement = getImageElementFromHtmlTextById(richText, message.id);
    if (imageElement && imageElement.attribs.image_uri) {
      props.showImage({ uri: imageElement.attribs.image_uri });
    }
  }

  return (
    <View style={props.containerStyle}>
      {/* 扩展组件展开按钮 */}
      <IconButton
        mode='contained'
        style={styles.displayExtensionsButtion}
        onPress={() => { setIsExtensionsDisplayed(!isExtensionsDisplayed); }}
        icon={() => {
          return (
            <LaoQGImage
              style={iconStyles.medium}
              source={isExtensionsDisplayed
                ? require('../../resources/icons/arrow_back_2.png')
                : require('../../resources/icons/arrow_forward_2.png')}
            />
          )
        }} />
      <View style={styles.questionSubContainer}>
        {/* 编辑器主体 */}
        <RichEditor
          style={styles.questionTextArea}
          editorStyle={{ backgroundColor: theme.colors.primaryContainer }}
          ref={richEditorRef}
          onChange={(text) => { setRichText(text); }}
          onMessage={handleMessage}
          initialContentHTML={initialContentHTML}
          placeholder={"提问"} />
        {/* 扩展组件 */}
        <View
          style={[
            styles.questionExtensionsContainer,
            { backgroundColor: theme.colors.primaryContainer },
            isExtensionsDisplayed ? null : { display: 'none' },
          ]}>
          {/* 相机 */}
          <IconButton
            mode='contained'
            icon={() => {
              return (
                <LaoQGImage style={iconStyles.small} source={require('../../resources/icons/camera.png')} />
              )
            }}
            onPress={async () => {
              try {
                const image: Image = await ImageCropPicker.openCamera({
                  mediaType: 'photo',
                  includeBase64: true,
                });
                const imageUri: string = `data:${image.mime};base64,${image.data}`;
                richEditorRef.current?.insertHTML(createImageElement(imageIconUri, imageUri));
              } catch (error) {
                if (error instanceof Error) {
                  if (error.message === 'User cancelled image selection') {
                    props.showError(new LaoQGError(100, "WIMRN00", '已取消拍照。'));
                  } else {
                    props.showError(new LaoQGError(900, "EIMRN00", error.message));
                  }
                } else {
                  props.showError(new LaoQGError(900, "ECMRN00", "未知异常。"));
                }
              }
            }} />
          {/* 图片 */}
          <IconButton
            mode='contained'
            icon={() => {
              return (
                <LaoQGImage style={iconStyles.small} source={require('../../resources/icons/add_image.png')} />
              )
            }}
            onPress={async () => {
              try {
                const image: Image = await ImageCropPicker.openPicker({
                  mediaType: 'photo',
                  includeBase64: true,
                });
                const imageUri: string = `data:${image.mime};base64,${image.data}`;
                richEditorRef.current?.insertHTML(createImageElement(imageIconUri, imageUri));
              } catch (error) {
                if (error instanceof Error) {
                  if (error.message === 'User cancelled image selection') {
                    props.showError(new LaoQGError(100, "WIMRN00", '已取消照片选择。'));
                  } else {
                    props.showError(new LaoQGError(900, "EIMRN00", error.message));
                  }
                } else {
                  props.showError(new LaoQGError(900, "ECMRN00", "未知异常。"));
                }
              }
            }} />
        </View>
      </View>
      {/* 发送按钮 */}
      <IconButton
        mode='contained'
        style={styles.sendButton}
        icon={() => <LaoQGImage style={iconStyles.medium} source={require('../../resources/icons/arrow_forward.png')} />}
        onPress={() => {
          if (props.sendChatQuestionContents) {
            props.sendChatQuestionContents(parseHTMLToChatQuestionContents(richText));
          }
        }} />
    </View>
  )
});

export default ChatRichInput

const styles = StyleSheet.create({
  displayExtensionsButtion: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  questionSubContainer: {
    height: 100,
    flex: 1,
  },
  questionTextArea: {
    height: 100,
    flex: 1,
  },
  sendButton: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  questionExtensionsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
})

const renderChatQuestionContentsToHTML = (chatQuestionContents: ChatQuestionContent[], iconUri: string): string => {
  const childTexts: string[] = [];
  for (const chatQuestionContent of chatQuestionContents) {
    if (chatQuestionContent.type === 'Text') {
      if (chatQuestionContent.text) {
        childTexts.push(createSpanElement(chatQuestionContent.text));
      }
    } else if (chatQuestionContent.type === 'Image') {
      if (chatQuestionContent.imageUrl) {
        childTexts.push(createImageElement(iconUri, chatQuestionContent.imageUrl));
      }
    }
  }

  return childTexts.join('');
}

/**
 * 将HTML转为QuestionContent数组
 * @param htmlText HTML文本
 * @returns QuestionContent数组
 */
const parseHTMLToChatQuestionContents = (htmlText: string): ChatQuestionContent[] => {
  let chatQuestionContents: ChatQuestionContent[] = [];
  const dom = parseDocument(htmlText);
  // 遍历根节点下所有子节点
  for (const child of dom.children) {
    // 将子节点转为QuestionContent数组，并合并到当前的QuestionContent数组中（添加换行符）
    chatQuestionContents = joinChatQuestionContents(chatQuestionContents, parseNodeToChatQuestionContents(child), true);
  }
  return chatQuestionContents;
}

/**
 * 将HTML节点转为QuestionContent数组
 * @param node HTML节点
 * @returns QuestionContent数组
 */
const parseNodeToChatQuestionContents = (node: AnyNode): ChatQuestionContent[] => {
  let chatQuestionContents: ChatQuestionContent[] = [];
  if (node.type === ElementType.Text) {
    // 节点为纯文本
    const chatQuestionContent: ChatQuestionContent = { type: 'Text', text: node.data, };
    chatQuestionContents = joinChatQuestionContents(chatQuestionContents, [chatQuestionContent]);
  } else if (node.type === ElementType.Tag) {
    // 节点为HTML元素
    // 遍历HTML元素下所有子节点
    for (const childNode of node.childNodes) {
      // 将子节点转为QuestionContent数组，并合并到当前的QuestionContent数组中（不添加换行符）
      chatQuestionContents = joinChatQuestionContents(chatQuestionContents, parseNodeToChatQuestionContents(childNode));
    }
    // HTML元素为图片元素
    if (node.name === 'img') {
      const chatQuestionContent: ChatQuestionContent = { type: 'Image', imageUrl: node.attribs.image_uri, };
      chatQuestionContents = joinChatQuestionContents(chatQuestionContents, [chatQuestionContent]);
    }
  }
  return chatQuestionContents;
}

/**
 * 将两个QuestionContent数组合并为一个（数组1尾部和数组2头部的文本合并，并且根据addNewline的值在合并的文本中间插入换行符）
 * @param chatQuestionContents1 待合并数组1
 * @param chatQuestionContents2 待合并数组2
 * @param addNewline 是否添加换行符
 * @returns 合并后的数组
 */
const joinChatQuestionContents = (chatQuestionContents1: ChatQuestionContent[], chatQuestionContents2: ChatQuestionContent[], addNewline?: boolean): ChatQuestionContent[] => {
  if (chatQuestionContents1.length === 0 || chatQuestionContents1.at(-1)?.type !== 'Text' || !chatQuestionContents1.at(-1)?.text ||
    chatQuestionContents2.length === 0 || chatQuestionContents2.at(0)?.type !== 'Text' || !chatQuestionContents2.at(0)?.text) {
    // 数组1或数组2中有一个空数组，或数组1末尾数组2起始的类型不为文本型，则直接合并数组不做特殊处理
    return [...chatQuestionContents1, ...chatQuestionContents2];
  } else {
    // 换行符
    const newLineStr: string = addNewline ? '\n' : '';
    // 数组1尾部和数组2头部的文本合并
    const chatQuestionContent: ChatQuestionContent = { type: 'Text', text: chatQuestionContents1.at(-1)?.text + newLineStr + chatQuestionContents2.at(0)?.text }
    return [...chatQuestionContents1.slice(0, -1), chatQuestionContent, ...chatQuestionContents2.slice(1)];
  }
}

const createSpanElement = (text: string): string => {
  const spanNodeStr: string = `<span>${text}</span>`;
  return spanNodeStr;
}

const createImageElement = (iconUri: string, imageUri: string): string => {
  // 生成随机id
  const imageId: string = uuid.v4() as string;

  // 生成Image标签
  const imageNodeStr: string = `<img
      id="${imageId}"
      src="${iconUri}"
      style="width:30px;height:30px;"
      image_uri="${imageUri}"
      onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ClickImage', id: '${imageId}', }))" />`;
  return imageNodeStr;
}

const getImageElementFromHtmlTextById = (htmlText: string, imageId: string): Element | null => {
  return getImageElementById(parseDocument(htmlText), imageId);
}

const getImageElementById = (node: AnyNode, imageId: string): Element | null => {
  if (node.type === ElementType.Tag) {
    if (node.name === 'img' && node.attribs['id'] === imageId) {
      return node;
    }
    for (const childNode of node.childNodes) {
      const imageElement = getImageElementById(childNode, imageId);
      if (!!imageElement) {
        return imageElement;
      }
    }
  }
  return null;
}