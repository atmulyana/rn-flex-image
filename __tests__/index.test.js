/**
 * https://github.com/atmulyana/rn-flex-image
 * @format
 */
const mockSize = {width: 200, height: 100},
      imageSrc = 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/47/static/media/react-native-logo.79778b9e.png',
      {image: imageStyle} = StyleSheet.create({
        image: {
            borderWidth: 2,
            flex: 1,
            overflow: 'visible',
            padding: 3,
            resizeMode: 'stretch',
        },
      });

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Image.getSize = (uri, succesCallback) => {
        const {width, height} = mockSize;
        succesCallback && succesCallback(width, height);
    };
    return RN;
});
    
import Renderer from 'react-test-renderer';
import {Image, StyleSheet, View} from 'react-native';
import FlexImage, {DefaultImage, NoImage} from '../index';

test('render default', () => {
    let renderer;
    Renderer.act(() => {
        renderer = Renderer.create(<FlexImage />);
    });

    const image = renderer.root.findByType(Image);
    const style = StyleSheet.flatten(image.props.style);
    expect(style).toStrictEqual({
        alignSelf: 'stretch',
        flex: 0,
        height: undefined,
        resizeMode: 'contain',
        width: undefined,
    });
    expect(image.props.source).toBe(NoImage);
    expect(image.props.defaultSource).toBe(DefaultImage);
});

test('render non default', () => {
    let renderer;
    Renderer.act(() => {
        renderer = Renderer.create(<FlexImage style={imageStyle} src={imageSrc} defaultSource={NoImage} />);
    });

    const containerView = renderer.root.findByType(View);
    const image = containerView.findByType(Image);
    expect(
        StyleSheet.flatten(containerView.props.style)
    ).toStrictEqual({
        borderWidth: 2,
        flex: 1,
        justifyContent: "center",
        overflow: 'hidden',
        padding: 3,
    });
    expect(
        StyleSheet.flatten(image.props.style)
    ).toStrictEqual({
        alignSelf: 'stretch',
        flex: 1,
        height: undefined,
        resizeMode: 'stretch',
        width: undefined,
    });
    expect(image.props.source).toEqual({uri: imageSrc});
    expect(image.props.defaultSource).toBe(NoImage);
});

test('onLayout', () => {
    let renderer, width, height;
    Renderer.act(() => {
        renderer = Renderer.create(<FlexImage style={imageStyle} src={imageSrc} />);
    });
    const image = renderer.root.findByType(Image);

    width = 25; height = 25;
    Renderer.act(() => {
        image.props.onLayout({nativeEvent: { layout: {width, height} }});
    });
    expect(
        StyleSheet.flatten(image.props.style)
    ).toStrictEqual({
        alignSelf: 'stretch',
        flex: 1,
        height: undefined,
        resizeMode: 'stretch',
        width: undefined,
    });

    width = 100; height = 0;
    Renderer.act(() => {
        image.props.onLayout({nativeEvent: { layout: {width, height} }});
    });
    expect(
        StyleSheet.flatten(image.props.style)
    ).toStrictEqual({
        alignSelf: 'stretch',
        flex: 0,
        height: 50, // == mockSize.height / mockSize.width * width
        resizeMode: 'stretch',
        width: undefined,
    });

    width = 0; height = 75;
    Renderer.act(() => {
        image.props.onLayout({nativeEvent: { layout: {width, height} }});
    });
    expect(
        StyleSheet.flatten(image.props.style)
    ).toStrictEqual({
        alignSelf: 'center',
        flex: 1,
        height: undefined,
        resizeMode: 'stretch',
        width: 150, // == mockSize.width / mockSize.height * height
    });

    width = 0; height = 0;
    Renderer.act(() => {
        image.props.onLayout({nativeEvent: { layout: {width, height} }});
    });
    expect(
        StyleSheet.flatten(image.props.style)
    ).toStrictEqual({
        alignSelf: 'center',
        flex: 0,
        height: 100, // == mockSize.height
        resizeMode: 'stretch',
        width: 200, // == mockSize.width
    });
});