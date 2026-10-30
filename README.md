# Los Gitanos Criminal — Site du groupe

## Mise en ligne
1. Mets tous les fichiers de ce dossier dans un dépôt GitHub (GitHub Pages).
2. Ouvre `setup.html` une seule fois : crée **Tony Diaz** (Fondateur, mot de passe `tony2026`) et **Vito Scaletta** (Lead, mot de passe `vito2026`). Change les mots de passe dans Admin → Membres.
3. Ajoute les autres membres dans Admin → Membres (grade « Membre » : accès à tout sauf Admin).

## Firebase
Le site utilise le projet Firebase existant (`js/firebase-config.js`). Toutes ses données sont dans le dossier `gitanos/` de la base : rien n'est mélangé avec les autres groupes. Ne pas changer `DB_RACINE`.

## Pochons (page « Pochons »)
Chaque membre gère les siens : pochons pris, vendus, restant, chiffre d'affaires, détail par produit, historique modifiable. Tout le monde voit les autres, seul le propriétaire (ou un admin) modifie.

## Cooldown
Fleeca et Armurerie : 2 braquages maximum par semaine glissante, chacun se libère 7 jours après son enregistrement (réussite ou échec). Affiché sur le Dashboard, et le Tracker bloque la saisie quand il n'y en a plus de disponible (un admin peut passer outre). Réglable par action dans Admin → Actions (colonne « Cooldown »).

## Couleurs
Admin → Apparence : couleur principale, fond, texte, thèmes prêts à l'emploi. Enregistrer l'applique à tous.
