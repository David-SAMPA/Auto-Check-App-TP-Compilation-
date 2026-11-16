# Brief d'implémentation : Auto-Check

> À donner tel quel à l'agent IA chargé du code. Projet : TP de **Langages formels et compilation**, thème **reconnaissance de langage régulier**. Dossier de travail : `app-tp-automate` (projet **Vite + TypeScript déjà créé**).

> ## PÉRIMÈTRE : PHASE 1 = VERSION WEB UNIQUEMENT
> Tu produis **d'abord uniquement la version web** de l'application Auto-Check : c'est **toute** l'application décrite dans ce document (les trois écrans, les algorithmes, le dessin, les tests), qui **fonctionne dans un navigateur** (`npm run dev`, `npm run build`, `npm run preview`).
> **Tu ne produis PAS la version desktop.** Pas d'Electron, pas d'`electron-builder`, pas de dossier `electron/`, pas d'exécutable, pas d'icône `.ico`. La **phase 2 (desktop)** ne démarrera que lorsque l'utilisateur te l'autorisera **explicitement** dans un message ultérieur (voir §11).
> Il ne s'agit pas non plus du site vitrine (accueil / à propos / téléchargement) : il est hors de ce brief.
> **Base visuelle** : les **maquettes** dont l'utilisateur t'a donné le lien (§9.0) servent de base à la version web. Tu les **personnalises** pour obtenir une interface **purement web et responsive** : mobile, tablette et ordinateurs de toutes tailles d'écran (§9.6).

---

## 0. Consignes à l'agent (à lire en premier)

1. **Lis ce document en entier avant d'écrire la moindre ligne.** Il contient le contexte, les méthodes imposées par le cours, l'arborescence, les spécifications, les tests de référence et l'ordre de travail.
2. **Travaille dans le dossier existant `app-tp-automate`.** Ne crée pas un nouveau projet. Complète la configuration existante (`package.json`, `tsconfig.json`, `vite.config.ts`).
3. **Ne fais jamais `git push`.** Tu peux faire des commits locaux, un par jalon (§12), avec un message en français. Le nom d'auteur Git est déjà réglé par l'utilisateur.
4. **Avance par jalons** (§12). À la fin de chaque jalon : `npm test` et `npm run build` doivent passer, sinon tu corriges avant de continuer.
5. **Reste dans le périmètre.** N'ajoute aucune fonctionnalité non décrite ici. Si une décision manque, applique la décision par défaut de la §13 et note-la dans `README.md` (section « Hypothèses »).
6. **Les tests de référence (§8) font foi.** Si ton code les contredit, c'est ton code qui a tort, pas les tests. Ne modifie pas une valeur attendue pour faire passer un test.
7. **Écris tout le texte visible par l'utilisateur en français**, exactement comme indiqué (§9).
8. **Phase 1 uniquement (version web).** N'installe aucune dépendance Electron, ne crée aucun fichier lié à Electron, ne modifie pas `package.json` pour Electron. Écris le code pour qu'il passe ensuite en desktop **sans réécriture** (aucun accès réseau, aucune API propre au navigateur hors DOM et `localStorage` protégé par `try/catch`).
9. **Maquettes et responsive.** Étudie d'abord les maquettes (§9.0), puis réalise une interface web fidèle à leur identité mais **adaptée au web** : fluide, responsive, tactile (§9.6). C'est un critère d'acceptation à part entière.
10. **Arrête-toi à la fin du jalon 9.** Fais alors un compte rendu court (ce qui est fait, les hypothèses retenues, les points à confirmer) et **attends l'autorisation de l'utilisateur** avant la phase 2.

---

## 1. Contexte du projet

**Auto-Check** est une application, destinée à devenir une application de bureau Windows (phase 2) après une première version web (phase 1), réalisée par un groupe d'étudiants pour un TP de Langages formels et compilation. Elle permet à un utilisateur de :

