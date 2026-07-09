#!/usr/bin/env node
/**
 * Generate VAPID key pair for Admin Web Push.
 * Run: node scripts/generate-vapid-keys.mjs
 *
 * Add output to .env.local (dev) and Vercel/hosting ENV (production).
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("VAPID Keys — Panda-Bande Admin Push\n");
console.log("Füge diese Werte in .env.local und Vercel → Settings → Environment Variables ein:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:info@pb-kinderevents.de");
console.log("\n⚠️  VAPID_PRIVATE_KEY niemals ins Git committen oder ins Frontend legen.");
console.log("Siehe PUSH_SETUP.md für die vollständige Anleitung.");
