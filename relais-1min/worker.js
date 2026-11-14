// Relais 1min.ai pour Dessin Animé Studio — Cloudflare Worker (offre gratuite suffisante)
// 1min.ai n'accepte les appels navigateur que depuis ses propres sites : ce relais transmet
// les requêtes de VOTRE application vers api.1min.ai et ajoute l'autorisation CORS.
//
// Sécurité :
//  - seules les origines listées ci-dessous peuvent utiliser le relais ;
//  - seules les adresses api.1min.ai et les fichiers générés (stockage 1min.ai) sont accessibles ;
//  - option recommandée : enregistrez votre clé 1min.ai comme secret ONEMIN_KEY dans Cloudflare,
//    elle ne sera alors jamais stockée dans le navigateur.

const ALLOWED_ORIGINS = [
  'https://aliand0810.github.io',
];
const FILE_HOSTS = /(^|\.)1min\.ai$|\.amazonaws\.com$|\.r2\.cloudflarestorage\.com$/;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'API-KEY, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const cors = corsHeaders(allowed ? origin : ALLOWED_ORIGINS[0]);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!allowed) return new Response(JSON.stringify({ message: 'Origine non autorisée : ' + origin }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } });

    const url = new URL(request.url);
    let target, headers = new Headers();

    if (url.pathname === '/' || url.pathname === '/ping') {
      return new Response(JSON.stringify({ ok: true, relais: '1min.ai', cleServeur: !!env.ONEMIN_KEY }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    } else if (url.pathname === '/file') {
      // téléchargement d'un fichier généré (vidéo, image) depuis le stockage 1min.ai
      let f;
      try { f = new URL(url.searchParams.get('url') || ''); } catch (e) { return new Response('Adresse invalide', { status: 400, headers: cors }); }
      if (f.protocol !== 'https:' || !FILE_HOSTS.test(f.hostname)) return new Response('Hôte non autorisé', { status: 400, headers: cors });
      target = f.toString();
    } else if (url.pathname.startsWith('/api/')) {
      target = 'https://api.1min.ai' + url.pathname + url.search;
      const key = env.ONEMIN_KEY || request.headers.get('API-KEY') || '';
      if (!key) return new Response(JSON.stringify({ message: 'Clé 1min.ai manquante' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
      headers.set('API-KEY', key);
      const ct = request.headers.get('Content-Type');
      if (ct) headers.set('Content-Type', ct);
    } else {
      return new Response('Introuvable', { status: 404, headers: cors });
    }

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    });
    const out = new Headers(upstream.headers);
    Object.entries(cors).forEach(([k, v]) => out.set(k, v));
    out.delete('set-cookie');
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
