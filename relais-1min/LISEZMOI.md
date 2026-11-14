# Relais 1min.ai — Dessin Animé Studio

1min.ai refuse les appels venant d'un navigateur, sauf depuis ses propres sites.
Ce petit relais gratuit (Cloudflare Worker) fait le lien entre l'application et l'API 1min.ai.

## Installation (5 minutes, une seule fois)

1. Créez un compte gratuit sur **dash.cloudflare.com**.
2. Menu **Workers & Pages** → **Create** → **Create Worker** → nommez-le `relais-1min` → **Deploy**.
3. **Edit code** : remplacez tout le contenu par celui de `worker.js`, puis **Deploy**.
4. Recommandé : **Settings** → **Variables and Secrets** → **Add** → type **Secret**,
   nom `ONEMIN_KEY`, valeur = votre clé API 1min.ai → **Deploy**.
   (La clé reste alors chez Cloudflare et n'est jamais enregistrée dans le navigateur.)
5. Copiez l'adresse du Worker (ex. `https://relais-1min.votre-nom.workers.dev`)
   et collez-la dans l'application : panneau du haut → **🧩 1min.ai** → **Adresse du relais**.

Si vous hébergez l'application ailleurs que sur `https://aliand0810.github.io`,
ajoutez son adresse dans `ALLOWED_ORIGINS` en haut de `worker.js`.