1. saisir l'**alphabet** de son choix ;
2. saisir une **expression régulière**, vérifiée en arrière-plan selon des règles établies (toutes les formes d'expression régulière du cours doivent être prises en charge) ;
3. voir l'**automate** correspondant, construit puis **affiché** (dessin + table de transitions), puis **minimisé** ;
4. saisir un **mot** et savoir s'il **appartient** ou non au langage ;
5. voir la **séquence de configurations** qui explique pourquoi le mot est accepté ou refusé.

**Public** : étudiants et enseignants. **Ton** : sobre, pédagogique, rassurant.
**Livraison en deux phases.** *Phase 1 (maintenant)* : la **version web**, qui tourne dans un navigateur et se construit en site statique (`dist/`). *Phase 2 (plus tard, sur autorisation)* : la **version desktop**, un exécutable Electron lancé par double-clic **sans rien installer**, qui réutilise telle quelle l'interface et le code de la version web. Dans les deux cas : aucune base de données, aucun compte, aucune connexion réseau.

Le travail est évalué par un enseignant qui attend que les **méthodes du support de cours** soient suivies à la lettre (§2). Le projet est mené à plusieurs : le code doit être lisible, découpé en modules indépendants et testé.

---

## 2. Méthodes imposées par le support de cours (à respecter)

| Étape | Méthode du cours |
|---|---|
| Syntaxe des expressions | `ε`, symbole, union `\|`, concaténation, étoile `*`, parenthèses ; extensions `+` (une fois ou plus) et `?` (zéro ou une fois). Priorité : `*`, `+`, `?` > concaténation > `\|` ; associativité à gauche. `ab*` n'est pas `(ab)*`. |
| ER → AFN-ε | **Construction de Thompson** : états initial `i` et final `f`, transitions ε ; la concaténation **fusionne** l'état final du premier avec l'état initial du second. |
| AFN-ε → AFD | **ε-fermeture**, **Transiter(T, a)**, table **Dtran** ; états de l'AFD nommés **A, B, C…** (un état = un ensemble d'états de l'AFN). |
| Complétion | Un AFD est **complet** si chaque (état, lettre) a une transition ; sinon on ajoute un **état puits** non final qui boucle sur toutes les lettres. |
| Minimisation | **Partitions successives** : Π0 = {F, Q∖F}, on raffine jusqu'à stabilité, on fusionne chaque groupe. |
| Reconnaissance d'un mot | **Algorithme du support** : `q ← état initial` ; pour chaque lettre `q ← transition(q, lettre)` ; à la fin, répondre « oui » si `q ∈ F`, « non » sinon. |
| Configurations | Une configuration est un couple `(q, w)` (état courant, mot restant) ; `(q, aw) ⊢ (q', w)` ; un mot est accepté si `(q0, w) ⊢* (q, ε)` avec `q ∈ F`. |

**Trois méthodes de reconnaissance sont à programmer** et doivent toujours concorder : (1) l'algorithme du support, (2) la méthode des configurations, (3) le parcours de l'automate (chemin dans le graphe).

**Les mots sont testés sur l'AFD obtenu (complété si besoin).**

---

## 3. Exigences fonctionnelles

| Réf. | Exigence |
|---|---|
| E1 | Saisie libre de l'alphabet (symboles séparés par des virgules ou des espaces). |
| E2 | Saisie d'une expression régulière, validée en arrière-plan avec message d'erreur précis (cause et position). |
| E3 | Prise en charge de toutes les formes : `ε`, symbole, `\|`, concaténation (implicite), `*`, `+`, `?`, parenthèses. |
| E4 | Construction AFN-ε (Thompson) puis AFD (sous-ensembles). |
| E4b | Si l'AFD n'est pas complet, le programme le complète avec un état puits et le signale. |
| E5 | Affichage de l'automate : dessin SVG + table de transitions ; état initial pointé par une flèche d'entrée ; états finaux en double cercle. |
| E6 | Minimisation de l'AFD et affichage de l'automate minimal, avec les partitions Π0…Πn. |
| E7 | Test d'un mot sur l'AFD complété, avec les trois méthodes ; vérification que le mot n'utilise que des symboles de l'alphabet. |
| E8 | Affichage de la séquence de configurations et du chemin parcouru, surligné sur l'automate. |

---

## 4. Contraintes techniques

- **Langages** : TypeScript (mode `strict`), HTML, CSS. Pas de framework d'interface (pas de React/Vue) : **TypeScript « vanilla »** avec de petites fonctions de rendu.
- **Dépendances** : aucune dépendance d'exécution. En développement : `typescript`, `vite`, `vitest`. **N'installe ni `electron` ni `electron-builder`** (phase 2 seulement).
- **Séparation stricte** : les dossiers `model`, `regex` et `algo` **n'importent ni le DOM ni Electron** ; ce sont des fonctions **pures** (pas d'état global, pas d'effet de bord). Tout est testable avec Vitest dans l'environnement `node`.
- **Qualité** : pas de `any`, pas de `console.log` oublié, pas de code mort. Erreurs explicites. Commentaires courts en **français** ; identifiants en français **sans accents** (cohérents avec l'arborescence ci-dessous).
- **Sécurité UI** : n'insère jamais de saisie utilisateur avec `innerHTML` ; utilise `textContent` ou la création d'éléments.
- **Responsive** : mobile-first, voir §9.6. **Accessibilité** : voir §9.5.
- **Configuration Vite** : dans `vite.config.ts`, `base: './'` (le build doit pouvoir s'ouvrir depuis n'importe quel dossier ; ce réglage servira aussi à la phase 2).

---

## 5. Arborescence à créer (dans `app-tp-automate`)

> Phase 1 : crée tout **sauf** le dossier `electron/`, réservé à la phase 2.

```
app-tp-automate/
├─ index.html                      Point d'entrée HTML (conteneur #app, lang="fr", titre « Auto-Check », balise viewport)
├─ package.json                    Scripts : dev, build, preview, test (aucun script Electron en phase 1)
├─ tsconfig.json                   strict: true
├─ vite.config.ts                  base './' ; configuration Vitest (environment: 'node')
├─ README.md                       Installation, scripts, structure, hypothèses
├─ electron/                       PHASE 2 : NE PAS CRÉER pour l'instant
│  └─ main.cjs                     (fenêtre Electron, voir §11)
├─ public/
│  └─ favicon.svg                  Provisoire (le logo définitif sera fourni plus tard)
├─ src/
│  ├─ main.ts                      Démarre l'application (monte ui/app.ts)
│  ├─ model/
│  │  ├─ types.ts                  Types partagés (Automate, Transition, Noeud, résultats…)
│  │  └─ automate.ts               Utilitaires sur les automates (voir §7.1)
│  ├─ regex/
│  │  ├─ erreurs.ts                Codes d'erreur et messages en français
│  │  ├─ tokeniser.ts              Découpe l'expression en jetons (ignore les espaces)
│  │  ├─ analyseur.ts              Descente récursive → arbre syntaxique (AST)
│  │  ├─ validateur.ts             Valide l'alphabet et l'expression
│  │  └─ postfixe.ts               AST → notation postfixée (affichage et tests)
│  ├─ algo/
│  │  ├─ construction/
│  │  │  ├─ epsilon.ts             ε-fermeture et Transiter
│  │  │  ├─ thompson.ts            AST → AFN-ε
│  │  │  ├─ determinisation.ts     AFN-ε → AFD (sous-ensembles, table Dtran)
│  │  │  ├─ completion.ts          Ajout de l'état puits
│  │  │  └─ minimisation.ts        Partitions successives
│  │  ├─ reconnaissance/
│  │  │  ├─ algoSupport.ts         Méthode 1 : algorithme du cours
│  │  │  ├─ configurations.ts      Méthode 2 : séquence de configurations
│  │  │  ├─ parcoursAutomate.ts    Méthode 3 : chemin dans le graphe
│  │  │  └─ verdict.ts             Lance les 3 méthodes et compare
│  │  └─ pipeline.ts               Chaîne complète : alphabet + expression → tous les résultats
│  ├─ state/
│  │  └─ appState.ts               Magasin d'état minimal (abonnement/notification)
│  ├─ ui/
│  │  ├─ app.ts                    Coquille : barre d'étapes, navigation, thème
│  │  ├─ utils/
│  │  │  ├─ dom.ts                 Fonction de création d'éléments (sans innerHTML)
│  │  │  └─ format.ts              Mise en forme : ensembles, configurations, mots (ε)
│  │  ├─ composants/
│  │  │  ├─ stepper.ts             Barre d'étapes (actif, terminé, verrouillé)
│  │  │  ├─ message.ts             Boîtes succès / erreur / attention / info
│  │  │  ├─ onglets.ts             Onglets AFN-ε / AFD / AFD minimal
│  │  │  ├─ tableTransitions.ts    Table de transitions (→ initial, * final)
│  │  │  ├─ legende.ts             Légende du dessin
│  │  │  ├─ historique.ts          Historique des mots testés
│  │  │  └─ themeToggle.ts         Bascule clair / sombre
│  │  ├─ dessin/
│  │  │  ├─ layout.ts              Calcul des positions (pur, testable)
│  │  │  └─ dessinAutomate.ts      Génère le SVG d'un automate (+ surlignage du chemin)
│  │  └─ ecrans/
│  │     ├─ ecranLangage.ts        Écran 1
│  │     ├─ ecranAutomates.ts      Écran 2
│  │     └─ ecranTest.ts           Écran 3
│  └─ styles/
│     ├─ tokens.css                Variables de design (couleurs, espacements, rayons), thèmes clair/sombre
│     ├─ base.css                  Réinitialisation, typographie, focus visible
│     ├─ composants.css            Boutons, champs, messages, onglets, table
│     ├─ ecrans.css                Mise en page des trois écrans
│     ├─ responsive.css            Points de rupture et adaptations mobile / tablette / PC
│     └─ automate.css              Styles du dessin SVG (états, flèches, surlignage)
└─ tests/
   ├─ fixtures/
   │  └─ cas.ts                    Cas de référence (§8), partagés par les tests
   ├─ regex/        validateur.test.ts · analyseur.test.ts · postfixe.test.ts
   ├─ algo/         thompson.test.ts · determinisation.test.ts · completion.test.ts
   │                minimisation.test.ts · reconnaissance.test.ts · pipeline.test.ts
   └─ ui/           layout.test.ts   (logique de placement uniquement, sans DOM)
```

---

## 6. Modèle de données (`src/model/types.ts`)

```ts
export type Symbole = string;                 // exactement un caractère
export const EPSILON = 'ε';
export type EtatId = number;

export interface Transition { de: EtatId; symbole: Symbole; vers: EtatId; }  // symbole === EPSILON pour une transition spontanée

export interface EtatInfo {
  id: EtatId;
  nom: string;            // "0".."10" (AFN), "A","B".. (AFD), "p" (puits), "q0","q1".. (minimal)
  contenu?: string[];     // AFD : numéros des états AFN ; minimal : noms des états AFD fusionnés
  estPuits?: boolean;
}

export type TypeAutomate = 'AFN-ε' | 'AFD' | 'AFD complet' | 'AFD minimal';

export interface Automate {
  type: TypeAutomate;
  alphabet: Symbole[];    // ordre de saisie, sans doublon
  etats: EtatInfo[];
  initial: EtatId;
  finaux: EtatId[];
  transitions: Transition[];
}

export type Noeud =
  | { type: 'epsilon' }
  | { type: 'symbole'; symbole: Symbole }
  | { type: 'union'; gauche: Noeud; droite: Noeud }
  | { type: 'concat'; gauche: Noeud; droite: Noeud }
  | { type: 'etoile'; enfant: Noeud }
  | { type: 'plus'; enfant: Noeud }
  | { type: 'option'; enfant: Noeud };

export interface ErreurSaisie { code: string; message: string; position?: number; } // position : 1 = premier caractère
```

### 7.1 `model/automate.ts` (utilitaires purs)

`creerAutomate`, `nomEtat(auto, id)`, `transitionsDepuis(auto, id)`, `estFinal(auto, id)`, `estComplet(auto)`, `tableDeterministe(auto): Map<EtatId, Map<Symbole, EtatId>>` (pour un AFD), `etatsAccessibles(auto)`.

---

## 7. Spécifications des modules

### 7.2 Validation (`regex/`)

**Alphabet** : `validerAlphabet(saisie: string)` → `{ ok: true, symboles } | { ok: false, erreur }`.
Les symboles sont séparés par des virgules et/ou des espaces. Règles : au moins un symbole ; chaque symbole = **un seul caractère** ; pas de doublon ; interdits (réservés) : `| * + ? ( ) ε`.

**Expression** : `validerExpression(expression, alphabet)` → `{ ok: true, ast } | { ok: false, erreur }`. Les **espaces sont ignorés** (les positions restent celles de la saisie d'origine). Grammaire (descente récursive) :

```
expr    := terme ( '|' terme )*
terme   := facteur+                  (concaténation implicite, au moins un facteur)
facteur := base ( '*' | '+' | '?' )*
base    := SYMBOLE | 'ε' | '(' expr ')'
```

- Associativité à gauche pour l'union et la concaténation. **`a**` est valide** (équivalent à `a*`) : ne pas le refuser, ne pas le simplifier.
- On rapporte **la première erreur de gauche à droite**, avec sa **position 1-based**.

| Code | Situation | Message (exact) |
|---|---|---|
| `ALPHABET_VIDE` | aucun symbole | « Saisissez au moins un symbole. » |
| `SYMBOLE_LONG` | symbole de plus d'un caractère | « Chaque symbole doit être un seul caractère. » |
| `SYMBOLE_DOUBLON` | doublon | « Le symbole « a » apparaît deux fois. » |
| `SYMBOLE_RESERVE` | caractère réservé | « Le symbole « * » est réservé à la syntaxe des expressions. » |
| `EXPR_VIDE` | expression vide | « Saisissez une expression régulière. » |
| `CARACTERE_INCONNU` | caractère hors alphabet | « Le caractère « c » (position 4) n'appartient pas à l'alphabet. » |
| `PARENTHESE_NON_FERMEE` | `(` jamais fermée | « Parenthèse ouvrante sans parenthèse fermante (position 1). » |
| `PARENTHESE_NON_OUVERTE` | `)` sans `(` | « Parenthèse fermante sans parenthèse ouvrante (position 3). » |
| `PARENTHESES_VIDES` | `()` | « Parenthèses vides (position 1). » |
| `OPERATEUR_SANS_OPERANDE` | `*`, `+`, `?` sans opérande (début, après `(` ou `\|`) | « L'opérateur « * » (position 1) n'a rien à répéter. » |
| `UNION_SANS_OPERANDE` | `\|` sans opérande à gauche ou à droite | « L'union « \| » (position 1) a besoin d'une expression de chaque côté. » |
| `MOT_HORS_ALPHABET` | mot de test avec un symbole inconnu | « Le mot contient un symbole qui n'est pas dans l'alphabet. » |

**Postfixe** : `versPostfixe(noeud): string`, avec `.` pour la concaténation explicite. Exemple : `(a|b)*abb` → `ab|*a.b.b.`.

### 7.3 Construction de Thompson (`algo/construction/thompson.ts`)

`construireAfnEpsilon(ast: Noeud, alphabet: Symbole[]): Automate`

Principe : fonction interne `construire(noeud, debutImpose?) → { i, f }` avec un compteur d'états incrémental. **L'ordre d'allocation des numéros est imposé** pour retrouver exactement la numérotation du cours :

- `symbole a` : `i = debutImpose ?? nouvel état` ; `f = nouvel état` ; transition `i -a-> f`.
- `epsilon` : comme `symbole`, avec une transition ε.
- `union(r, s)` : `i = debutImpose ?? nouvel état` ; construire `r`, puis `s` (états frais) ; `f = nouvel état` ; ε : `i→r.i`, `i→s.i`, `r.f→f`, `s.f→f`.
- `concat(r, s)` : construire `r` (avec `debutImpose`) puis `s` avec **`debutImpose = r.f`** (fusion) ; résultat `{ i: r.i, f: s.f }`.
- `etoile(r)` : `i = debutImpose ?? nouvel état` ; construire `r` (états frais) ; `f = nouvel état` ; ε : `i→r.i`, `r.f→f`, `i→f`, `r.f→r.i`.
- `plus(r)` = `concat(r, etoile(r))` (construire `r` deux fois, états distincts).
- `option(r)` = `union(r, epsilon)`.

Résultat : `initial = i`, `finaux = [f]`, états nommés par leur numéro (`"0"`, `"1"`…). **Pour `(a|b)*abb` : exactement 11 états (0 à 10), voir §8.2.**

### 7.4 ε-fermeture et déterminisation

`epsilon.ts` : `fermetureEpsilon(auto, ensemble: Set<EtatId>): Set<EtatId>` ; `transiter(auto, ensemble, symbole): Set<EtatId>` (mouvements directs seulement, sans fermeture).

`determinisation.ts` : `determiniser(afn): { afd: Automate; etapes: EtapeDtran[] }`.
- État de départ = `fermetureEpsilon({initial})`. File de traitement FIFO ; pour chaque ensemble et chaque lettre **dans l'ordre de l'alphabet**, calculer `fermetureEpsilon(transiter(...))`. Un ensemble vide ne crée **aucun** état (transition absente).
- Noms **A, B, C…** par ordre de découverte (au-delà de Z : `A1`, `B1`…). `contenu` = numéros AFN triés croissant.
- Un état est final s'il contient l'état final de l'AFN.
- `EtapeDtran = { nom, contenu: number[], transitions: Record<Symbole, string | null> }` (sert à afficher la table Dtran).

### 7.5 Complétion (`completion.ts`)

`completer(afd): { automate: Automate; puitsAjoute: boolean }`. S'il manque au moins une transition : ajouter l'état `p` (`estPuits: true`, non final, `id` = max + 1), boucles sur toutes les lettres, et rediriger toutes les transitions manquantes vers lui. Type du résultat : `'AFD complet'`. Sinon, renvoyer l'AFD tel quel (`puitsAjoute: false`).

### 7.6 Minimisation (`minimisation.ts`)

`minimiser(afdComplet): { afdMinimal: Automate; partitions: string[][][]; correspondance: Record<string, string> }`

1. Retirer les états inaccessibles.
2. `Π0` = [finaux, non-finaux] (groupes vides omis, finaux en premier).
3. Raffiner : deux états restent ensemble si, pour **chaque lettre** (ordre de l'alphabet), leurs transitions arrivent dans le **même groupe** de la partition courante. Empiler chaque nouvelle partition dans `partitions` ; s'arrêter quand une partition est **identique à la précédente** (cette partition répétée est incluse : pour `(a|b)*abb`, `partitions.length === 4`).
4. Construire l'automate minimal : un état par groupe, nommés `q0, q1…` **par parcours en largeur depuis l'état initial** (lettres dans l'ordre de l'alphabet). `contenu` = noms des états fusionnés. `correspondance` : nom AFD → nom minimal.
5. L'automate minimal reste **complet** (l'état puits, s'il existe, est conservé). L'interface propose une option « Masquer l'état puits » pour le dessin.

### 7.7 Reconnaissance (`algo/reconnaissance/`)

Mot = chaîne de caractères ; mot vide = `""` (affiché `ε`).

- `reconnaitreAlgoSupport(afdComplet, mot) → { accepte: boolean; etatFinal: EtatId }` : traduction littérale de l'algorithme du cours (§2). Si une transition manque, **lever une erreur explicite** (« Automate non complet »).
- `suivreConfigurations(afdComplet, mot) → { configurations: { etat: EtatId; reste: string }[]; accepte: boolean }` et `formaterConfigurations(...)` → `(q0, aabb) ⊢ (q1, abb) ⊢ … ⊢ (q3, ε)` (états affichés par leur nom ; reste vide affiché `ε`).
- `parcourirAutomate(auto, mot) → { accepte: boolean; etats: EtatId[]; transitions: Transition[] }` : **implémentation indépendante des deux autres**, fondée sur la **liste des transitions** (graphe) et non sur la table `delta` ; renvoie le chemin utilisé pour le surlignage. Pour un mot refusé, renvoyer le chemin parcouru jusqu'au bout (ou jusqu'au blocage).
- `verdict(afdComplet, mot) → { accepte; methodes: { nom: 'Algorithme du cours' | 'Configurations' | 'Parcours de l'automate'; accepte: boolean }[]; concordance: boolean; configurations; chemin }`. `concordance` est faux si les trois réponses diffèrent (c'est un défaut du programme à signaler visiblement).
- Vérification préalable : tout symbole du mot doit appartenir à l'alphabet (`MOT_HORS_ALPHABET`), avant d'appeler les méthodes.

### 7.8 Pipeline (`algo/pipeline.ts`)

`construireTout(alphabetSaisie: string, expression: string)` renvoie :

```ts
| { ok: false; erreur: ErreurSaisie }
| {
    ok: true;
    alphabet: Symbole[];
    ast: Noeud;
    postfixe: string;
    afnEpsilon: Automate;
    etapesDtran: EtapeDtran[];
    afd: Automate;              // avant complétion
    afdComplet: Automate;       // utilisé pour tester les mots
    puitsAjoute: boolean;
    afdMinimal: Automate;
    partitions: string[][][];
    resume: { etatsAfn: number; etatsAfd: number; etatsAfdComplet: number; etatsMinimal: number };
  }
```

---

## 8. Jeu de tests de référence (obligatoire)

Les tests vivent dans `tests/` et s'appuient sur `tests/fixtures/cas.ts`. **Comparer les ensembles et les partitions sans tenir compte de l'ordre.**

### 8.1 Validation

| Alphabet | Expression | Résultat attendu |
|---|---|---|
| `a, b` | `(a\|b)*abb`, `a*b`, `(ab)*`, `a+b?`, `a**`, `ε`, `(a\|b)+` | valide |
| `0, 1` | `(0\|1)*1` | valide |
| `a, b` | `(a\|b` | `PARENTHESE_NON_FERMEE`, position 1 |
| `a, b` | `\|a` | `UNION_SANS_OPERANDE`, position 1 |
| `a, b` | `a\|` | `UNION_SANS_OPERANDE`, position 2 |
| `a, b` | `*a` | `OPERATEUR_SANS_OPERANDE`, position 1 |
| `a, b` | `()` | `PARENTHESES_VIDES`, position 1 |
| `a, b` | `a)` | `PARENTHESE_NON_OUVERTE`, position 2 |
| `a, b` | `abc` | `CARACTERE_INCONNU`, position 3 |
| `a, b` | *(vide)* | `EXPR_VIDE` |
| *(vide)* | `a` | `ALPHABET_VIDE` |
| `a, a` | `a` | `SYMBOLE_DOUBLON` |
| `ab` | `a` | `SYMBOLE_LONG` |

### 8.2 Exemple du cours : `(a|b)*abb` sur `{a, b}`

- **Postfixe** : `ab|*a.b.b.`
- **AFN-ε** : 11 états (0 à 10), initial 0, final 10, transitions exactement :

| Depuis | ε vers | Lettre |
|---|---|---|
| 0 | 1, 7 | |
| 1 | 2, 4 | |
| 2 | | `a` → 3 |
| 3 | 6 | |
| 4 | | `b` → 5 |
| 5 | 6 | |
| 6 | 1, 7 | |
| 7 | | `a` → 8 |
| 8 | | `b` → 9 |
| 9 | | `b` → 10 |

- **AFD** : 5 états, initial A, final E. A={0,1,2,4,7}, B={1,2,3,4,6,7,8}, C={1,2,4,5,6,7}, D={1,2,4,5,6,7,9}, E={1,2,4,5,6,7,10}.

| Dtran | a | b |
|---|---|---|
| →A | B | C |
| B | B | D |
| C | B | C |
| D | B | E |
| \*E | B | C |

- **Complétion** : `puitsAjoute === false`.
- **Partitions** : Π0 = {{E},{A,B,C,D}} ; Π1 = {{E},{A,B,C},{D}} ; Π2 = {{E},{D},{A,C},{B}} ; Π3 = Π2 ; `partitions.length === 4`.
- **AFD minimal** : 4 états ; `q0={A,C}` (initial), `q1=B`, `q2=D`, `q3=E` (final) ; transitions : q0 : a→q1, b→q0 ; q1 : a→q1, b→q2 ; q2 : a→q1, b→q3 ; q3 : a→q1, b→q0.
- **Résumé** : 11 → 5 → 4 états.
- **Mots** : acceptés `abb`, `aabb`, `babb`, `ababb` ; refusés `ab`, `abba`, `ε` (mot vide).
- **Configurations de `aabb`** : `(q0, aabb) ⊢ (q1, abb) ⊢ (q1, bb) ⊢ (q2, b) ⊢ (q3, ε)` ; **de `abba`** : `(q0, abba) ⊢ (q1, bba) ⊢ (q2, ba) ⊢ (q3, a) ⊢ (q1, ε)` (refusé).

### 8.3 Autres langages

| Expression | Alphabet | Acceptés | Refusés |
|---|---|---|---|
| `a*b` | a, b | `b`, `aab` | `a`, `ba` |
| `(ab)*` | a, b | `ε`, `ab`, `abab` | `a`, `aba`, `ba` |
| `a+b?` | a, b | `a`, `aaa`, `ab`, `aab` | `b`, `abb` |
| `(0\|1)*1` | 0, 1 | `1`, `01`, `101` | `ε`, `10` |
| `a(ab\|a)*b` | a, b | `ab`, `aab`, `aaab`, `aabb` | `a`, `b`, `abb` |
| `a*bc+` | a, b, c | `bc`, `abcc`, `aabc` | `b`, `ac`, `bcb` |
| `a(b\|c)*` | a, b, c | `a`, `abcb`, `ac` | `ba`, `aa` |
| `ab` | a, b | `ab` | `a`, `b`, `abb`, `ba` |

### 8.4 Invariants (tests de propriété)

- **Complétion** : `ab` sur `{a,b}` → `puitsAjoute === true` ; l'automate complet est total (`estComplet`).
- **Nombre d'états de l'AFD minimal complet** : `(a|b)*abb` → 4 ; `(ab)*` → 3 ; `a*b` → 3 ; `ab*` → 3 ; `(0|1)*1` → 2 ; `ab` → 4.
- **`a*`** sur `{a,b}` : accepte `ε`, `aaa` ; refuse `b`, `ab` ; l'état initial de l'AFD est aussi final.
- **Concordance** : pour **tous** les mots des tableaux ci-dessus, les trois méthodes donnent la même réponse (`concordance === true`) et l'AFD minimal reconnaît les mêmes mots que l'AFD complet.
- **Placement** (`layout.test.ts`) : tous les états ont une position, aucune paire d'états n'est à moins de 2 rayons de distance.

---

## 9. Interface

### 9.0 Maquettes de référence et adaptation au web

- L'utilisateur t'a donné un **lien vers les maquettes** : **[LIEN_DES_MAQUETTES]**. **Ouvre-le et étudie-le en premier.** S'il est inaccessible, demande-le-lui avant d'attaquer l'interface (jalon 6) ; les jalons 1 à 5 ne dépendent pas des maquettes.
- Ces maquettes (trois écrans, thèmes clair et sombre) sont ta **référence visuelle** : logo, palette, typographie, composition des écrans, composants, états (succès, erreur, attention) et textes. Tu les utilises comme **base de la version web**.
- **Tu ne les copies pas telles quelles : tu les personnalises pour que le résultat soit purement du web.**
  - Retire tout ce qui appartient à une fenêtre de bureau : barre de titre, boutons réduire / agrandir / fermer, taille de fenêtre figée.
  - Utilise un **en-tête web** (logo et nom, barre d'étapes, bascule de thème) ; la page **défile naturellement** en hauteur.
  - Mise en page **fluide et responsive** (§9.6), sur mobile, tablette et ordinateurs de toutes tailles d'écran.
  - Interactions web : clavier, souris et **tactile** ; aucune fonction réservée au survol.
- **Priorité en cas de divergence** : pour l'**apparence** (couleurs, composition, composants), les maquettes l'emportent ; pour le **comportement, les textes, les algorithmes et les tests**, ce brief l'emporte. Les valeurs de la §9.5 restent les tokens par défaut quand une valeur manque dans les maquettes.
- Si les maquettes contiennent aussi une **page vitrine** (accueil, à propos, téléchargement), **ne la réalise pas** : elle est hors de ce brief.
- Refais les maquettes en HTML/CSS propre, écrit à la main ; n'essaie pas de les convertir automatiquement.

### 9.1 Structure commune

Mise en page **purement web et responsive** (§9.0 et §9.6) : aucune notion de « fenêtre d'application » (ni barre de titre, ni boutons de fenêtre, ni dimensions fixes) ; la page défile naturellement en hauteur et s'adapte à toutes les largeurs d'écran. En-tête : logo provisoire + nom « Auto-Check », **barre d'étapes** (1 Langage, 2 Automates, 3 Test) avec états *actif*, *terminé*, *verrouillé* (grisé et non cliquable tant que l'étape précédente n'est pas valide). Pied : boutons *Précédent* / *Suivant*. Bascule de thème clair/sombre (préférence mémorisée dans un `try/catch`, par défaut : préférence du système).

### 9.2 Écran 1 : Langage (`ecranLangage.ts`)

- Champs « Alphabet » (exemple affiché : `a, b`) et « Expression régulière » (exemple : `(a|b)*abb`), en police monospace.
- **Validation en arrière-plan** (à chaque modification, avec un léger délai) + bouton « Valider ». Message sous les champs :
  - **Succès** : « Expression valide » avec icône ;
  - **Erreur** : le message de la §7.2 avec la position ; le caractère fautif est **souligné en rouge** dans un aperçu de l'expression sous le champ.
- Rappel de la syntaxe : `|` (union), `*` (étoile), `+` (une fois ou plus), `?` (optionnel), parenthèses, `ε`.
- Exemples cliquables (puces) : `(a|b)*abb`, `a*b`, `(ab)*` : ils remplissent les champs.
- Bouton principal « Construire l'automate », **désactivé** tant que l'alphabet et l'expression ne sont pas valides ; il lance `construireTout` et passe à l'écran 2.

### 9.3 Écran 2 : Automates (`ecranAutomates.ts`)

- Onglets : **AFN-ε**, **AFD** (affiche l'AFD complété), **AFD minimal**.
- Grande zone de dessin SVG (§10) avec boutons de zoom (+, −, Réinitialiser).
- À droite : **table de transitions** (flèche `→` devant l'état initial, `*` devant les états finaux) ; pour l'AFD, un bloc « Composition » (`A = {0, 1, 2, 4, 7}`…) ; pour l'AFD minimal, un bloc « Partitions » (Π0…Πn).
- **Résumé** : « 5 états → 4 états après minimisation ».
- **Légende** : flèche = état initial, double cercle = état final.
- **Bandeau d'attention** (si `puitsAjoute`) : « AFD complété : état puits p ajouté ». Case à cocher « Masquer l'état puits » (dessin seulement).
- Boutons « Précédent » et « Tester un mot ».

### 9.4 Écran 3 : Test d'un mot (`ecranTest.ts`)

- Rappel du langage en haut (expression + alphabet).
- Champ « Mot » (monospace ; champ vide ou `ε` = mot vide) et bouton « Tester » (Entrée valide aussi).
- **Résultat en grand** :
  - succès : « **aabb** appartient au langage » ;
  - échec : « **abba** n'appartient pas au langage » ;
  - saisie invalide : « Le mot contient un symbole qui n'est pas dans l'alphabet. » (message d'erreur).
- **Séquence de configurations** en monospace.
- **Trois pastilles** (une par méthode : « Algorithme du cours », « Configurations », « Parcours de l'automate »), chacune avec ✓ ou ✗. Si `concordance === false` : bandeau d'erreur « Les trois méthodes ne donnent pas la même réponse : anomalie détectée. »
- Automate dessiné à côté, **chemin surligné** (couleur `--chemin`, trait épais).
- **Historique** des mots testés (✓ accepté, ✗ refusé, 20 maximum) ; un clic sur un mot le reteste.
- Boutons « Précédent » et « Nouveau langage » (réinitialise l'état et revient à l'écran 1).

### 9.5 Couleurs et design (`styles/tokens.css`)

Variables CSS sur `:root`, redéfinies pour le thème sombre (`[data-theme="dark"]` et `@media (prefers-color-scheme: dark)`).

| Rôle | Clair | Sombre |
|---|---|---|
| Fond page | `#F7F8FA` | `#0E1621` |
| Surface | `#FFFFFF` | `#161F2C` |
| Bordure | `#D0D5DD` | `#2A3646` |
| Texte principal | `#101828` | `#E6EAF0` |
| Texte secondaire | `#475467` | `#A9B4C4` |
| Accent | `#1F4E8C` | `#6EA8FE` |
| Fond d'accent | `#E8EFF8` | `#16283F` |
| **Succès** texte / fond / bordure | `#1E6B3A` / `#E3F4E8` / `#7BC096` | `#5FD38D` / `#12301F` / `#2F7A4C` |
| **Erreur** texte / fond / bordure | `#B3261E` / `#FDECEA` / `#F0A8A2` | `#FF8A80` / `#3A1715` / `#8A3A34` |
| **Attention** texte / fond | `#B35C00` / `#FFF3E0` | `#FFB74D` / `#3A2A10` |
| Chemin surligné | `#D97706` | `#F59E0B` |

Typographie : sans-serif système (pile : `Inter`, `Segoe UI`, `system-ui`, `sans-serif`) ; monospace pour expressions, mots, configurations. Grille de 8 px ; coins arrondis 8 px (12 px pour les cartes) ; ombres légères.

**Accessibilité** : contraste AA ; **jamais la couleur seule** (toujours icône + texte pour succès/erreur) ; `:focus-visible` toujours visible ; champs avec `<label>` ; messages d'erreur en `role="alert"`, succès en `role="status"` ; navigation entièrement au clavier ; boutons désactivés avec `disabled` et explication visible.

### 9.6 Responsive : mobile, tablette, ordinateurs

Approche **mobile-first** (règles de base pour le mobile, puis `@media (min-width: …)` pour agrandir). Balise `<meta name="viewport" content="width=device-width, initial-scale=1">` dans `index.html`.

| Famille | Largeur | Comportement attendu |
|---|---|---|
| **Mobile** | 320 à 599 px (cibles : 360 et 390) | Une seule colonne. Barre d'étapes compacte (numéros seuls, libellé de l'étape active). **Barre d'actions collante en bas** (Précédent / Suivant en pleine largeur, avec `env(safe-area-inset-bottom)`). Onglets défilables horizontalement. Table et dessin dans des conteneurs à défilement interne. |
| **Tablette** | 600 à 1023 px (cibles : 768 et 820, portrait et paysage) | Écran 1 centré (largeur max d'environ 640 px). Écran 2 : dessin pleine largeur, puis table, composition et partitions dessous. Écran 3 : saisie et résultat, puis dessin dessous. |
| **Ordinateur** | 1024 à 1439 px (cibles : 1024 et 1280) | Deux colonnes. Écran 2 : dessin (environ deux tiers) + panneau latéral (table, composition, partitions, résumé). Écran 3 : saisie, résultat, configurations et historique à gauche ; dessin à droite. |
| **Grand écran** | 1440 px et plus (cibles : 1440 et 1920) | Même disposition que l'ordinateur ; **contenu centré avec une largeur maximale (environ 1360 px)**, sans étirement excessif. |

Règles transversales :
- **Aucun défilement horizontal de la page**, de 320 à 1920 px. Seuls les tables, le dessin SVG, les onglets et les séquences de configurations défilent horizontalement, **dans leur propre conteneur** (les configurations peuvent aussi passer à la ligne).
- Unités relatives, typographie fluide avec `clamp()`, `min-width: 0` sur les enfants de grilles et de flex pour éviter les débordements.
- **Tactile** : cibles d'au moins **44×44 px**, espacement suffisant ; tout est utilisable au doigt, à la souris et au clavier ; les effets de survol ne sont qu'un **plus** (`@media (hover: hover)`).
- Champs de saisie : taille de police d'au moins **16 px** sur mobile (évite le zoom automatique) ; sur l'alphabet, l'expression et le mot : `autocomplete="off"`, `autocapitalize="off"`, `spellcheck="false"`.
- Fonctionne en **portrait et en paysage**, aux deux thèmes (clair et sombre), et avec le **zoom du navigateur jusqu'à 200 %** sans perte de contenu.
- Respecter `prefers-reduced-motion` (pas d'animation superflue).
- **Largeurs à contrôler** : 320, 360, 390, 768, 820, 1024, 1280, 1440 et 1920 px.

---

## 10. Dessin de l'automate (`ui/dessin/`)

`layout.ts` (pur) : `calculerPositions(auto) → Map<EtatId, {x, y}>`.
- **Couches par parcours en largeur** depuis l'état initial (toutes les transitions) : `x = marge + profondeur × 130` ; dans une couche, états empilés verticalement (`y` espacés de 100). Les états non atteints sont placés après la dernière couche.
- Rayon des états : 22.

`dessinAutomate.ts` : `dessinerAutomate(auto, options) → SVGSVGElement` (options : `chemin?`, `masquerPuits?`).
- **État initial** : flèche d'entrée horizontale venant de la gauche, **s'arrêtant au bord du cercle**, avec le mot « initial » ; cercle teinté (accent).
- **États finaux** : **deux cercles concentriques** (rayon et rayon − 5), teinte de succès. Un état à la fois initial et final cumule flèche et double cercle.
- **État puits** : cercle gris, contour **pointillé**.
- **Transitions** : une seule flèche par couple (de, vers), **étiquettes regroupées** (`a, b`). Boucle au-dessus de l'état. Transition vers l'avant : trait droit. Transition de retour ou entre couches éloignées : **courbe de Bézier** en dessous de la ligne principale, avec des profondeurs différentes selon l'écart pour éviter les croisements. Transitions ε : étiquette `ε` en italique, trait en tirets.
- **Surlignage** : les états et transitions du `chemin` reçoivent la classe `.chemin` (couleur `--chemin`, trait de 3 px).
- Marqueurs de flèche (`<marker>`) définis dans le SVG ; `viewBox` calculée selon l'étendue ; `role="img"` avec `<title>` et `<desc>` décrivant l'automate.
- **Responsive** : le SVG occupe la largeur de son conteneur (`width: 100%`, hauteur selon la `viewBox`, hauteur minimale d'environ 240 px). Quand l'automate est plus large que l'écran, il défile **dans son conteneur** ; sur écran tactile, on le déplace au doigt, et les boutons de zoom (+, −, Réinitialiser) font au moins 44 px. Le pincement n'est pas obligatoire.

---

## 11. PHASE 2 : version desktop (Electron). NE PAS FAIRE sans autorisation explicite

> **Section de référence uniquement.** Ne rien implémenter de ce qui suit tant que l'utilisateur ne l'a pas demandé dans un message. Quand il le fera, la version desktop doit **réutiliser sans modification** le code de la version web (`src/`), Electron n'étant qu'une enveloppe.

- `electron/main.cjs` : fenêtre 1100×720 (minimum 900×600), titre « Auto-Check », menu masqué, `webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }`. En développement, charge l'URL du serveur Vite ; en production, charge `dist/index.html` (`loadFile`). Refuser toute navigation externe et toute ouverture de nouvelle fenêtre (`setWindowOpenHandler` → refus ; bloquer `will-navigate`).
- `package.json` : `"main": "electron/main.cjs"` ; scripts `electron:dev` (Vite lancé séparément, puis Electron) et `electron:build` (`vite build` puis `electron-builder --win`). Documente la procédure dans `README.md`.
- Configuration `electron-builder` : `appId` `com.autocheck.app`, `productName` « Auto-Check » ; cibles Windows **`portable`** et **`nsis`** ; **noms de fichiers fixes** (`auto-check-portable.exe`, `auto-check-setup.exe`) pour que le lien de téléchargement du site ne change jamais d'une version à l'autre (à ajuster selon la documentation d'electron-builder si la syntaxe diffère).
- L'icône définitive (`build/icon.ico`) sera fournie plus tard : laisse un emplacement et une note TODO, sans bloquer le build.

---

## 12. Jalons et critères d'acceptation

| # | Jalon | Critère d'acceptation |
|---|---|---|
| 0 | **Mise en place** : dépendances (`vitest`), scripts `dev`/`build`/`test`, `tsconfig` strict, `base: './'`, arborescence vide, `README.md` | `npm test` et `npm run build` passent (même sans test) |
| 1 | **Types + `regex/`** (§6, §7.2) | tests de validation §8.1 et postfixe `ab\|*a.b.b.` passent |
| 2 | **Thompson** (§7.3) | l'AFN de `(a\|b)*abb` correspond exactement au §8.2 (11 états, transitions listées) |
| 3 | **ε-fermeture + déterminisation** (§7.4) | AFD à 5 états A–E, `Dtran` du §8.2 |
| 4 | **Complétion + minimisation** (§7.5, §7.6) | partitions Π0–Π3, AFD minimal à 4 états ; invariants §8.4 |
| 5 | **Reconnaissance** (§7.7) + **pipeline** (§7.8) | mots et configurations du §8, **concordance** des 3 méthodes sur tous les mots |
| 6 | **Styles et composants** (§9.0, §9.5, §9.6, composants de base) | page statique fidèle aux maquettes et responsive (mobile, tablette, PC), avec les tokens, les thèmes clair et sombre, les messages succès/erreur |
| 7 | **Dessin SVG** (§10) | `layout.test.ts` passe ; dessin correct de l'AFN, de l'AFD et de l'AFD minimal de `(a\|b)*abb` |
| 8 | **Écrans 1, 2, 3** (§9) | parcours complet à la main **dans le navigateur** (`npm run dev`) : saisie → automates → test de `aabb` (accepté) et `abba` (refusé), chemin surligné ; le parcours fonctionne sur mobile (390 px), tablette (768 px) et ordinateur (1280 px) |
| 9 | **Finitions** : accessibilité, clavier, états vides/erreurs, `README.md` à jour | tous les messages de la §7.2 s'affichent correctement ; `npm run build` produit `dist/` et `npm run preview` l'affiche correctement ; **aucun défilement horizontal de la page** aux largeurs 320, 360, 390, 768, 820, 1024, 1280, 1440 et 1920 px (portrait et paysage pour mobile et tablette) ; **fin de la phase 1** |
| 10 | **PHASE 2 : Electron** (§11) | **Réservé : ne pas commencer sans autorisation explicite de l'utilisateur** |

**Étapes 1 à 5 : sans aucune interface graphique**, uniquement en code et en tests. Si elles sont justes, le reste est un habillage.

**La phase 1 s'arrête au jalon 9.** Ensuite : compte rendu, puis attente de l'autorisation de l'utilisateur pour la phase 2.

---

## 13. Décisions par défaut, hors périmètre, points à confirmer

**Décisions par défaut** (à noter dans le `README.md`) :
- `|` est l'union ; `+` signifie « une fois ou plus » (l'exercice du support utilise parfois `+` pour l'union : la notation reste **à confirmer avec l'enseignant** ; isoler ce choix dans une constante unique pour pouvoir le changer).
- L'AFD minimal est calculé à partir de l'AFD **complété** et reste complet.
- Les mots sont testés sur l'**AFD complété**.
- Positions des erreurs : numérotation à partir de 1.

**Hors périmètre** (ne pas faire) : **toute la version desktop (Electron, electron-builder, exécutable, icône `.ico`) tant que l'utilisateur ne l'a pas autorisée**, le site vitrine, classes de caractères `[a-z]`, ensemble vide `∅` dans la syntaxe, sauvegarde/chargement de fichiers, export d'images, comptes, réseau, base de données, internationalisation.

**Points à confirmer avec l'enseignant** (ne bloquent pas le code) : langage de programmation autorisé (TypeScript, puis Electron en phase 2), notation de l'union (`|` ou `+`), classes de caractères, affichage des ε-transitions dans l'AFN, date et format du rendu.

---

*Fin du brief. Commence par le jalon 0, enchaîne dans l'ordre jusqu'au jalon 9 inclus, puis arrête-toi et rends compte.*