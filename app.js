import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import {pointInPolygon, polygonScale} from 'geometric';
import bot from './bot.js';
import db from './db.js';

let whitelist = db.data;

const borders = [
  [3894, -4691],
  [3947, -4738],
  [3989, -4747],
  [4010, -4782],
  [4009, -4820],
  [3992, -4865],
  [3976, -4890],
  [3954, -4942],
  [3972, -4972],
  [3995, -5018],
  [3965, -5085],
  [3951, -5146],
  [3873, -5159],
  [3861, -5213],
  [3784, -5279],
  [3709, -5308],
  [3662, -5311],
  [3635, -5274],
  [3575, -5216],
  [3584, -5153],
  [3608, -5133],
  [3594, -5101],
  [3584, -5059],
  [3559, -5046],
  [3534, -5025],
  [3496, -5014],
  [3482, -4980],
  [3510, -4939],
  [3539, -4940],
  [3553, -4901],
  [3575, -4830],
  [3566, -4796],
  [3569, -4762],
  [3567, -4736],
  [3568, -4719],
  [3569, -4702],
  [3593, -4693],
  [3632, -4687],
  [3651, -4686],
  [3635, -4641],
  [3621, -4618],
  [3591, -4615],
  [3552, -4616],
  [3527, -4570],
  [3569, -4510],
  [3621, -4504],
  [3674, -4501],
  [3726, -4499],
  [3770, -4507],
  [3761, -4555],
  [3779, -4572],
  [3784, -4605],
  [3813, -4639],
  [3851, -4673]
];
let intrudersInBorders = [];

setInterval(() => scanMap(), 10000);

function scanMap() {
  axios
    .get(`${process.env.DYNMAP_URL}/${Date.now()}`)
    .then((res) => {
      let intruders = [];
      res.data.players.forEach((player) => {
        if (player?.world !== 'Borukva') return;
        if (whitelist.indexOf(player.name) === -1) {
          if (pointInPolygon([player.x, player.z], polygonScale(borders, 1.2))) {
            if (intrudersInBorders.indexOf(player.name) === -1) {
              intruders.push(player);
            }
          }
        }
      });
      intruders.forEach((intruder) => {
        intrudersInBorders.push(intruder.name);
        alert(intruder);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function alert(intruder) {
  const message = `Незваний гість! ${intruder.name} на координатах ${intruder.x}, ${intruder.y}, ${intruder.z}`;
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  console.log(`[${new Date().toISOString()}] ${message}`);
}
