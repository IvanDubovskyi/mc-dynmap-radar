import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import {pointInPolygon} from 'geometric';
import fs from 'fs';
import {Low, JSONFile} from 'lowdb'
import {Telegraf} from 'telegraf';

const whitelistFile = './db/whitelist.json';
const whitelistAdapter = new JSONFile(whitelistFile);
const whitelistDb = new Low(whitelistAdapter);
await whitelistDb.read();
let whitelist = whitelistDb.data;

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

bot.use(async (ctx, next) => {
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message.chat.id;
  const update = ctx.update.message || ctx.update.callback_query;
  if (userId == process.env.RIGHTFUL_USER_ID || chatId == process.env.MAIN_CHAT_ID) {
    next();
    return;
  }

  await ctx.reply("You don't have access. Go away.");
  console.log(`[${new Date().toISOString()}] Unrightful usage! ${update.message.from.username}`);
});

bot.command('seewhitelist', (ctx) => {
  console.log(ctx);
  ctx.reply(whitelist.join(' \n'));
});

bot.command('addplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];

  console.log(`[${user}] Adding ${playerName} to the whitelist!`);
  ctx.reply(`Adding ${playerName} to the whitelist!`);
  whitelist.push(playerName);
  saveWhitelist();
});

bot.command('removeplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];
  const playerIndex = whitelist.indexOf(playerName);

  if (playerIndex !== -1) {
    console.log(`[${user}] Removing ${playerName} from the whitelist!`);
    ctx.reply(`Removing ${playerName} from the whitelist!`);
    whitelist.splice(playerIndex, 1);
  } else {
    console.log(`Player ${playerName} wasn't in the whitelist.`);
    ctx.reply(`Player ${playerName} wasn't in the whitelist.`);
  }
  saveWhitelist();
});

// const borders = [[-1216, -137], [-695, 40], [-624, 335], [-1206, 314]];
const borders = [
  [-897, -28],
  [-820, 0],
  [-757, -11],
  [-724, -4],
  [-672, 63],
  [-642, 192],
  [-746, 283],
  [-969, 283],
  [-1111, 193],
  [-1079, 67],
  [-996, 10],
  [-995, -29],
];
let intrudersInBorders = [];

setInterval(() => {
  axios
    .get(`${process.env.DYNMAP_URL}/${Date.now()}`)
    .then((res) => {
      let intruders = [];
      res.data.players.forEach((player) => {
        if (whitelist.indexOf(player.name) === -1) {
          if (pointInPolygon([player.x, player.z], borders)) {
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
}, 10000);

function alert(intruder) {
  const message = `Intruder alert! ${intruder.name} at ${intruder.x}, ${intruder.y}, ${intruder.z}`;
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function saveWhitelist() {
  await whitelistDb.write();
}
