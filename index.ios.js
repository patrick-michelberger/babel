import React, {Component} from 'react';
import {
    AppRegistry,
    Dimensions,
    StyleSheet,
    TouchableHighlight,
    Text,
    Image,
    View,
    Button,
    TabBarIOS,
    AlertIOS
} from 'react-native';

import Camera from 'react-native-camera';
import Swiper from 'react-native-swiper';
import Speech from 'react-native-speech';
import Icon from 'react-native-vector-icons/Ionicons';

import {annotate} from './shared/vision';
import translate from './shared/translate';

export default class babel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            translation: false,
            isLoading: false,
            annotations: [],
            image: false,
            showImage: false
        };
    }

    render() {
        return (
            <View style={styles.container}>

                {this.state.image && this.state.showImage
                    ? <Image source={{
                            isStatic: true,
                            uri: 'data:image/jpeg;base64,' + this.state.image
                        }} style={{
                            height: Dimensions.get('window').height - 50,
                            width: Dimensions.get('window').width
                        }}>
                            <View style={styles.translationContainer}>
                                {this.renderLabels()}
                            </View>
                        </Image>
                    : <Camera captureTarget={Camera.constants.CaptureTarget.memory} ref={(cam) => {
                        this.camera = cam;
                    }} style={styles.preview} aspect={Camera.constants.Aspect.fill}>
                        <View style={styles.translationContainer}>
                            {this.renderLabels()}
                        </View>
                    </Camera>
}
                <TabBarIOS>

                    {this.state.annotations && this.state.annotations[0] && this.state.annotations[0].translation
                        ? <Icon.TabBarItem title="clear" iconName="ios-close" onPress={this.clear.bind(this)} selectedIconName="ios-close-outline"></Icon.TabBarItem>
                        : null}

                    {this.state.annotations && this.state.annotations[0] && this.state.annotations[0].translation && !this.state.showImage
                        ? <Icon.TabBarItem title="show image" iconName="ios-image" onPress={this.showImage.bind(this)} selectedIconName="ios-image-outline"></Icon.TabBarItem>
                        : null}

                    {this.state.annotations && this.state.annotations[0] && this.state.annotations[0].translation && this.state.showImage
                        ? <Icon.TabBarItem title="save image" iconName="ios-image" onPress={this.saveImage.bind(this)} selectedIconName="ios-image-outline"></Icon.TabBarItem>
                        : null}

                    {this.state.isLoading && this.state.annotations && !this.state.annotations[0]
                        ? <Icon.TabBarItem title="one moment" iconName="ios-alarm" onPress={this.clear.bind(this)} selectedIconName="ios-alarm-outline"></Icon.TabBarItem>
                        : null}

                    {this.state.annotations && !this.state.annotations[0] && !this.state.isLoading
                        ? <Icon.TabBarItem title="camera" iconName="ios-camera" onPress={this.takePicture.bind(this)} selectedIconName="ios-camera"></Icon.TabBarItem>
                        : null}

                </TabBarIOS>
            </View>
        );
    }

    clear() {
        this.setState({translation: false, annotations: [], isLoading: false, image: false, showImage: false});
    }

    showImage() {
        this.setState({showImage: true});
    }

    saveImage() {
        AlertIOS.prompt('Save Image');
    }

    renderLabels() {
        const slides = this.state.annotations.map((annotation, index) => {
            const score = Math.round(annotation.score * 100);
            return (
                <View style={styles.slide1}>
                    <Text style={styles.text}>{annotation.description}</Text>
                    <Text style={styles.text}>{score}%</Text>
                    <Text style={styles.text}>{annotation.translation}</Text>
                    <Icon name="ios-musical-notes" style={styles.pronounce} size={56} onPress={this.pronounce.bind(this, index)} color="#4F8EF7"/>
                </View>
            );
        });

        return (
            <Swiper style={styles.wrapper} showsButtons={true}>
                {slides}
            </Swiper>
        );
    }

    pronounce(index) {
        const term = this.state.annotations[index].translation;

        if (term) {
            Speech.speak({text: term, voice: 'it-IT'});
        }
    }

    takePicture() {
        this.setState({isLoading: true});

        this.camera.capture().then((data) => {

            // save image to current state
            this.setState({image: data.data});

            return annotate(data.data).then((annotations) => {
                this.setState({annotations: annotations});

                annotations.forEach((annotation, index) => {
                    if (annotation && annotation.description) {
                        translate(annotation.description).then((translation) => {

                            this.setState({
                                annotations: [
                                    ...this.state.annotations.slice(0, index), {
                                        ...this.state.annotations[index],
                                        translation
                                    },
                                    ...this.state.annotations.slice(index + 1)
                                ]
                            });
                        });
                    }
                });
            }).catch((error) => {
                console.log("Error uploading file: ", error);
                this.setState({isLoading: false});
            });
        }).catch(err => console.error(err));
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    translationContainer: {
        height: 50,
        width: 250
    },
    preview: {
        height: Dimensions.get('window').height - 50,
        width: Dimensions.get('window').width
    },
    clear: {
        backgroundColor: '#fff',
        borderRadius: 5,
        color: '#000',
        padding: 10,
        margin: 40,
        fontSize: 31
    },
    capture: {
        backgroundColor: '#fff',
        borderRadius: 5,
        color: '#000',
        padding: 10,
        margin: 40,
        marginBottom: 40
    },
    base64: {
        flex: 1,
        resizeMode: 'contain'
    },
    wrapper: {
        flexDirection: 'row'
    },
    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0)'
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0)'
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0)'
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 5
    },
    pronounce: {
        marginTop: 20
    }
});

AppRegistry.registerComponent('babel', () => babel);
