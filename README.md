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
Règle : X utilisations maximum sur une période glissante ; chacune (réussite ou échec) se libère exactement une période après son enregistrement. Le Tracker bloque la saisie quand il n'y en a plus de disponible (un admin peut passer outre).

| Action | Règle | Compteur |
|---|---|---|
| Fleeca, Armurerie | 2 par 7 jours | partagé (tout le groupe) |
| ATM, Supérette | 1 par 2 h | par personne |
| Go Fast | 1 par 24 h | par personne |
| Conteneur | 2 par 2 h | par personne |
| Cambu | 1 par 3 h | par personne + alerte 🔔 |

Tout est modifiable dans Admin → Actions (colonne « Cooldown » : max, jours, heures, partagé/par personne, alerte 🔔). Le Dashboard affiche le tableau partagé et un tableau par personne.

**Alertes 🔔** : quand une action avec alerte est de nouveau disponible pour un membre, il reçoit un bandeau + un bip (+ une notification du navigateur s'il clique sur « Activer les alertes » dans le menu). Elles ne marchent que si le site est ouvert dans un onglet.

## Couleurs
Admin → Apparence : couleur principale, fond, texte, thèmes prêts à l'emploi. Enregistrer l'applique à tous.
