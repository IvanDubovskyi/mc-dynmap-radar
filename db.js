import {JSONFile, Low} from 'lowdb';

const file = './db/whitelist.json';
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();

export default db;
