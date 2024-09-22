import { Element } from 'domhandler';
import { ElementType, parseDocument } from 'htmlparser2';
import React, { useRef, useState } from 'react';
import { Image as RNImage, StyleSheet, View } from 'react-native';
import ImageCropPicker, { Image } from 'react-native-image-crop-picker';
import { Button, Text } from 'react-native-paper';
import { RichEditor } from 'react-native-pell-rich-editor';
import uuid from 'react-native-uuid';
import { ChatQuestionContent } from '../Chat/ChatSessionEntity';
import { LaoQGProps } from '../Common/Props';

export interface TestProps extends LaoQGProps {
}

const Test: React.FC<TestProps> = (props: TestProps) => {
  const chatQuestionContents: ChatQuestionContent[] = [
    {
      type: 'Text',
      text: '测试文本0001',
    },
  ];
  /** 插入图片的图标Uri */
  const imageIconUri = RNImage.resolveAssetSource(require('../../resources/icons/image.png')).uri;
  /** 富文本 */
  const [richText, setRichText] = useState<string>('');
  /** 富文本编辑器 */
  const richEditorRef = useRef<RichEditor>(null);

  const handleMessage = (message: { type: string; id: string; data?: any }) => {
    if (message.type === 'ClickImage') {
      console.log(message.id);
      const imageElement = getImageElementById(richText, message.id);
      if (imageElement && imageElement.attribs.image_uri) {
        props.showImage({ uri: imageElement.attribs.image_uri });
      }
    }
  }

  return (
    <View>
      <RichEditor
        ref={richEditorRef}
        onChange={(text) => { setRichText(text); }}
        onMessage={handleMessage}
        initialContentHTML={renderChatQuestionContentsToHTML(chatQuestionContents, imageIconUri)} />
      <View
        style={styles.editButtonsContainer}>
        <Button
          mode='contained'
          style={styles.insertImageBtn}
          onPress={async () => {
            try {
              const image: Image = await ImageCropPicker.openPicker({
                mediaType: 'photo',
                includeBase64: true,
              });
              const imageUri: string = `data:${image.mime};base64,${image.data}`;
              richEditorRef.current?.insertHTML(createImageElement(imageIconUri, imageUri));
            } catch (error) {
              console.log(error);
            }
          }}>
          <Text style={styles.insertImageText}>Insert Image</Text>
        </Button>
        <Button
          mode='contained'
          style={styles.getHtmlBtn}
          onPress={() => {
            parseHTMLToChatQuestionContents(richText);
          }}>
          <Text style={styles.getHtmlText}>Get HTML</Text>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  editButtonsContainer: {},
  insertImageBtn: {
    marginTop: 20,
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insertImageText: {
    width: '80%',
    fontSize: 18,
    fontWeight: 'bold',
  },
  getHtmlBtn: {
    marginTop: 20,
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getHtmlText: {
    width: '80%',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default Test

const renderChatQuestionContentsToHTML = (chatQuestionContents: ChatQuestionContent[], iconUri: string): string => {
  const htmlTexts: string[] = [];
  for (const chatQuestionContent of chatQuestionContents) {
    if (chatQuestionContent.type === 'Text') {
      if (chatQuestionContent.text) {
        htmlTexts.push(chatQuestionContent.text);
      }
    } else if (chatQuestionContent.type === 'Image') {
      if (chatQuestionContent.imageUrl) {
        htmlTexts.push(createImageElement(iconUri, chatQuestionContent.imageUrl));
      }
    }
  }
  return htmlTexts.join('');
}

const parseHTMLToChatQuestionContents = (htmlText: string): ChatQuestionContent[] => {
  const chatQuestionContents: ChatQuestionContent[] = [];
  const dom = parseDocument(htmlText);
  for (const child of dom.children) {
    if (child.type === ElementType.Text) {
      chatQuestionContents.push({
        type: 'Text',
        text: child.data,
      });
    } else if (child.type === ElementType.Tag && child.name === 'img') {
      chatQuestionContents.push({
        type: 'Image',
        imageUrl: child.attribs.image_uri,
      });
    }
  }

  console.log(chatQuestionContents);
  return chatQuestionContents
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

const getImageElementById = (htmlText: string, imageId: string): Element | null => {
  const dom = parseDocument(htmlText);
  for (const child of dom.children) {
    if (child.type === ElementType.Tag && child.name === 'img' && child.attribs['id'] === imageId) {
      return child
    }
  }
  return null
}
