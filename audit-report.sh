#!/usr/bin/env bash
# Pentest automatisé OWASP du front et du back.
# Usage depuis la racine :
#   ./audit-report.sh [URL_FRONT] [URL_BACK]
# Les URL sont facultatives. Elles activent le DAST OWASP ZAP si zap-baseline.py
# est installé. Ne scanner que des applications dont vous avez l'autorisation.
# Le rapport unique est écrit dans rapport-securite/rapport.md.

set -uo pipefail

ROOT="$(pwd -P)"
OUT="$ROOT/rapport-securite"
REPORT="$OUT/rapport.md"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/audit-report.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"
: > "$REPORT"

FRONT_URL="${1:-${FRONT_URL:-}}"
BACK_URL="${2:-${BACK_URL:-}}"
SCAN_URLS=()
[ -n "$FRONT_URL" ] && SCAN_URLS+=("frontend|$FRONT_URL")
[ -n "$BACK_URL" ] && SCAN_URLS+=("backend|$BACK_URL")

have() { command -v "$1" >/dev/null 2>&1; }
say() { printf '%s\n' "$*" >> "$REPORT"; }
rel() { printf '%s' "${1#"$ROOT"/}"; }

# Les dossiers explicitement nommés sont prioritaires. Sinon, le dépôt entier
# est utilisé, ce qui permet au script de rester utilisable sur un autre projet.
TARGETS=()
for candidate in frontend backend; do
  [ -d "$ROOT/$candidate" ] && TARGETS+=("$ROOT/$candidate")
done
[ "${#TARGETS[@]}" -eq 0 ] && TARGETS=("$ROOT")

EXCL=(
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist
  --exclude-dir=build --exclude-dir=coverage --exclude-dir=rapport-securite
)
INCL=(
  --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx'
  --include='*.mjs' --include='*.cjs' --include='.env*'
)

