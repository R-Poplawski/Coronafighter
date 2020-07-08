import React, { PureComponent } from "react";
import { View, Animated, Easing, Image, AppState, Text } from "react-native";
import SpriteSheet from 'rn-sprite-sheet';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

class Fighter extends PureComponent {
  
  constructor(props) {
    super(props);
    renderers[this.props.id] = this;
    this.isAnimating = false;
    this.x = props.position[0];
    this.y = props.position[1];
    this.hit = 0;
    this.shield = 0;
    this.state = {
      appState: AppState.currentState,
      subscription: null
    };
    setUpdateIntervalForType(SensorTypes.accelerometer, 16);
  }

  move = (dx, dy) => {
    this.x += 2 * dx;
    if (this.x + 64 < 0) this.x = -64;
    else if (this.x + 64 > screenWidth) this.x = screenWidth - 64;
  };

  play = type => {
    this.isAnimating = true;
    this.mummy.play({
      type,
      fps: 24,
      loop: true,
      resetAfterFinish: true
    });
  };
  
  stop = () => {
    this.mummy.stop();
  };
  
  render() {
    const x = this.x;
    const y = this.y;

    var img;
    if (this.props.shield) img = require('./images/fighter_shielded.png');
    else if (this.props.hit) img = require('./images/fighter_hit.png');
    else img = require('./images/fighter.png');
     
    return (
      <View 
        style={{
          overflow: "hidden",
          width: screenWidth,
          height: screenHeight,
          position: "absolute",
          left: x,
          top: y }}
      >
        <SpriteSheet
          ref={ref => (this.mummy = ref)}
          source={img}
          columns={8}
          rows={1} 
          height={192}
          imageStyle={{ 
            marginTop: -1, 
            left: 0,
            top: 0 
          }}
          animations={{
            idle: [0, 1, 2, 3, 4, 5, 6, 7]
          }}                                
        />
      </View>
    );
  }

  accelerometerSubscribe() {
    if (this.state.subscription == null) {
      this.state.subscription = accelerometer.subscribe(({ x, y, z, timestamp }) => {
        this.move(-x, y);
      });
    }
  }

  accelerometerUnsubscribe() {
    if (this.state.subscription) {
      this.state.subscription.unsubscribe();
      this.state.subscription = null;
    }
  }

  componentDidMount() {
    this.accelerometerSubscribe();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    this.accelerometerUnsubscribe();
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState === 'active' && nextAppState.match(/inactive|background/))
      this.accelerometerUnsubscribe();
    else if (this.state.appState.match(/inactive|background/) && nextAppState == 'active')
      this.accelerometerSubscribe();
    this.setState({appState: nextAppState});
  }
}

class Virus extends PureComponent {
  
  constructor(props) {
    super(props);
    
    renderers[this.props.id] = this; 
    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({value}) => this._animatedValue = value); 
    this.isMoving = false;
    this.width = 70;
    this.height = 70;
  }	
    
  play = (delay) => {
    this.animatedValue.setValue(0);
    this.isMoving = true;
        
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start((res) => {
      this.isMoving = false;
    });  
  }
    
  render() {
    const x = this.props.position[0];
    const y = this.props.position[1];
    
    var img;
    if (this.props.hit)
      img = require('./images/explosion.png');
    else
      img = require('./images/virus.png');
      
    return (
       
      <Animated.View 
        style={{
          overflow: "hidden",
          width: this.width,
          height: this.height,
          position: "absolute",
          transform: [ { translateX: x}, 
                       { translateY: this.animatedValue.interpolate({
                    inputRange:  [0, 1],             
                    outputRange: [-this.height, screenHeight]}) } ]
        }}
      >
     
     <Image
        style={{
          height: this.height,
          width: this.width,
          top: 0,
          left: 0,
          resizeMode: 'stretch'
        }}
        source={img}
      />
        
      </Animated.View>
    );
  }
}

class Background extends PureComponent {
  
