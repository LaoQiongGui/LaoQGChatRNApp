import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialColors, Transparent } from '../Common/Colors'
import { iconStyles } from '../Common/Styles';

interface SessionTabProps {
  title: string,
  onCloseBtnClicked: () => void,
}

const SessionTab: React.FC<SessionTabProps> = (props: SessionTabProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text>{props.title}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={props.onCloseBtnClicked}>
        <Image
          style={iconStyles.medium}
          source={require("../../resources/icons/close.png")}
        />
      </TouchableOpacity>
    </View>
  )
}

export default SessionTab

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: MaterialColors[1],
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Transparent,
    paddingLeft: 10,
    fontSize: 18,
  },
  deleteBtn: {},
})