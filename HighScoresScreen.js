import React, { Component } from 'react';
import { Text, Button, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';

export default class HighScoresScreen extends Component {
constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
        highscores: [],
        isLoading: true,
        HeadTable: ['#', 'Nickname', 'Score', 'Date']
    };
    this.getHighscores();
  }

  highscoresToTableData(highscores) {
    var data = [];
    for (var i = 0; i < highscores.length; i++) {
      var item = highscores[i];
      data.push([(i + 1) , item.nickname, item.score, item.date.substring(0, 10)]);
    }
    return data;
  }

  getHighscores() {
    database.listHighScores().then((data) => {
      this.setState({
        highscores: this.highscoresToTableData(data),
        isLoading: false,
      });
    }).catch((err) => {
      this.setState({ isLoading: false });
    });
  }

  render() {
    if (this.state.isLoading) {
      return(
        <View style={styles.activity}>
          <ActivityIndicator size="large" color="#0000ff"/>
        </View>
      )
    }

    if (this.state.highscores.length === 0) {
      return(
        <View style={styles.container}>
          <Text style={styles.titleText}>High Scores</Text>
          <Text style={styles.message}>No highscores found</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>High Scores</Text>
        <View style={{ flex: 1 }}>
          <Table borderStyle={{borderWidth: 1, borderColor: '#ffa1d2'}}>
            <Row data={this.state.HeadTable} style={styles.HeadStyle} textStyle={styles.TableText}/>
            <Rows data={this.state.highscores} textStyle={styles.TableText}/>
          </Table>
        </View>
        <View style={{  }}>
          <Button style={styles.button}
          onPress={ () => this.props.navigation.goBack(null) }
          title="Back" />
        </View>
      </View>
      );
    }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "stretch",
    padding: 10,
    margin: 15
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  },
  activity: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    padding: 16,
    fontSize: 18
  },
  container: { 
    flex: 1,
    padding: 18,
    paddingTop: 35,
    backgroundColor: '#ffffff' 
  },
  HeadStyle: { 
    height: 50,
    alignContent: "center",
    backgroundColor: '#ffe0f0'
  },
  TableText: { 
    margin: 5
  },
  titleText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingBottom: 5
  }
});