  constructor(props) {
    super(props);
    
    renderers[this.props.id] = this; 
    this.animatedValue = new Animated.Value(0);
    
    this.play();
  }	
  
  play = () => {
   
    this.animatedValue.setValue(0);
        
    var animation = Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 8000,
      easing: Easing.linear,
      useNativeDriver: true, // <-- Add this
    });
        
    Animated.loop(animation).start(); //zapetlenie
    
  }
    
  render() {
    return (
      <View 
        style={{
          overflow: "hidden",
          width: screenWidth,
          height: screenHeight,
          backgroundColor: "black",
          position: "absolute",
          left: 0,
          top: 0 }}
      >
	    <Animated.Image
        style={{
          width: 412,
          height: 3*412,
          transform: [ { translateX: 0}, 
                       { translateY: this.animatedValue.interpolate({
                    inputRange:  [0, 1],
                    outputRange: [-412, 1]}) } ]
        }}
        fadeDuration={0} 
        source={require('./images/bkgnd1_2x1.png')}
        resizeMode={"stretch"}
      />
	  </View>
    );
  }
}

class Shot extends PureComponent {
  
  constructor(props) {
    super(props);
    renderers[this.props.id] = this;
    this.fired = false;
    this.animatedValue = new Animated.Value(0);
    this.x = this.props.position[0];
    this.startY = screenHeight;
    this.endY = screenHeight;
    this.currentY = screenHeight;
    this.animatedValue.addListener(({value}) => {
      this._animatedValue = value;
      this.currentY = value * (this.endY - this.startY) + this.startY;
    }); 
    this.isMoving = false;
    this.animation = null;
  }

  play = (delay) => {
    this.animatedValue.setValue(0);
    this.isMoving = true;
    this.fired = true;
        
    this.animation = Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start((res) => {
      this.isMoving = false;
    });
       
  }

  stop = () => {
    this.isMoving = false;
    if (this.animation) this.animation.stop();
  }

  render() {
    const y = this.props.position[1];
    this.startY = y;
    this.endY = y - screenHeight;
    
    var img;
    if (!this.props.hit) img = require('./images/shot.png');
      
    return (
       
      <Animated.View 
        style={{
          overflow: "hidden",
          width: 44,
          height: 68,
          position: "absolute",
          transform: [ { translateX: this.x}, 
                       { translateY: this.animatedValue.interpolate({
                    inputRange:  [0, 1],             
                    outputRange: [this.startY, this.endY]}) } ]
        }}
      >
        <Image
          style={{
            height: 44,
            width: 68,
            top: 0,
            left: 0,
            resizeMode: 'stretch'
          }}
          source={img}
        />
      </Animated.View>
    );
  }
}

class LivesCounter extends PureComponent {
  constructor(props) {
    super(props);
    renderers[this.props.id] = this;
    this.lives = 3;
  }

  render() {
    const lives = this.props.lives;

    return (
      <View 
        style={{
          width: screenWidth,
          height: screenHeight,
          position: "absolute",
          right: 20,
          top: 20 }}
      >
	      <Text style={{ color: 'white', fontSize: 20, textAlign: 'right' }}>Lives: {lives}</Text>
	    </View>
    );
  }
}

class PointsCounter extends PureComponent {
  constructor(props) {
    super(props);
    renderers[this.props.id] = this;
    this.points = 0;
  }

  render() {
    const points = this.props.points;
    score = points;

    return (
      <View 
        style={{
          width: screenWidth,
          height: screenHeight,
          position: "absolute",
          left: 20,
          top: 20 }}
      >
	      <Text style={{ color: 'white', fontSize: 20 }}>Points: {points}</Text>
	    </View>
    );
  }
}

