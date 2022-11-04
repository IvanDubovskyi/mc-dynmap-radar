import dotenv from 'dotenv';
dotenv.config();
import db from './db.js';
import {Telegraf} from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
let whitelist = db.data;

bot.launch();

bot.use(async (ctx, next) => {
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message.chat.id;
  const update = ctx.update.message || ctx.update.callback_query;
  if (userId == process.env.RIGHTFUL_USER_ID || chatId == process.env.MAIN_CHAT_ID) {
    next();
    return;
  }

  await ctx.reply('You don\'t have access. Go away.');
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
  db.write();
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
  db.write();
});

export default bot;
