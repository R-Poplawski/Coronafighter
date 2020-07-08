import 'react-native-gesture-handler';
import React, { PureComponent } from "react";
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import StartScreen from "./StartScreen";
import Game from "./Game";
import HighScoresScreen from "./HighScoresScreen";
import Database from './Database';
 
const Stack = createStackNavigator();
global.database = new Database();

export default class Coronafighter extends PureComponent {
  constructor() {
    super();
    database.initDB();
  }

  render() {        
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="StartScreen" headerMode="none">
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="Game" component={Game} />
          <Stack.Screen name="HighScoresScreen" component={HighScoresScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
