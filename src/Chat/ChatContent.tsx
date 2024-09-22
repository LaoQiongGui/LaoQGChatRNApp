import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import LaoQGImage from '../Common/Image';
import { LaoQGProps } from '../Common/Props';
import { iconStyles } from '../Common/Styles';
import { ChatQuestionContent, SessionContext } from './ChatSessionEntity';

interface ChatContentProps extends LaoQGProps {
  sessionContext: SessionContext,
}

const ChatContent: React.FC<ChatContentProps> = (props: ChatContentProps) => {
  return (
    <Text>{Array.isArray(props.sessionContext)
      ? (props.sessionContext as ChatQuestionContent[]).map((item, index) => {
        if (item.type === 'Text') {
          return item.text;
        } else if (item.type === 'Image') {
          return (
            <LaoQGImage
              key={`ChatContentImage${index}`}
              style={[iconStyles.small]}
              source={require('../../resources/icons/image.png')}
              isFullScreenEnabled={true}
              fullScreenImageSource={{ uri: item.imageUrl }}
              showImage={props.showImage} />
          );
        } else if (item.type === 'Audio') {
          return null;
        } else if (item.type === 'ImageOCR') {
          return null;
        } else {
          return null;
        }
      })
      : props.sessionContext.toString()}</Text>
  );
}

export default ChatContent

const styles = StyleSheet.create({})
