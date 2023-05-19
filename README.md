# **rn-flex-image**

This is a React Native component to display an image. It's an alternative component for `Image` component. The main difference of this component
from `Image` component is when displaying a remote image, this component still displays the image even if the layout cannot determine one or
both of the width and the height of the image. In this case, `Image` component will display no image. For further information, see the
**Example** section.

## **How to install this package**

Because this is a React Native component, you must install it on a React Native project. Beside that, you must also install `rn-style-props`
package. You may use the console command below:

    npm i rn-style-props rn-flex-image

## **Example**

```javascript
import React from 'react';
import {SafeAreaView, StyleSheet, View, Image} from 'react-native';
import FlexImage, {DefaultImage, NoImage} from 'rn-flex-image';

export default () => {
    return <SafeAreaView style={styles.main}>
        <View style={styles.view}>
            <FlexImage
                source={source}
                defaultSource={DefaultImage}
                style={styles.image}
            />
        </View>
        <View style={[styles.view, {backgroundColor: '#ccc'}]}>
            <Image
                source={source}
                defaultSource={DefaultImage}
                style={styles.image}
            />
        </View>
    </SafeAreaView>;
}
const source = { uri: 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/47/static/media/react-native-logo.79778b9e.png' };
const styles = StyleSheet.create({
    main: {
        alignItems: 'stretch',
        alignSelf: 'stretch', 
        backgroundColor: 'red',
        flex: 1
    },
    image: {
        alignSelf: 'stretch',
        backgroundColor: 'yellow',
        flex: 1,
        resizeMode: 'contain',
        //borderWidth: 2,
        //padding: 2,
    },
    view: {
        alignItems: 'center',
        backgroundColor: 'gray',
        flex: 1,
        justifyContent: 'center',
        overflow: 'hidden',
    },
});
```

In the example above, if you remove `alignSelf` and/or `flex` prop from `styles.image` then `Image` component won't dsplay an image whereas
`FlexImage` will still does. Beside that, if you change the `source` to a local image then `Image` component will dispaly the image with
original size whereas the `FlexImage` will stretch the image. Another difference, `border` and `padding` look having more effect when using
`FlexImage`.

## **Config**

`rn-flex-image` package includes two local images. The first one is used when you don't set any source for the image and the second one is
used for `defaultSource` prop if you don't set it. These local image can be altered via the package configuration.   
   
When you install this package, the config file named `rn-flex-image.config.js` will be created automatically in the top directory of the project.
If the config file doesn't exist, you must create it to avoid an error happens. In the config file you can specify the image configurations like
below:

```javascript
module.exports = {
    NoImage: require('./images/no-image.png'),
    DefaultImage: require('./images/default-image.png'),
};
```

## **Multiple sources**

This component doesn't support multiple sources of image. If you only set multiple sources for image such as only setting `srcSet` prop or
only setting `source` prop as an array, an error will happen. However, if you set `srcSet` and `src` prop then `src` prop will be used and
`srcSet` prop will be ignored.