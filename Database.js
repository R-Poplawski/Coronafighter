import { openDatabase } from "react-native-sqlite-storage";

const create_table_highscores = 'CREATE TABLE IF NOT EXISTS HighScores (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT NOT NULL, date, score INTEGER NOT NULL)';
const select_high_scores = 'SELECT * FROM HighScores ORDER BY score desc, id asc LIMIT 18';
const insert_high_score = "INSERT INTO HighScores (nickname, date, score) VALUES (?, datetime('now','localtime'), ?)";

var db = openDatabase({ name: "local.db" });

export default class Database {

  initDB() {
    // stwórz tabelę jeśli nie istnieje
    db.transaction(function(txn) {
      txn.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='HighScores'", [],
        function(tx, res) { if (res.rows.length == 0) txn.executeSql(create_table_highscores, []); }
      );
    });
  };

  listHighScores() { // pobierz listę najlepszych wyników
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(select_high_scores, [],
          (tx, results) => {
            var highscores = [];
            for (let i = 0; i < results.rows.length; i++) {
              let row = results.rows.item(i);
              highscores.push({
                'id': row.id,
                'nickname': row.nickname,
                'date': row.date,
                'score': row.score
              });
            }
            resolve(highscores);
        });
      });
    });
  }

  addHighScore(nickname, score) { // dodaj wynik do tabeli
    db.transaction(function(tx) {
      tx.executeSql(insert_high_score, [nickname, score]);
    }); 
  }
}
