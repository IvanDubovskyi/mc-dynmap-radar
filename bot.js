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

  await ctx.reply('У вас немає прав.');
  console.log(`[${new Date().toISOString()}] Використання без прав! ${update.from?.username} ${userId}`);
});

bot.command('seewhitelist', (ctx) => {
  console.log(ctx);
  ctx.reply(whitelist.join(' \n'));
});

bot.command('addplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];

  console.log(`[${new Date().toISOString()}] ${user} додав ${playerName} до вайтлісту.`);
  ctx.reply(`Додаю ${playerName} до вайтлісту.`);
  whitelist.push(playerName);
  db.write();
});

bot.command('removeplayer', (ctx) => {
  const user = ctx.update.message.from.username;
  const playerName = ctx.update.message.text.split(' ')[1];
  const playerIndex = whitelist.indexOf(playerName);

  if (playerIndex !== -1) {
    console.log(`[${new Date().toISOString()}] ${user} видалив ${playerName} з вайтлісту.`);
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`);
    whitelist.splice(playerIndex, 1);
  } else {
    console.log(`[${new Date().toISOString()}] Гравець ${playerName} не знаходиться у вайтлісті.`);
    ctx.reply(`Гравець ${playerName} не знаходиться у вайтлісті.`);
  }
  db.write();
});

export default bot;
