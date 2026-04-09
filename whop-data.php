<?php
/**
 * whop-data.php — SurgeonFXGroup
 * ───────────────────────────────
 * Proxy sécurisé vers l'API Whop.
 * Appelé par le JavaScript de la page à chaque visite.
 * Résultat mis en cache 1 heure pour ne pas surcharger l'API.
 *
 * À déposer à la racine de ton hébergement OVH (même dossier qu'index.html).
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── Config ────────────────────────────────────────────────────────────────────
define('WHOP_API_KEY', 'apik_mxAZv6NeOwTgA_C3094589_C_5d916f47ffcce0da205ebb7ad044332a836c0dd3b62a759acd1f65fc98300c');
define('CACHE_FILE',   __DIR__ . '/whop-cache.json');
define('CACHE_TTL',    300); // secondes — met à jour au plus toutes les 5 minutes

// Cache désactivé — données récupérées en temps réel à chaque visite

// ── Appel API Whop ────────────────────────────────────────────────────────────
function whop_get($path) {
    $ch = curl_init('https://api.whop.com' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . WHOP_API_KEY,
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
    return json_decode($result, true);
}

// 1. Nombre de membres actifs
$memberships  = whop_get('/v5/company/memberships?status=active&per=1');
$member_count = isset($memberships['pagination']['total_count'])
    ? (int) $memberships['pagination']['total_count']
    : 0;

// 2. Avis Whop
$rev_data      = whop_get('/v5/company/reviews?per=25');
$all_reviews   = isset($rev_data['data']) ? $rev_data['data'] : [];
$reviews       = array_values(array_filter($all_reviews, function ($r) {
    return !empty($r['description']) && strlen(trim($r['description'])) > 10;
}));
$total_reviews = isset($rev_data['pagination']['total_count'])
    ? (int) $rev_data['pagination']['total_count']
    : count($reviews);

// ── Réponse JSON ──────────────────────────────────────────────────────────────
$output = json_encode([
    'member_count'  => $member_count,
    'total_reviews' => $total_reviews,
    'reviews'       => $reviews,
], JSON_UNESCAPED_UNICODE);

echo $output;
