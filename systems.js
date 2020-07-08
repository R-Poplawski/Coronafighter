import { Shot, Virus2 } from "./renderers";

const fighter_id = 2;
const boss_id = 7;
const lives_counter_id = 8;
const points_counter_id = 9;
const shield_bonus_id = 10;

const spawnShieldBonus = (entities, x, y) => {
  // wygeneruj bonus osłony
  if (renderers[shield_bonus_id].isMoving || entities[fighter_id].shield == 1) return entities;
  let d = 1000 * Math.random();
  if (d >= 200) return entities;
  entities[shield_bonus_id].position = [x, y];
  entities[shield_bonus_id].collected = 0;
  renderers[shield_bonus_id].play(4000 + 4000 * Math.random());
  return entities;
};

const fighterHit = (entities) => {
  // trafienie statku
  entities[fighter_id].hit = 1;
  entities[lives_counter_id].lives--;
  if (entities[lives_counter_id].lives < 1) {
    gameEngine.dispatch({ type: "game-over" });
  }
  setTimeout(() => {
    entities[fighter_id].hit = 0;
  }, 1500);
  return entities;
};

const initBossFight = (entities) => {
  // rozpocznij walkę z bossem
  bossFight = true;
  entities[boss_id].position = [(screenWidth - renderers[boss_id].width) / 2, -1 * renderers[boss_id].height];
  renderers[boss_id].init();
  return entities;
};

const sendVirus = (entities, id, centerX, centerY, angle) => {
  // boss tworzy mniejsze wirusy
  var r1 = 120;
  var r2 = screenHeight;
  var startPos = [centerX + Math.cos(angle) * r1, centerY + Math.sin(angle) * r1];
  var endPos = [centerX + Math.cos(angle) * r2, centerY + Math.sin(angle) * r2];
  entities[id] = {
    id: id,
    type: 'v2', 
    position: [startPos[0], startPos[1]],
    endX: endPos[0],
    endY: endPos[1],
    hit: 0,
    renderer: Virus2
  }
  return entities;
};

