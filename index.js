/**
 * https://github.com/atmulyana/rn-flex-image
 *
 * The purpose of using this component, we don't need to set width and height of an Image, especially for remote image, but just follows the layout rule
 *
 * @format
 */
import React from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import {extractImageStyle} from 'rn-style-props';

export let DefaultImage = require('./images/default.png');
export let NoImage = require('./images/no-image.png');
try {
    const vars = require('../../rn-flex-image.config');
    if (typeof(vars) == 'object' && vars) {
        if (typeof(vars.DefaultImage) == 'number') DefaultImage = vars.DefaultImage;
        if (typeof(vars.NoImage) == 'number') NoImage = vars.NoImage;
    }
}
catch {
}

const styles = StyleSheet.create({
    imageBoxDefault: {
        justifyContent: 'center',
    },
    imageBox: {
        overflow: 'hidden',
    },
    imageDefault: {
        resizeMode: 'contain',
    },
    image: {
        alignSelf: 'stretch',
        height: undefined,
        width: undefined,
    },
});

/** See the comment for `onLayout` event! */
let updateSize = image => image && image.updateSize(),
    updateSizeContainer = () => {};
if (Platform.OS == 'android') [updateSize, updateSizeContainer] = [updateSizeContainer, updateSize];

const imageStyle = props => ({...styles.image, flex: props.flex ? 1 : 0});

const calculateLength = (actualCalculatedLength, actualBaseLength, baseLength) =>
    actualCalculatedLength / actualBaseLength * baseLength;


class ImageWraper extends React.PureComponent {
    _imageSize = {width: 0, height: 0};
    _lastImageSize = {width: -1, height: -1};

    constructor(props) {
        super(props);
        this.state = imageStyle(props);
    }

    updateSize() {
        const {width, height} = this._imageSize;
        if (width == this._lastImageSize.width && height == this._lastImageSize.height) return;
        this._lastImageSize = this._imageSize;
        const {source} = this.props;
        const newSize = {width, height};

        let baseSide = null;
        {
            const {width, height} = this.state;
            if (width !== undefined && height === undefined) baseSide = 'height';
            else if (width === undefined && height !== undefined) baseSide = 'width';
        }

        const setSize = size => {
            const style = imageStyle(this.props);
            if (baseSide != 'height') {
                style.height = size.height;
                style.flex = 0;
            }
            if (baseSide != 'width') {
                style.width = size.width;
                style.alignSelf = 'center';
            }
            this.setState(style);
        }
        
        const scaleSize = actual => {
            let base = 'width', calculated = 'height';
            if (baseSide == 'height') [base, calculated] = [calculated, base];
            newSize[calculated] = calculateLength(actual[calculated], actual[base], newSize[base]);
            setSize(newSize);
        };

        const getActualSizeSuccess = (width, height) => {
            const actualSize = {width, height};
            if (baseSide) scaleSize(actualSize);
            else setSize(actualSize);
        };
        const getActualSizeError = () => {
            //can't get the actual dimension of image, consider the space height is the same as width
            if (newSize.width < 1) newSize.width = newSize.height;
            else newSize.height = newSize.width;
            setSize(newSize);
        };
        const setNewSize = () => {
            if (typeof(source) == 'object') {
                if (source.headers) {
                    Image.getSizeWithHeaders(source.uri, source.headers, getActualSizeSuccess, getActualSizeError);
                }
                else {
                    Image.getSize(source.uri, getActualSizeSuccess, getActualSizeError);
                }
            }
            else if (typeof(source) == 'number') {
                const {width, height} = Image.resolveAssetSource(source);
                getActualSizeSuccess(width, height);
            }
        };

        if (width > 0 && height > 0) {
            if (baseSide) { //The side that should be 0 has length because of the setting in the previous rendering.
                setNewSize();
            }
            else {
                //Image size follows the layout
            }
        }
        else if (width > 0 || height > 0) { //For remote image in the first rendering, usually one of width or height of space hasn't been known (zero)
                                            //if the `style` doesn't yield complete measure
            baseSide = width > 0 ? 'width' : 'height';
            setNewSize();
        }
        else {
            baseSide = null; //if all sides are 0 then try to set to the actual size
            setNewSize();
        }
    }

    refresh() {
        this._lastImageSize = {width: -1, height: -1};
        this.setState(imageStyle(this.props));
    }

    render() {
        let {flex, style, ...props} = this.props
        style = style.slice(0, 2).concat(this.state);  /** has no border and padding (it will have the true dimension of the Image) */
        return <Image {...props} style={style}
            onLayout={({nativeEvent: {layout}}) => {
                this._imageSize = layout;
                updateSize(this);
            }}
        />;
    }
}

export default class extends React.PureComponent {
    static displayName = "[rn-flex-image component]";
    static propTypes = Image.propTypes;
    static defaultProps = Image.defaultProps;
    
    refresh() {
    }

    render() {
        let body,
            defaultSource,
            height,
            image = null,
            method,
            props,
            source,
            src,
            srcSet,
            style,
            width;
        ({defaultSource, onLayout, source, src, srcSet, style, ...props} = this.props);

        if (src) {
            source = {uri: src};
        }
        else if (typeof(source) == 'object' && source) {
            if (Array.isArray(source)) {
                //to throw error
            }
            else if (!source.uri) {
                source = NoImage;
            }
            else {
                ({body, height, method, width, ...source} = source);
                if (body !== undefined || height !== undefined || method !== undefined || width !== undefined)
                    console.warn("`body`, `height`, `method` and `width` of `source` prop are not supported by `rn-flex-image`");
            }
        }
        else if (typeof(source) != 'number') {
            if (srcSet) source = []; //to throw error
            else source = NoImage;
        }
        
        if (Array.isArray(source)) {
            throw "`rn-flex-image` doesn't support multiple sources.";
        }
        
        if (typeof(defaultSource) == 'undefined') defaultSource = DefaultImage;

        this.refresh = () => {
            if (image) image.refresh();
        }

        style = extractImageStyle(style);
        
        return <View style={[
                styles.imageBoxDefault,
                style.view /** width/height may include border and/or padding */,
                styles.imageBox
            ]}
            onLayout={ev => {
                /**
                 * On Android, We call call `image.updateSize` here, not in `Image` `onLayout` event itself, because if `Image` initially doesn't
                 * have dimension (width and height are zero), it doesn't trigger `onLayout` event. The event is triggered then when its size
                 * changes. The order of event is `Image` `onLayout` event happens before its container's `onLayout` event. On iOS, sometimes the
                 * order is not like that. So, for iOS, calling `image.updateSize` is in `Image` `onLayout` event itself.
                 */
                updateSizeContainer(image);
                typeof(onLayout) == 'function' && onLayout(ev);
            }}>
            <ImageWraper ref={img => image = img} {...props}
                style={[styles.imageDefault, style.image]}
                source={source} defaultSource={defaultSource}
                flex={style.view.flex > 0 || 'height' in style.view}
            />
        </View>;
    }
}