say "# Rapport de pentest automatisé"
say ""
say "- Dépôt : \`$ROOT\`"
say "- Composants audités : $(printf '%s, ' "${TARGETS[@]##"$ROOT"/}" | sed 's/, $//')"
say "- Date : $(date '+%Y-%m-%d %H:%M')"
say "- Commit : \`$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo 'n/a')\`"
say ""
say "> Type : pentest automatisé de boîte blanche (SAST, SCA, secrets, configuration et DAST optionnel). Les résultats sont des constats automatisés et doivent être confirmés manuellement avant qualification définitive."
if [ "${#SCAN_URLS[@]}" -eq 0 ]; then
  say "> DAST : non exécuté, aucune URL applicative fournie."
else
  say "> Cibles DAST : $(printf '%s, ' "${SCAN_URLS[@]}" | sed 's/, $//')"
fi
say ""

say "## 1. Synthèse exécutive"
say ""
say "Ce rapport présente les résultats du pentest automatisé réalisé sur le code source du front et du back, leurs dépendances, leurs secrets, leur configuration et, si configuré, leurs interfaces HTTP."
say ""
say "| Domaine | Contrôle | Résultat |"
say "|---|---|---|"
say "| SCA | Dépendances npm | Voir la section 2 |"
say "| SAST | Code JavaScript/TypeScript | Voir la section 3 |"
say "| Secrets | Gitleaks et motifs sensibles | Voir la section 4 |"
say "| DAST | Tests HTTP OWASP ZAP | Voir la section 5 |"
say "| Configuration | OWASP et bonnes pratiques | Voir la section 7 |"
say ""
say "**Limites :** ce rapport ne remplace pas un pentest manuel. Il ne garantit pas l'absence de vulnérabilité et ne doit pas être présenté comme une validation de sécurité complète sans revue humaine."
say ""

# ---------------------------------------------------------------------------
# 2. Dépendances : npm audit pour chaque package.json
# ---------------------------------------------------------------------------
say "## 2. Dépendances (OWASP A06 / A05)"
say ""
mapfile -t PKGS < <(
  find "${TARGETS[@]}" -name package.json -not -path '*/node_modules/*' | sort -u
)
if [ "${#PKGS[@]}" -eq 0 ]; then
  say "Aucun package.json trouvé."
else
  for pj in "${PKGS[@]}"; do
    d="$(dirname "$pj")"
    name="$(rel "$d")"
    tag="$(printf '%s' "$name" | tr '/ ' '__')"
    say "### \`$name\`"
    if [ ! -f "$d/package-lock.json" ]; then
      say "Pas de package-lock.json : exécuter \`yarn audit\` ou \`pnpm audit\` selon le gestionnaire utilisé."
      say ""
      continue
    fi
    audit="$TMP/npm-audit-$tag.json"
    (cd "$d" && npm audit --json > "$audit" 2>/dev/null) || true
    if have jq && [ -s "$audit" ]; then
      jq -r '.metadata.vulnerabilities // {} |
        "| Critique | Haute | Modérée | Faible | Info |\n|---|---|---|---|---|\n| \(.critical//0) | \(.high//0) | \(.moderate//0) | \(.low//0) | \(.info//0) |"' "$audit" >> "$REPORT"
      say ""
      say "Dépendances haute/critique :"
      jq -r '.vulnerabilities // {} | to_entries[] |
        select(.value.severity=="critical" or .value.severity=="high") |
        "- `\(.key)` (\(.value.severity))"' "$audit" | head -30 >> "$REPORT"
    else
      say "Résultat npm audit indisponible (vérifier le fichier package-lock.json et le réseau)."
    fi
    say ""
  done
fi

# ---------------------------------------------------------------------------
# 3. SAST Semgrep : OWASP, Node, React et règles de sécurité
# ---------------------------------------------------------------------------
say "## 3. Analyse statique SAST (OWASP A01-A10)"
say ""
if have semgrep; then
  semgrep scan --quiet \
    --config p/owasp-top-ten --config p/owasp-api-top-ten \
    --config p/nodejs --config p/react \
    --exclude node_modules --exclude dist --exclude build \
    --json -o "$TMP/semgrep.json" "${TARGETS[@]}" >/dev/null 2>&1 || true
  if have jq && [ -s "$TMP/semgrep.json" ]; then
    say "$(jq '.results | length' "$TMP/semgrep.json") résultat(s) Semgrep (50 premiers) :"
    jq -r '.results[] |
      "- [\(.extra.severity // "INFO")] `\(.check_id)` : \(.path):\(.start.line) - \(.extra.message // "voir le résultat Semgrep")"' \
      "$TMP/semgrep.json" | head -50 >> "$REPORT"
  else
    say "Aucun résultat Semgrep exploitable."
  fi
else
  say "Semgrep non installé (\`pipx install semgrep\`)."
fi
say ""

# ---------------------------------------------------------------------------
# 4. Secrets : Gitleaks
# ---------------------------------------------------------------------------
say "## 4. Secrets et informations sensibles (OWASP A02)"
say ""
if have gitleaks; then
  for target in "${TARGETS[@]}"; do
    name="$(rel "$target")"
    file="$TMP/gitleaks-$(printf '%s' "$name" | tr '/ ' '__').json"
    gitleaks detect --source "$target" --redact --no-banner \
      --report-format json --report-path "$file" >/dev/null 2>&1 || true
    if have jq && [ -s "$file" ]; then
      say "### \`$name\`"
      say "$(jq 'length' "$file") secret(s) potentiel(s) (valeurs masquées) :"
      jq -r '.[] | "- `\(.RuleID)` : \(.File):\(.StartLine)"' "$file" | head -30 >> "$REPORT"
    else
      say "- \`$name\` : aucun secret détecté par Gitleaks."
    fi
  done
else
  say "Gitleaks non installé."
fi
say ""

# ---------------------------------------------------------------------------
# 5. DAST OWASP ZAP : tests HTTP non destructifs
# ---------------------------------------------------------------------------
say "## 5. Test dynamique DAST (OWASP Top 10 et API Security)"
say ""
if [ "${#SCAN_URLS[@]}" -eq 0 ]; then
  say "DAST non exécuté : fournir les URL en arguments, par exemple :"
  say "\`./audit-report.sh http://localhost:3000 http://localhost:4000\`"
elif have zap-baseline.py; then
  for item in "${SCAN_URLS[@]}"; do
    IFS='|' read -r name url <<< "$item"
    zap_file="$TMP/zap-$name.md"
    say "### \`$name\` — \`$url\`"
    zap-baseline.py -t "$url" -J "$TMP/zap-$name.json" -r "$zap_file" \
      -m 5 >/dev/null 2>&1 || true
    if [ -s "$zap_file" ]; then
      sed -n '1,160p' "$zap_file" >> "$REPORT"
    else
      say "Aucun rapport ZAP exploitable pour cette cible."
    fi
    say ""
  done
else
  say "OWASP ZAP non installé. Installer zap-baseline.py ou utiliser l'image officielle ZAP."
fi
say ""

# ---------------------------------------------------------------------------
# 6. Trivy : vulnérabilités, secrets et configuration
# ---------------------------------------------------------------------------
say "## 6. Vulnérabilités et configuration (OWASP A05 / A06)"
say ""
if have trivy; then
  for target in "${TARGETS[@]}"; do
    name="$(rel "$target")"
    say "### \`$name\`"
    trivy fs --quiet --scanners vuln,secret,misconfig \
      --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
      "$target" > "$TMP/trivy-$(printf '%s' "$name" | tr '/ ' '__').txt" 2>/dev/null || true
    say '```text'
    head -120 "$TMP/trivy-$(printf '%s' "$name" | tr '/ ' '__').txt" >> "$REPORT"
    say '```'
  done
else
  say "Trivy non installé."
fi
say ""

# ---------------------------------------------------------------------------
# 7. Motifs conservés et complétés : injection, XSS, auth, SSRF, config
# ---------------------------------------------------------------------------
say "## 7. Motifs à risque (OWASP A01, A03, A04, A07, A08, A09, A10)"
say ""
say "| Motif | Sévérité indicative | Occurrences |"
say "|---|---|---|"
PATTERNS=(
  "eval() / new Function|Élevée|\beval\(|new Function\("
  "Exécution de commandes|Élevée|child_process|\bexec(Sync)?\(|spawn(Sync)?\("
  "Secret codé en dur|Élevée|(secret|password|passwd|api[_-]?key|access[_-]?token)[a-z_]*\s*[:=]\s*['\"][^'\"]{6,}['\"]"
  "Requête SQL concaténée|Élevée|(select|insert|update|delete)[^;]*(\+|\\$\{)"
  "Injection NoSQL possible|Élevée|\\\$where|find(One)?\(\s*req\.(body|query)"
  "JWT faible ou non vérifié|Élevée|jwt\.decode\(|algorithms?:\s*\[?['\"]none|verify\s*\([^)]*\)"
  "TLS désactivé|Élevée|rejectUnauthorized:\s*false|NODE_TLS_REJECT_UNAUTHORIZED"
  "SSRF possible|Élevée|(axios|fetch|request)\s*\(\s*(req\.|.*req\.(query|body|params))"
  "XSS React|Moyenne|dangerouslySetInnerHTML"
  "innerHTML direct|Moyenne|\.innerHTML\s*="
  "Token dans stockage navigateur|Moyenne|(localStorage|sessionStorage)\.(setItem|getItem)\([^)]*(token|jwt|auth)"
  "CORS permissif|Moyenne|origin:\s*['\"]\*['\"]|cors\(\s*\)"
  "Redirection ouverte|Moyenne|res\.redirect\(\s*req\.(query|body|params)"
  "Variable publique sensible|Moyenne|(REACT_APP|VITE|NEXT_PUBLIC)_[A-Z_]*(KEY|SECRET|TOKEN|PASSWORD)"
  "Source maps activées|Info|GENERATE_SOURCEMAP|sourcemap:\s*true"
  "Logs de données sensibles|Moyenne|console\.(log|debug|info)\([^)]*(password|token|secret|authorization)"
)
DETAILS="$TMP/patterns-details.md"
: > "$DETAILS"
for p in "${PATTERNS[@]}"; do
  IFS='|' read -r title severity regex <<< "$p"
  regex="${p#*|*|}"
  matches="$(
    grep -RInEi "${EXCL[@]}" "${INCL[@]}" -e "$regex" "${TARGETS[@]}" 2>/dev/null |
      cut -d: -f1,2 | sed "s|^$ROOT/||" || true
  )"
  count="$(printf '%s\n' "$matches" | grep -c . || true)"
  say "| $title | $severity | $count |"
  if [ "$count" -gt 0 ]; then
    {
      printf '### %s (%s)\n\n' "$title" "$severity"
      printf '%s\n' "$matches" | head -15 | sed 's/^/- `/; s/$/`/'
      printf '\n'
    } >> "$DETAILS"
  fi
