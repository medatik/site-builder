#!/usr/bin/env node
/**
 * Find the Telegram chat id for the contact form's `telegram` delivery channel.
 *
 *   npm run telegram:chatid            # print the id
 *   npm run telegram:chatid -- --write # print it AND set it in .env.local
 *
 * WHY THIS EXISTS: `TELEGRAM_CHAT_ID` is the one value a client can't read off a
 * screen. Telegram has no "copy chat id" in its UI, and a bot can only learn a
 * chat AFTER someone messages it — so onboarding otherwise means talking a
 * non-technical owner through a raw API URL and some JSON. This does it for you.
 *
 * ONBOARDING FLOW:
 *   1. Put the bot's token in `.env.local` as TELEGRAM_BOT_TOKEN (from @BotFather).
 *   2. Ask the owner to open `t.me/<bot_username>` and press Start.
 *      (For a shared inbox, add the bot to a GROUP and send one message there —
 *       group ids are negative and are what you want for a team.)
 *   3. Run this. It waits for that message, then reports the id.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ENV_FILE = ".env.local";
const WRITE = process.argv.includes("--write");
const WAIT_MS = 120_000;

function readEnv(key) {
  if (process.env[key]) return process.env[key];
  if (!existsSync(ENV_FILE)) return undefined;
  const m = readFileSync(ENV_FILE, "utf8").match(
    new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.+?)[ \\t]*$`, "m"),
  );
  return m ? m[1].replace(/^["']|["']$/g, "") : undefined;
}

async function api(token, method, query = "") {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}${query}`);
  return res.json();
}

const token = readEnv("TELEGRAM_BOT_TOKEN");
if (!token) {
  console.error(
    `✗ TELEGRAM_BOT_TOKEN not found (checked the environment and ${ENV_FILE}).\n` +
      `  Create a bot with @BotFather, then add:\n    TELEGRAM_BOT_TOKEN=123456:AA...`,
  );
  process.exit(1);
}

const me = await api(token, "getMe");
if (!me.ok) {
  console.error(`✗ Token rejected by Telegram: ${me.description ?? "unknown error"}`);
  process.exit(1);
}
console.log(`✓ Bot: @${me.result.username}`);

// A webhook consumes updates, so getUpdates would always come back empty.
const hook = await api(token, "getWebhookInfo");
if (hook.ok && hook.result.url) {
  console.error(
    `✗ A webhook is set on this bot (${hook.result.url}), so getUpdates returns nothing.\n` +
      `  Remove it with: https://api.telegram.org/bot<TOKEN>/deleteWebhook`,
  );
  process.exit(1);
}

console.log(`  Ask the owner to open https://t.me/${me.result.username} and press Start.`);
console.log(`  (For a team inbox: add the bot to a group and send one message there.)`);
console.log(`  Waiting up to ${WAIT_MS / 1000}s for a message…`);

const deadline = Date.now() + WAIT_MS;
let chats = [];
while (Date.now() < deadline && chats.length === 0) {
  // Long-poll: returns as soon as a message lands, instead of hammering the API.
  const updates = await api(token, "getUpdates", "?timeout=30");
  if (!updates.ok) {
    console.error(`✗ getUpdates failed: ${updates.description ?? "unknown error"}`);
    process.exit(1);
  }
  chats = [
    ...new Map(
      (updates.result ?? [])
        .map((u) => u.message ?? u.channel_post)
        .filter((m) => m?.chat)
        .map((m) => [m.chat.id, m.chat]),
    ).values(),
  ];
}

if (chats.length === 0) {
  console.error(
    `✗ No message received. The owner must send the bot a message first —\n` +
      `  a bot cannot start a conversation, so there is no chat until they do.`,
  );
  process.exit(1);
}

const describe = (c) =>
  `${c.id}  (${c.type}${c.title ? `: ${c.title}` : c.first_name ? `: ${c.first_name}` : ""})`;

if (chats.length > 1) {
  console.log(`\n  Found ${chats.length} chats:`);
  chats.forEach((c) => console.log(`    ${describe(c)}`));
  console.log(`  Using the first. Pass the right one manually if that's not it.`);
}

const chosen = chats[0];
console.log(`\n✓ TELEGRAM_CHAT_ID=${chosen.id}   ${describe(chosen).replace(`${chosen.id}  `, "")}`);

if (!WRITE) {
  console.log(`\n  Add that line to ${ENV_FILE}, or re-run with --write to do it automatically.`);
  process.exit(0);
}

let contents = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
const line = `TELEGRAM_CHAT_ID=${chosen.id}`;
if (/^[ \t]*TELEGRAM_CHAT_ID[ \t]*=/m.test(contents)) {
  contents = contents.replace(/^[ \t]*TELEGRAM_CHAT_ID[ \t]*=.*$/m, line);
  console.log(`✓ Updated TELEGRAM_CHAT_ID in ${ENV_FILE}`);
} else {
  if (contents && !contents.endsWith("\n")) contents += "\n";
  contents += `${line}\n`;
  console.log(`✓ Added TELEGRAM_CHAT_ID to ${ENV_FILE}`);
}
writeFileSync(ENV_FILE, contents);
console.log(`  Restart the dev server so Next.js picks it up.`);