const VirusController = (entities, { touches, dispatch, events, time }) => {

  for (var key in entities) {
    if (key > 15) break;
    if (entities[key].type == 'v') {

      let id = entities[key].id;
      
      if (renderers[id] && renderers[id].isMoving) { // porusza sie

        let x = entities[id].position[0] + 40;
        let y = screenHeight * renderers[id]._animatedValue + 40;
        
        if (Math.abs(entities[fighter_id].position[0] + 64 - x) < 64 &&
            Math.abs(entities[fighter_id].position[1] + 64 - y) < 64) { // kolizja ze statkiem
          
          if (entities[id].hit == 0) { // nowa kolizja
            entities[id].hit = 1;
          }
          if (entities[fighter_id].hit == 0 && entities[fighter_id].shield == 0) {
            // jeśli minął wystarczający czas od poprzedniej kolizji
            entities = fighterHit(entities);
          }
        }

        if (entities[id].hit == 0) {
          // kolizje z pociskami
          // sprawdzaj tylko wirusy, które nie były wcześniej trafione
          for (var key2 in entities) 
            if (entities[key2].type == 's') {
              let shotId = entities[key2].id;
              if (renderers[shotId].fired == false) continue;
              shotPosition = [renderers[shotId].x + 22, renderers[shotId].currentY + 22];
              var r = Math.sqrt(Math.pow(shotPosition[0] - x, 2) + Math.pow(shotPosition[1] - y, 2));
              if (r < 45 && entities[shotId].hit == 0) {
                entities[id].hit = 1;
                entities[shotId].hit = 1;
                entities[points_counter_id].points++;
                killedViruses++;
                if (killedViruses == 10) {
                  entities = initBossFight(entities);
                }
              }
            }
        }
      }
           
      if (!bossFight && renderers[id] && !renderers[id].isMoving) { // "uspiony" za krawedzią ekranu
        let d = 1000 * Math.random();
        if (d < 10) { // czestotliwosc wypuszczania nowych wirusow = 10/1000 = 0.01 (czyli 1 raz na 100 tikow)
          entities[id].position = [(screenWidth-80)*Math.random(), 0]; // losowa pozycja x
          entities[id].hit = 0;
          renderers[id].play(4000 + 4000*Math.random()); // losowy czas animacji (przelotu przez cały ekran) 4-8s
        }
      }
    }
    else if (entities[key].type == 'v2') {
      let id = entities[key].id;
      var virus = renderers[id];

      if (virus && virus.initiating == true) virus.play(4000);
      else if (virus && virus.isMoving) {
        let x = (virus.state.endX - virus.state.startX) * virus._animatedValue + virus.state.startX;
        let y = (virus.state.endY - virus.state.startY) * virus._animatedValue + virus.state.startY;

        if (virus.state.hit == 0 && Math.abs(entities[fighter_id].position[0] + 64 - x) < 64 &&
              Math.abs(entities[fighter_id].position[1] + 64 - y) < 64) { // kolizja ze statkiem
          virus.hit();
          if (entities[fighter_id].hit == 0 && entities[fighter_id].shield == 0) {
            entities = fighterHit(entities);
          }
        }

        if (virus.state.hit == 0) {
          // kolizje z pociskami
          // sprawdzaj tylko wirusy, które nie były wcześniej trafione
          for (var key2 in entities) 
            if (entities[key2].type == 's') {
              let shotId = entities[key2].id;
              if (renderers[shotId].fired == false) continue;
              shotPosition = [renderers[shotId].x + 22, renderers[shotId].currentY + 22];
              var r = Math.sqrt(Math.pow(shotPosition[0] - x, 2) + Math.pow(shotPosition[1] - y, 2));
              if (r < virus.width / 2 && entities[shotId].hit == 0) {
                virus.hit();
                entities[shotId].hit = 1;
                entities[points_counter_id].points++;
                entities = spawnShieldBonus(entities, x, y);
              }
            }
        }
      }
      else if (virus && !virus.isMoving && !virus.initiating) {
        delete entities[id];
      }
    }
  }

  return entities;
};

const HealthSpawner = (entities, { touches, time }) => {

  for (var key in entities) {
    if (key > 15) break;
    if (entities[key].type == 'h') {

      let id = entities[key].id;
      
      if (renderers[id] && renderers[id].isMoving) {
        
        let x = entities[id].position[0] + 27;
        let y = screenHeight*renderers[id]._animatedValue + 27;

        var fighterPos = [entities[fighter_id].position[0] + 64, entities[fighter_id].position[1] + 64];
        var r = Math.sqrt(Math.pow(fighterPos[0] - x, 2) + Math.pow(fighterPos[1] - y, 2));
        
        if (r < 64) { // kolizja ze statkiem
          
          if (entities[id].collected == 0) { // nowa kolizja
            entities[id].collected= 1;
            entities[lives_counter_id].lives++;
          }
        }

      }


      if (renderers[id] && !renderers[id].isMoving) { // "uspiony" za krawedzią ekranu
        let d = (10000 * Math.random()).toFixed(0);
        if (d % 1000 == 0) {
          entities[id].position = [(screenWidth - 55) * Math.random(), 0]; // losowa pozycja x
          entities[id].collected = 0;
          renderers[id].play(4000 + 4000 * Math.random()); // losowy czas animacji (przelotu przez cały ekran) 4-8s
        }
      }
    }
  }

  return entities;
};