done
say ""
say "### Détail des occurrences (15 maximum par motif)"
cat "$DETAILS" >> "$REPORT"
say ""

# ---------------------------------------------------------------------------
# 8. Contrôles de configuration applicative et dépôt
# ---------------------------------------------------------------------------
say "## 8. Vérifications de configuration et contrôles OWASP"
say ""
check() {
  if [ "$2" -eq 0 ]; then say "- [x] $1"; else say "- [ ] $1"; fi
}
has_dep() {
  grep -rqs --include=package.json --exclude-dir=node_modules "\"$1\"" "${TARGETS[@]}"
}
if has_dep express; then
  has_dep helmet; check "Helmet présent (en-têtes de sécurité)" $?
  has_dep express-rate-limit; check "Rate limiting présent" $?
  has_dep cors; check "CORS déclaré (origines à vérifier manuellement)" $?
fi
{ has_dep zod || has_dep joi || has_dep yup || has_dep express-validator; }
check "Validation des entrées (zod, joi, yup ou express-validator)" $?
{ has_dep bcrypt || has_dep bcryptjs || has_dep argon2; }
check "Hachage de mots de passe robuste (bcrypt/argon2)" $?
{ has_dep jsonwebtoken || has_dep jose; }
check "Bibliothèque JWT identifiée (algorithme et expiration à vérifier)" $?
{ has_dep helmet || has_dep '@fastify/helmet'; }
check "Protection des en-têtes HTTP" $?