class Health extends PureComponent {
  constructor(props) {
    super(props);
    renderers[this.props.id] = this; 
    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({value}) => this._animatedValue = value); 
    this.isMoving = false;
  }	
    
  play = (delay) => {
    this.animatedValue.setValue(0);
    this.isMoving = true;
        
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start((res) => {
      this.isMoving = false;
    });  
  }

  render() {
    const x = this.props.position[0];
    const y = this.props.position[1];
    
    var img;
    if (!this.props.collected) img = require('./images/pill.png');
      
    return (
      <Animated.View 
        style={{
          overflow: "hidden",
          width: 55,
          height: 55,
          position: "absolute",
          transform: [ { translateX: x}, 
                       { translateY: this.animatedValue.interpolate({
                    inputRange:  [0, 1],             
                    outputRange: [-55, screenHeight]}) } ]
        }}>
        <Image
          style={{
            height: 55,
            width: 55,
            top: 0,
            left: 0,
            resizeMode: 'stretch'
          }}
          source={img}
        />
      </Animated.View>
    );
  }
}

class ShieldBonus extends PureComponent {
  constructor(props) {
    super(props);
    renderers[this.props.id] = this; 
    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({value}) => this._animatedValue = value); 
    this.isMoving = false;
    this.startX = this.props.position[0];
    this.startY = this.props.position[1];
    this.width = 60;
    this.height = 60;
  }
    
  play = (delay) => {
    this.animatedValue.setValue(0);
    this.isMoving = true;
        
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start((res) => {
      this.isMoving = false;
    });  
  }

  render() {
    this.startX = this.props.position[0];
    this.startY = this.props.position[1];
    
    var img;
    if (!this.props.collected) img = require('./images/shield_bonus.png');
      
    return (
      <Animated.View 
        style={{
          overflow: "hidden",
          width: this.width,
          height: this.height,
          position: "absolute",
          transform: [ { translateX: this.startX}, 
                       { translateY: this.animatedValue.interpolate({
                    inputRange:  [0, 1],             
                    outputRange: [this.startY - this.height / 2, screenHeight]}) } ]
        }}>
        <Image
          style={{
            height: this.height,
            width: this.width,
            top: 0,
            left: 0,
            resizeMode: 'stretch'
          }}
          source={img}
        />
      </Animated.View>
    );
  }
}

class Boss extends PureComponent {
  
  constructor(props) {
    super(props);
    renderers[this.props.id] = this;
    this.introAnimatedValue = new Animated.Value(0);
    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({value}) => this._animatedValue = value);
    this.fadeValue = new Animated.Value(1);
    this.state = {
      playingIntro: false,
      active: false,
      health: 10,
      hit: 0,
      killed: false
    };
    this.width = 220;
    this.height = 220;
    this.minY = 20;
    this.maxY = 80;
    this.cycles = 0;
    this.spawnedVirusesInCycle = false;
  }

  init = () => {
    this.cycles = 0;
    this.setState({
      playingIntro: false,
      active: false,
      health: 10,
      hit: 0,
      killed: false
    });
    this.playIntro();
  }

  hit = () => {
    this.setState({ hit: 1, health: this.state.health - 1 }, () => {
      if (this.state.health > 0) {
        setTimeout(() => { this.setState({ hit: 0 }); }, 2000);
      } else this.kill();
    });
  }

  playIntro = () => {
    this.introAnimatedValue.setValue(0);
    this.fadeValue.setValue(1);
    this.setState({ playingIntro: true });

    Animated.timing(this.introAnimatedValue, {
      toValue: 1,
      duration: 4000,
      easing: Easing.sin,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ playingIntro: false, active: true });
      this.play();
    });
  }
  
  play = () => {
    var toValue = (this._animatedValue == 1 ? 0 : 1);
    Animated.timing(this.animatedValue, {
      toValue: toValue,
      easing: Easing.sin,
      duration: 2000,
      useNativeDriver: true
    }).start(() => {
      this.cycles++;
      this.spawnedVirusesInCycle = false;
      if (this.state.health > 0) this.play();
    });
  }

  kill = () => {
    this.setState({ killed: true });
    setTimeout(() => { this.fadeOut(); }, 1000);
  }
  
  fadeOut = () => {
    this.fadeValue.setValue(1);
    Animated.timing(this.fadeValue, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    }
    ).start(() => {
      bossFight = false;
      killedViruses = 0;
    });
  }
    
  render() {
    const x = (screenWidth - this.width) / 2;
    var minY, maxY, animatedValue;
    
    var img;
    if (this.state.killed) img = require('./images/boss_explosion.png');
    else if (this.state.hit == 1) img = require('./images/boss_hit.png');
    else if (this.state.playingIntro || this.state.active) img = require('./images/boss.png');
      
    if (this.state.playingIntro) {
      minY = -1 * this.height;
      maxY = 20;
      animatedValue = this.introAnimatedValue;
    }
    else {
      minY = 20;
      maxY = 80;
      animatedValue = this.animatedValue;
    }
    return (
      <Animated.View 
        style={{
          overflow: "hidden",
          width: this.width,
          height: this.height,
          position: "absolute",
          transform: [{ translateX: x}, 
                      { translateY: animatedValue.interpolate({
                    inputRange:  [0, 1],             
                    outputRange: [minY, maxY]}) } ],
          opacity: this.fadeValue
        }}
      >
        <Image
          style={{
            height: this.width,
            width: this.height,
            top: 0,
            left: 0,
            resizeMode: 'stretch'
          }}
          source={img}
        />
      </Animated.View>
    );
  }
}