const ShieldBonusController = (entities, { touches, time }) => {

  if (renderers[shield_bonus_id] && renderers[shield_bonus_id].isMoving) {
        
    let x = entities[shield_bonus_id].position[0] + renderers[shield_bonus_id].width / 2;
    let startY = renderers[shield_bonus_id].startY - renderers[shield_bonus_id].height / 2;
    let y = startY + (screenHeight - startY) * renderers[shield_bonus_id]._animatedValue + 30;

    var fighterPos = [entities[fighter_id].position[0] + 64, entities[fighter_id].position[1] + 64];
    var r = Math.sqrt(Math.pow(fighterPos[0] - x, 2) + Math.pow(fighterPos[1] - y, 2));
    
    if (r < 64) { // kolizja ze statkiem
      
      if (entities[shield_bonus_id].collected == 0) { // nowa kolizja
        entities[shield_bonus_id].collected= 1;
        entities[fighter_id].shield = 1;
        setTimeout(() => {
          entities[fighter_id].shield = 0;
        }, 10000);
      }
    }
  }

  return entities;
};


const MoveFighter = (entities, { touches }) => {
  if (renderers[fighter_id] && !renderers[fighter_id].isAnimating) renderers[fighter_id].play("idle");  
 
  var fighter = entities[fighter_id]; 
  if (fighter && fighter.position && renderers[fighter_id])
    fighter.position = [renderers[fighter_id].x, renderers[fighter_id].y];
  
  return entities;
};


const Fire = (entities, { touches }) => {
  
  for (var key in entities) 
    if (entities[key].type == 's') {
      let id = entities[key].id;
      if (renderers[id]) {
        if (entities[id].hit || (renderers[id].fired && !renderers[id].isMoving)) {
          renderers[id].stop();
          delete renderers[id];
          delete entities[id];
        }
        else if(renderers[id].fired == false) {
          renderers[id].play(2000);
        }
      }   
    }
  
  touches.filter(t => t.type === "press").forEach(t => {
      let fighter = entities[fighter_id];
      if (nextEntityId >= 60) nextEntityId = 16;
      let id = nextEntityId++;
      if (renderers[id]) {
        renderers[id].stop();
        delete renderers[id];
      }
      if (entities[id]) delete entities[id];
      entities[id] = {
        id: id,
        type: 's', 
        position: [fighter.position[0] + 31, fighter.position[1] + 12],
        hit: 0,
        renderer: Shot
      }
  });

  return entities;
};

const BossController = (entities, { touches, dispatch, events, time }) => {
  if (!bossFight) return entities;

  var boss = renderers[boss_id];

  if (boss && boss.state.active) {

    let x = entities[boss_id].position[0] + boss.width / 2;
    let y = (boss.maxY - boss.minY) * boss._animatedValue + boss.minY + boss.height / 2;

    if (!boss.killed && boss.cycles % 3 == 1 && !boss.spawnedVirusesInCycle) {
      // cykliczne wypuszczanie małych wirusów
      boss.spawnedVirusesInCycle = true;
      entities = sendVirus(entities, 11, x, y, 0.6 * Math.PI);
      entities = sendVirus(entities, 12, x, y, 0.55 * Math.PI);
      entities = sendVirus(entities, 13, x, y, 0.5 * Math.PI);
      entities = sendVirus(entities, 14, x, y, 0.45 * Math.PI);
      entities = sendVirus(entities, 15, x, y, 0.4 * Math.PI);
    }

    // kolizje z pociskami
    for (var key2 in entities) 
      if (entities[key2].type == 's') {
        let shotId = entities[key2].id;
        if (!renderers[shotId] || renderers[shotId].fired == false) continue;
        shotPosition = [renderers[shotId].x + 22, renderers[shotId].currentY + 22];
        var r = Math.sqrt(Math.pow(shotPosition[0] - x, 2) + Math.pow(shotPosition[1] - y, 2));
        if (r < 110 && entities[shotId].hit == 0) {
          entities[shotId].hit = 1;
          renderers[shotId].stop();
          if (boss.state.hit == 0) {
            boss.hit();
            entities[points_counter_id].points++;
          }
        }
      }
  }
     
  return entities;
};
 
export { MoveFighter, VirusController, HealthSpawner, ShieldBonusController, Fire, BossController };