if [ -f "$ROOT/.gitignore" ] && grep -q '\.env' "$ROOT/.gitignore"; then r=0; else r=1; fi
check ".env ignoré par git" "$r"
if git -C "$ROOT" ls-files 2>/dev/null | grep -qE '(^|/)\.env($|\.)'; then r=1; else r=0; fi
check "Aucun fichier .env versionné" "$r"
if find "${TARGETS[@]}" -type f \( -name Dockerfile -o -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) -print -quit | grep -q .; then
  check "Fichiers conteneur présents : vérifier utilisateur non-root, secrets et ports" 0
else
  check "Configuration conteneur à examiner (Dockerfile/compose absent)" 1
fi
say ""

# ---------------------------------------------------------------------------
# 9. Constats et remédiation post-pentest
# ---------------------------------------------------------------------------
cat >> "$REPORT" <<'EOF'
## 9. Constats du pentest automatisé

Les lignes listées dans les sections précédentes constituent les preuves techniques générées par les outils. Chaque constat doit être trié par sévérité, reproduit et validé par un auditeur avant d'être déclaré comme vulnérabilité confirmée.

| ID | Titre | Composant | Sévérité | CVSS | Statut |
|----|-------|-----------|----------|------|--------|
| AUTO-01 | À qualifier à partir des résultats ci-dessus | front / back | À déterminer | À calculer | à confirmer |

### Fiche de constat post-pentest

**AUTO-XX : titre**
- Catégorie OWASP / CWE :
- Composant et endpoint :
- Description, prérequis et impact :
- Preuve d'exploitation ou sortie outil :
- Étapes de reproduction :
- Recommandation :
- Régression à tester :
- Références :

## 10. Plan de remédiation

1. Critique et élevée : secrets, injections, contrôle d'accès, dépendances vulnérables.
2. Moyenne : validation, CORS, XSS, journalisation et configuration.
3. Rejouer le pentest automatisé après chaque correction et compléter les tests fonctionnels.

## 11. Conclusion et limites

Ce document est un rapport post-exécution du pentest automatisé à la date indiquée. Une conclusion « absence de vulnérabilité » est interdite sur la seule base de ces contrôles : les contrôles d'accès métier, la logique applicative, les scénarios authentifiés, la sécurité de l'infrastructure et les faux positifs nécessitent une analyse humaine.
EOF

echo "Rapport généré : $REPORT"
