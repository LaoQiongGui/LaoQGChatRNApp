import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialColors, Transparent } from '../Common/Colors'
import { iconStyles } from '../Common/Styles';

interface SessionTabProps {
  title: string,
  isActive: boolean,
  onCloseBtnClicked: () => void,
}

const SessionTab: React.FC<SessionTabProps> = (props: SessionTabProps) => {
  return (
    <View style={[styles.container, props.isActive ? styles.containerActive : styles.containerInactive]}>
      <View style={styles.title}>
        <Text style={styles.titleContext}>{props.title}</Text>
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
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  containerActive: {
    backgroundColor: MaterialColors[2],
  },
  containerInactive: {
    backgroundColor: MaterialColors[1],
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Transparent,
    paddingLeft: 10,
  },
  titleContext: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteBtn: {},
})