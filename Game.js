import React, { Component } from 'react';
import { Dimensions, StyleSheet } from "react-native";
import { GameEngine } from "react-native-game-engine";
import DialogInput from 'react-native-dialog-input';
import { Virus, Virus2, Background, Fighter, LivesCounter, PointsCounter, Health, ShieldBonus, Boss } from "./renderers";
import { MoveFighter, VirusController, Fire, HealthSpawner, ShieldBonusController, BossController } from "./systems";

global.renderers = [];
global.nextEntityId = 16;
global.screenWidth = Math.round(Dimensions.get('window').width);
global.screenHeight = Math.round(Dimensions.get('window').height);
global.score = 0;
global.killedViruses = 0;
global.bossFight = false;
global.gameEngine = null;

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDialogVisible: false
    };
    this.navigation = props.navigation;
  }

  getInitialEntities() {
    var entities = {};
    entities[1] = { id: 1, type: 'b', position: [40,  200], renderer: Background };
    entities[2] = { id: 2, type: 'f', position: [screenWidth/2-64, screenHeight-180], hit: 0, shield: 0, renderer: Fighter };
    entities[3] = { id: 3, type: 'v', position: [10, 0], renderer: Virus};
    entities[4] = { id: 4, type: 'v', position: [20, 0], renderer: Virus};
    entities[5] = { id: 5, type: 'v', position: [40, 0], renderer: Virus};
    entities[6] = { id: 6, type: 'h', position: [0, 0], renderer: Health};
    entities[7] = { id: 7, type: 'boss', position: [0, -300], renderer: Boss}
    entities[8] = { id: 8, type: 'l', position: [0, 0], lives: 3, renderer: LivesCounter};
    entities[9] = { id: 9, type: 'p', position: [0, 0], points: 0, renderer: PointsCounter};
    entities[10] = { id: 10, type: 'sb', position: [-60, -60], renderer: ShieldBonus };
    entities[11] = { id: 11, type: 'v2', position: [-100, -100], endX: -100, endY: -100, hit: 0, renderer: Virus2 }
    entities[12] = { id: 12, type: 'v2', position: [-100, -100], endX: -100, endY: -100, hit: 0, renderer: Virus2 }
    entities[13] = { id: 13, type: 'v2', position: [-100, -100], endX: -100, endY: -100, hit: 0, renderer: Virus2 }
    entities[14] = { id: 14, type: 'v2', position: [-100, -100], endX: -100, endY: -100, hit: 0, renderer: Virus2 }
    entities[15] = { id: 15, type: 'v2', position: [-100, -100], endX: -100, endY: -100, hit: 0, renderer: Virus2 }
    return entities;
  }

  onEvent = (e) => {
    if (e.type === "game-over") {
      gameEngine.stop();
      this.setState({
        isDialogVisible: true
      });
  }}

  saveScore(nickname) {
    this.setState({ isDialogVisible: false });
    database.addHighScore(nickname, score);
    this.exit();
  }

  exit() {
    score = 0;
    killedViruses = 0;
    nextEntityId = 16;
    bossFight = false;
    if (this.state.isDialogVisible) this.setState({ isDialogVisible: false });
    this.props.navigation.goBack(null);
  }
  
  render() {
    const entities = this.getInitialEntities();
    return (
      <GameEngine
        ref={(ref) => { gameEngine = ref; }}
        onEvent={this.onEvent}
        style={styles.container}
        systems={[MoveFighter, VirusController, Fire, HealthSpawner, ShieldBonusController, BossController]}
        entities={entities}>
          <DialogInput isDialogVisible={this.state.isDialogVisible}
              title={"Game Over"}
              message={"Score: " + score}
              hintInput ={"Enter your nickname"}
              submitInput={ (inputText) => { this.saveScore(inputText) } }
              closeDialog={ () => { this.exit() }}>
          </DialogInput>
      </GameEngine>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  }
});
