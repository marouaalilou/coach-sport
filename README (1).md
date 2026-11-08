# 💪 Mon Coach Sport

Un site web de coaching sportif et nutritionnel personnalisé, créé pour apprendre le développement web (HTML, CSS, JavaScript) avec un projet concret.

L'utilisateur renseigne son profil, et le site calcule ses besoins, son poids de référence et lui donne des conseils adaptés à ses objectifs.

> ⚠️ **Avertissement** : ce site donne des estimations générales et ne remplace pas l'avis d'un médecin, d'un diététicien ou d'un coach diplômé. En cas de maladie ou de doute, consulter un professionnel de santé.

---

## ✨ Fonctionnalités actuelles (version 1.2)

### Profil de l'utilisateur
- Prénom, genre, âge, poids, taille
- Niveau sportif : débutant, intermédiaire ou avancé
- Niveau d'activité au quotidien
- Objectif principal : perdre du poids, maintenir son poids ou prendre de la masse

### Calculs
- **IMC** et sa catégorie
- **Métabolisme de base** (formule de Mifflin-St Jeor)
- **Dépense quotidienne estimée** selon l'activité
- **Objectif calorique** avec un petit déficit ou surplus adapté :
  - pour perdre du poids, un déficit de 10 à 20 % selon l'IMC, afin de protéger la masse musculaire
  - pour prendre de la masse, un petit surplus de 10 %
- **Répartition indicative** des protéines, glucides et lipides (plus de protéines quand on perd du poids)
- **Poids de référence** : fourchette santé (IMC entre 18,5 et 24,9) et durée estimée pour l'atteindre

### Objectifs en plus
- Des suggestions à cliquer : force, endurance, souplesse, tonification, sommeil, stress, hydratation, marche
- Possibilité d'écrire ses propres objectifs
- Une carte de **conseils personnalisés** pour chaque objectif, reconnu grâce à des mots-clés

### Design
- Deux thèmes, à changer avec le petit point en haut à droite :
  - **Doux** : noir et rose, avec stickers et motif de cœurs
  - **Sport** : noir et rouge, plus puissant et anguleux
- Phrases de motivation différentes à chaque chargement
- Sauvegarde du profil et du thème dans le navigateur (localStorage)

### Sécurité
- Pas de calcul de déficit pour les moins de 18 ans
- Pas de poids cible pour les moins de 18 ans
- Pas de déficit pour une personne déjà sous la fourchette santé
- Plancher de calories (1200 pour les femmes, 1500 pour les hommes)

---

## 🗺️ Feuille de route

Une version à la fois : chaque version doit marcher avant de passer à la suivante.

### ✅ Version 1 : profil, calculs et conseils (terminée)
- [x] Formulaire de profil et validation
- [x] IMC, calories, macronutriments
- [x] Poids de référence
- [x] Objectifs en plus avec conseils
- [x] Deux thèmes et sauvegarde locale

### 🔜 Version 2 : programmes d'entraînement
- [ ] Programmes écrits à l'avance (débutant, intermédiaire, avancé), à 3 jours par semaine pour commencer
- [ ] Exercices stockés dans un tableau d'objets (nom, séries, répétitions, repos)
- [ ] Choix automatique du programme selon le niveau et les objectifs
- [ ] Affichage par jour avec cases à cocher

### 📅 Version 3 : suivi
- [ ] Carnet de séances (date, exercice, séries, répétitions, poids soulevé)
- [ ] Suivi du poids corporel dans le temps
- [ ] Compteur de calories du jour
- [ ] Graphiques de progression avec Chart.js

### 📅 Version 4 : santé et cycle menstruel
- [ ] Question facultative sur les maladies : avertissement et conseil de consulter un médecin, sans adaptation automatique du programme
- [ ] Suivi du cycle facultatif, avec des suggestions d'intensité présentées comme de simples conseils
- [ ] Toutes les données restent sur l'appareil de l'utilisateur

### 💡 Version 5 : aller plus loin
- [ ] Comptes utilisateurs et base de données
- [ ] Conseils générés par IA, avec garde-fous
- [ ] Application installable (PWA)
- [ ] Publication en ligne avec GitHub Pages

---

## 🚀 Lancer le projet

1. Télécharge ou clone le dépôt.
2. Ouvre `index.html` dans ton navigateur (ou utilise l'extension **Live Server** dans VS Code).
3. Une connexion internet est utile pour charger les polices Google Fonts.

## 📁 Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | La structure de la page |
| `style.css` | Le design et les deux thèmes |
| `app.js` | Les calculs, les conseils et la logique |
| `feuille-de-route.md` | Le détail des versions à venir |

## 🛠️ Technologies

- HTML5
- CSS3 (variables, grille, animations)
- JavaScript (sans framework)

## 👩‍💻 Auteure

**Maroua Alilou** – étudiante en ingénierie des systèmes d'information.
Projet réalisé pour apprendre et pratiquer le développement web.
