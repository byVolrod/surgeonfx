/**
 * update-whop.js — SurgeonFXGroup
 * ─────────────────────────────────
 * Récupère automatiquement depuis l'API Whop :
 *   • Le nombre de membres actifs
 *   • Tous les avis avec contenu
 * Met à jour index.html en local puis upload via FTP sur OVH.
 *
 * Usage : node update-whop.js
 * Planification : Tâche Windows planifiée (auto-update.bat)
 */

'use strict';

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const ftp    = require('basic-ftp');

// ── Charger les variables d'environnement depuis .env ─────────────────────────
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_KEY        = process.env.WHOP_API_KEY;
const FTP_HOST       = process.env.FTP_HOST;
const FTP_USER       = process.env.FTP_USER;
const FTP_PASS       = process.env.FTP_PASS;
const FTP_REMOTE_DIR = process.env.FTP_REMOTE_DIR || '/www/';

if (!API_KEY) {
  console.error('❌ WHOP_API_KEY manquant dans .env');
  process.exit(1);
}

// ── Mapping user_id → identité affichée ───────────────────────────────────────
// Ajoute ici les nouveaux membres au fur et à mesure
const USER_MAP = {
  'user_M8Ul9lyUVTztJ': { name: 'Bacha ahmed yacine', initial: 'B', color: 'blue'   },
  'user_yvVcbH5Fop5s2': { name: 'Abdel',               initial: 'A', color: 'purple' },
  'user_qKZ3PWzOgRBhd': { name: 'Raphael',             initial: 'R', color: 'green'  },
  'user_tA1zdd3vGXW4B': { name: 'Membre Whop',         initial: 'M', color: 'orange' },
};

const COLOR_CYCLE = ['blue', 'purple', 'green', 'orange', 'teal', 'red'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.whop.com',
      path:     endpoint,
      method:   'GET',
      headers:  {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept':        'application/json',
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        try   { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error on ${endpoint}: ${raw.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function formatDate(unixTs) {
  if (!unixTs) return '';
  const d      = new Date(unixTs * 1000);
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function userInfo(userId, index) {
  if (USER_MAP[userId]) return USER_MAP[userId];
  // Utilisateur inconnu : génère une couleur et une initiale à partir de l'index
  return {
    name:    'Membre Whop',
    initial: 'M',
    color:   COLOR_CYCLE[index % COLOR_CYCLE.length],
  };
}

const SVG_CHECK = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function buildRevCard(review, index, ariaHidden = false) {
  const u    = userInfo(review.user_id, index);
  const date = formatDate(review.created_at);
  const aria = ariaHidden ? ' aria-hidden="true"' : '';
  return [
    `          <div class="rev"${aria}>`,
    `            <div class="rev__top"><div class="rev__stars">★★★★★</div><div class="rev__source">${SVG_CHECK}Whop</div></div>`,
    `            <div class="rev__ql">❝</div>`,
    `            <p>${review.description.replace(/\s*\n+\s*/g, ' ').trim()}</p>`,
    `            <div class="rev__author"><div class="rev__av rev__av--${u.color}">${u.initial}</div><div class="rev__info"><strong>${u.name}</strong><div class="rev__meta"><span class="rev__badge">✓ Membre vérifié</span>${date ? `<span class="rev__date">${date}</span>` : ''}</div></div></div>`,
    `          </div>`,
  ].join('\n');
}

// ── Script principal ──────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔄 SurgeonFXGroup — Mise à jour Whop');
  console.log('─'.repeat(40));

  // 1. Nombre de membres actifs
  const memberships  = await apiGet('/v5/company/memberships?status=active&per=1');
  const memberCount  = memberships.pagination?.total_count ?? 0;
  console.log(`✅ Membres actifs : ${memberCount}`);

  // 2. Avis Whop
  const reviewsRes   = await apiGet('/v5/company/reviews?per=25');
  const allReviews   = (reviewsRes.data || []).filter(r => r.description && r.description.trim().length > 10);
  const totalReviews = reviewsRes.pagination?.total_count ?? allReviews.length;
  console.log(`✅ Avis avec contenu : ${allReviews.length} (${totalReviews} total sur Whop)`);

  // 3. Lire index.html
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 4. Mettre à jour le nombre de membres
  html = html.replace(
    /<!-- WHOP:MEMBER_COUNT -->.*?<!-- \/WHOP:MEMBER_COUNT -->/gs,
    `<!-- WHOP:MEMBER_COUNT -->+${memberCount}<!-- /WHOP:MEMBER_COUNT -->`
  );

  // 5. Mettre à jour le compteur d'avis
  html = html.replace(
    /<!-- WHOP:REVIEW_COUNT -->.*?<!-- \/WHOP:REVIEW_COUNT -->/gs,
    `<!-- WHOP:REVIEW_COUNT -->${totalReviews}<!-- /WHOP:REVIEW_COUNT -->`
  );

  // 6. Reconstruire le slider d'avis (SET 1 + SET 2 dupliqué pour la boucle infinie)
  const set1 = allReviews.map((r, i) => buildRevCard(r, i, false)).join('\n\n');
  const set2 = allReviews.map((r, i) => buildRevCard(r, i, true )).join('\n\n');

  const newTrack =
    `\n          <!-- SET 1 -->\n${set1}\n\n` +
    `          <!-- SET 2 — duplicate pour boucle seamless -->\n${set2}\n\n        `;

  html = html.replace(
    /<!-- WHOP:REVIEWS_START -->[\s\S]*?<!-- WHOP:REVIEWS_END -->/,
    `<!-- WHOP:REVIEWS_START -->\n${newTrack}<!-- WHOP:REVIEWS_END -->`
  );

  // 7. Écrire index.html
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('✅ index.html mis à jour localement');

  // 8. Upload FTP vers OVH (si configuré dans .env)
  if (FTP_HOST && FTP_USER && FTP_PASS) {
    console.log(`\n📤 Upload FTP → ${FTP_HOST}${FTP_REMOTE_DIR}index.html`);
    const client = new ftp.Client(30000);
    client.ftp.verbose = false;
    try {
      await client.access({
        host:     FTP_HOST,
        user:     FTP_USER,
        password: FTP_PASS,
        secure:   false,
      });
      await client.uploadFrom(htmlPath, FTP_REMOTE_DIR + 'index.html');
      console.log('✅ Upload FTP terminé avec succès !');
    } catch (err) {
      console.error('❌ Erreur FTP :', err.message);
      console.error('   → Vérifie FTP_HOST / FTP_USER / FTP_PASS dans .env');
    } finally {
      client.close();
    }
  } else {
    console.log('\nℹ️  FTP non configuré dans .env — mise à jour locale uniquement.');
    console.log('   → Remplis FTP_HOST, FTP_USER, FTP_PASS dans .env pour activer l\'upload automatique.');
  }

  console.log('\n✨ Terminé !');
  console.log(`   → Membres    : +${memberCount}`);
  console.log(`   → Avis affichés : ${allReviews.length}`);
  console.log(`   → Avis total Whop : ${totalReviews}`);
  console.log('─'.repeat(40) + '\n');
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message);
  process.exit(1);
});