class Virus2 extends PureComponent {
  
  constructor(props) {
    super(props);
    
    renderers[this.props.id] = this; 
    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({value}) => this._animatedValue = value);
    this.fadeValue = new Animated.Value(1);
    this.animation = null;
    this.isMoving = false;
    this.height = 60;
    this.width = 60;
    this.state = {
      startX: this.props.position[0],
      startY: this.props.position[1],
      endX: this.props.endX,
      endY: this.props.endY,
      hit: 0,
      health: 2
    };
    this.initiating = true;
  }	

  play = (delay) => {
    this.isMoving = true;
    this.initiating = false;
    this.animatedValue.setValue(0);
    this.animation = Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => { 
      this.stop();
    });
  }

  stop = () => {
    this.isMoving = false;
    if (this.animation) this.animation.stop();
  }

  hit = () => {
    this.setState({ hit: 1, health: this.state.health - 1 }, () => {
      if (this.state.health > 0) {
        setTimeout(() => { this.setState({ hit: 0 }); }, 250);
      } else this.fadeOut();
    });
  }

  fadeOut = () => {
    Animated.timing(this.fadeValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start();
  }
    
  render() {
    var startX = this.state.startX - this.width / 2;
    var startY = this.state.startY - this.height / 2;
    var endX = this.state.endX - this.width / 2;
    var endY = this.state.endY - this.height / 2;
    
    var img;
    if (this.state.health == 0)
      img = require('./images/explosion2.png');
    else if (this.state.hit == 1)
      img = require('./images/virus2_hit.png');
    else
      img = require('./images/virus2.png');
      
    return (
       
      <Animated.View 
        style={{
          overflow: "hidden",
          width: this.width,
          height: this.height,
          position: "absolute",
          transform: [ { translateX: this.animatedValue.interpolate({
                        inputRange:  [0, 1],             
                        outputRange: [startX, endX]})}, 
                       { translateY: this.animatedValue.interpolate({
                        inputRange:  [0, 1],             
                        outputRange: [startY, endY]}) } ],
          opacity: this.fadeValue
        }}
      >
     
     <Image
        style={{
          height: this.height,
          width: this.width,
          top: 0,
          left: 0,
          resizeMode: 'stretch'
        }}
        source={img}
      />
        
      </Animated.View>
    );
  }
}
 
export { Virus, Virus2, Background, Fighter, Shot, LivesCounter, PointsCounter, Health, ShieldBonus, Boss };
