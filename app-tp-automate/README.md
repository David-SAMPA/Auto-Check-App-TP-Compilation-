# Auto-Check

Application web pédagogique de construction, minimisation et parcours d'automates finis pour le TP de langages formels et compilation. Cette phase produit une application statique, sans service distant ni dépendance d'exécution.

## Installation et commandes

Prérequis : Node.js compatible avec Vite 8.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Le build est généré dans `dist/` et utilise des chemins relatifs pour pouvoir être servi depuis un sous-dossier. L'application propose trois étapes: définition du langage, visualisation de l'AFN-ε/AFD/AFD minimal, puis reconnaissance d'un mot avec trace et historique.

## Structure

- `src/model` : types et utilitaires purs sur les automates.
- `src/regex` : tokenisation, analyse syntaxique, validation et postfixe.
- `src/algo` : Thompson, déterminisation, complétion, minimisation et reconnaissance.
- `src/ui` et `src/styles` : écrans web, composants accessibles et dessin SVG.
- `tests` : cas de référence Vitest exécutés dans Node.js.

## Hypothèses

- `|` désigne l'union et `+` signifie « une fois ou plus »; cette notation devra être confirmée auprès de l'enseignant.
- La minimisation part de l'AFD complété; les mots sont évalués sur cet automate complet.
- Les positions dans les messages d'erreur commencent à 1.
- L'interface n'a qu'un thème clair, volontairement sobre et sans effets décoratifs.
- L'interface est conçue mobile-first; les dessins et tableaux larges défilent à l'intérieur de leur propre conteneur.

La version desktop, Electron et le site vitrine sont hors périmètre de cette phase. Le code algorithmique ne dépend pas du DOM et reste séparé de l'interface.