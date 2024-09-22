import { Image as WinImage, ImageProps as WinImageProps } from '@rneui/themed';
import { ImageURISource, Platform, TouchableOpacity, View } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import { ImageSource } from 'react-native-image-viewing/dist/@types';

type UnionImageProps = FastImageProps & WinImageProps;

interface LaoQGImageProps extends UnionImageProps {
  /**
   * 能否全屏展示
   * true：可以点击全屏显示原图
   */
  isFullScreenEnabled?: boolean,

  /**
   * 全屏显示时的图片uri（只有isFullScreenEnabled为true时有效）
   */
  fullScreenImageSource?: ImageURISource,

  /**
   * 
   * @param imageSource 
   * @returns 
   */
  showImage?: (imageSource: ImageSource) => void,
}

const LaoQGImage: React.FC<LaoQGImageProps> = ({ isFullScreenEnabled, fullScreenImageSource, children, ...props }) => {
  // 为缩略图添加点击事件
  if (isFullScreenEnabled) {
    const originalImageSourceTmp: ImageURISource = ((): ImageURISource => {
      if (fullScreenImageSource) {
        // 设置了全屏显示时的图片uri
        return fullScreenImageSource;
      } else if (Array.isArray(props.source)) {
        // 显示的图片是数组则取第一张图
        return props.source[0];
      } else {
        // 显示的图片不是数组
        return props.source as ImageURISource;
      }
    })();

    return (
      <View>
        <TouchableOpacity
          onPress={() => { if (props.showImage) { props.showImage(originalImageSourceTmp); } }}>
          <LaoQGImage {...props}>{children}</LaoQGImage>
        </TouchableOpacity>
      </View>
    )
  }

  if (Platform.OS === 'windows') {
    // windows的图片组件
    return (<WinImage {...props}>{children}</WinImage>);
  } else {
    // android和ios的图片组件
    return (<FastImage {...props}>{children}</FastImage>);
  }
};

export default LaoQGImage
