import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

function scanMap() {
  axios
    .get(`${process.env.DYNMAP_URL}/${Date.now()}`)
    .then((res) => {
      let table = [];

      res.data.players.forEach((player) => {
        table.push({name: player.name, x: player.x,y: player.y,z: player.z,world: player.world,})
      })

      function compare( a, b ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
      }
      
      table.sort( compare );

      console.table(table, ['name', 'x', 'y', 'z', 'world']);
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    });
}
scanMap();
  

// 0 -> 6:00
// 1000 -> 7:00
// ...
// 24000 -> 6:00