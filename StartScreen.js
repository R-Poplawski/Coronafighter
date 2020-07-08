import React, { Component } from 'react';
import { Text, Button, View, StyleSheet, BackHandler } from 'react-native';

export default class StartScreen extends Component {
constructor(props) {
    super(props);
    this.state = {

    };
    this.navigation = props.navigation;
  }

  render() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>CORONAFIGHTER</Text>
      <View style={styles.buttonContainer}>
        <Button style={styles.button}
          onPress={ () => this.navigation.navigate("Game") }
          title="Play" />
        <View style={styles.space}></View>
        <Button style={styles.button}
          onPress={ () => this.navigation.navigate("HighScoresScreen") }
          title="High Scores" />
        <View style={styles.space}></View>
        <Button style={styles.button}
          onPress={ () => BackHandler.exitApp() }
          title="Quit" />
      </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    //flexDirection: 'column', 
    //justifyContent: 'flex-start',
    margin: 15,
    alignItems: 'stretch'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 15,
    //padding: 15
    //alignItems: 'center',
  },
  button: {
    //alignItems: "stretch",
    padding: 10,
    margin: 15,
  },
  titleText: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: "bold",
    padding: 5,
    marginTop: 50
  },
  space: {
    padding: 10
  }
});