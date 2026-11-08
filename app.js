// ===== Coach Sport – Version 1 : profil + calculs + conseils =====

// --- Raccourci pour récupérer un élément par son id ---
const $ = (id) => document.getElementById(id);

// --- Phrases de motivation, une liste par thème ---
const phrasesParTheme = {
  doux: [
    "Chaque petite séance compte 💪",
    "Ton futur toi te dit merci 💗",
    "La régularité vaut mieux que l'intensité 🔥",
    "Un pas à la fois, mais jamais à l'arrêt ✨",
    "Tu n'as pas besoin d'être parfait(e), juste de commencer 🎀",
  ],
  sport: [
    "Pas d'excuses. Juste du travail. 🔥",
    "La discipline bat la motivation. 💪",
    "Aujourd'hui, tu bats ton toi d'hier. ⚡",
    "Les résultats se construisent séance après séance. 🥇",
    "Plus lourd, plus fort, plus loin. 🏋️",
  ],
};

// --- Gestion du thème (doux / sport) ---
const racine = document.documentElement;

function afficherCitation() {
  const theme = racine.getAttribute("data-theme");
  const liste = phrasesParTheme[theme] || phrasesParTheme.doux;
  const indice = Math.floor(Math.random() * liste.length); // nombre aléatoire entre 0 et liste.length - 1
  $("citation").textContent = liste[indice];
}

function appliquerTheme(theme) {
  racine.setAttribute("data-theme", theme);
  try { localStorage.setItem("coach-theme", theme); } catch (e) {}
  afficherCitation();
}

try {
  const themeSauve = localStorage.getItem("coach-theme");
  if (themeSauve === "doux" || themeSauve === "sport") {
    racine.setAttribute("data-theme", themeSauve);
  }
} catch (e) {}

$("btn-theme").addEventListener("click", () => {
  const actuel = racine.getAttribute("data-theme");
  appliquerTheme(actuel === "doux" ? "sport" : "doux");
});

// =====================================================
// CALCULS
// =====================================================

// IMC = poids (kg) / taille (m) au carré
function calculerIMC(poids, tailleCm) {
  const tailleM = tailleCm / 100;
  return poids / (tailleM * tailleM);
}

function categorieIMC(imc) {
  if (imc < 18.5) return "(en dessous de la normale)";
  if (imc < 25) return "(normal)";
  if (imc < 30) return "(surpoids)";
  return "(obésité)";
}

// Métabolisme de base : formule de Mifflin-St Jeor
function calculerBMR(genre, poids, tailleCm, age) {
  const base = 10 * poids + 6.25 * tailleCm - 5 * age;
  return genre === "homme" ? base + 5 : base - 161;
}

// Calories cibles selon l'objectif.
// Pour perdre du poids SANS perdre de muscle, le déficit reste petit :
// plus la personne est proche d'un poids santé, plus il est petit.
function calculerCible(tdee, objectif, genre, age, imc) {
  let cible = tdee;
  let note = "";

  if (age < 18 && objectif !== "maintenir") {
    // Pour les moins de 18 ans, on ne propose pas de déficit ni de surplus
    note = "À ton âge, le corps est encore en croissance : on ne propose pas de régime. Parle de ton objectif avec un médecin ou un coach diplômé.";
    return { cible: Math.round(tdee), note };
  }

  if (objectif === "perdre") {
    let part = 0.15;             // déficit de 15 % par défaut
    if (imc >= 30) part = 0.20;  // plus de marge si l'IMC est élevé
    else if (imc < 25) part = 0.10; // très petit déficit si on est déjà proche du poids santé
    cible = tdee * (1 - part);
  }
  if (objectif === "prendre") cible = tdee * 1.10; // petit surplus de 10 %

  const plancher = genre === "homme" ? 1500 : 1200;
  if (cible < plancher) {
    cible = plancher;
    note = "L'objectif a été remonté à un minimum de sécurité. Ne descends pas en dessous sans suivi médical.";
  }
  return { cible: Math.round(cible), note };
}

// Répartition indicative des macronutriments
// Plus de protéines quand on perd du poids, pour protéger les muscles
function calculerMacros(cible, poids, objectif) {
  const parKg = objectif === "perdre" ? 1.8 : 1.6;
  const proteines = Math.round(parKg * poids);
  const lipides = Math.round((cible * 0.25) / 9);     // 25 % des kcal, 9 kcal par g
  const glucides = Math.round((cible - proteines * 4 - lipides * 9) / 4); // 4 kcal par g
  return { proteines, lipides, glucides: Math.max(glucides, 0) };
}

// Phrase qui explique le déficit ou le surplus appliqué
function texteAjustement(tdee, cible) {
  const ecart = Math.round(tdee - cible); // positif = déficit, négatif = surplus
  const pourcent = Math.round((Math.abs(ecart) / tdee) * 100);
  if (ecart > 5) {
    return "📉 Petit déficit : environ " + pourcent + " % (≈ " + ecart + " kcal de moins par jour), pour protéger tes muscles.";
  }
  if (ecart < -5) {
    return "📈 Petit surplus : environ " + pourcent + " % (≈ " + Math.abs(ecart) + " kcal de plus par jour).";
  }
  return "⚖️ Pas de déficit ni de surplus : tu maintiens ton poids.";
}

// Poids de référence : fourchette santé (IMC entre 18,5 et 24,9) et poids de référence (IMC 22)
function poidsReference(tailleCm) {
  const m = tailleCm / 100;
  return {
    min: 18.5 * m * m,
    max: 24.9 * m * m,
    ref: 22 * m * m,
  };
}

// Nombre de semaines pour parcourir un écart en kg, selon le rythme (kg par semaine)
function dureeEnSemaines(kg, rythme) {
  if (rythme < 0.05) return null; // rythme trop faible pour estimer
  return Math.ceil(kg / rythme);
}

// Texte qui compare le poids actuel à la fourchette santé
// "rythme" = vitesse de perte ou de prise en kg par semaine, calculée depuis les calories
function messagePoids(d, rythme) {
  const { min, max } = poidsReference(d.taille);

  if (d.poids > max) {
    const aPerdre = d.poids - max;
    let texte = "Pour atteindre le haut de la fourchette santé, il faudrait perdre environ " + aPerdre.toFixed(1) + " kg.";
    if (d.objectif === "perdre") {
      const semaines = dureeEnSemaines(aPerdre, rythme);
      if (semaines) {
        texte += " Avec ton petit déficit (environ " + rythme.toFixed(2).replace(".", ",") + " kg par semaine), cela prend environ " + semaines + " semaines.";
        if (semaines > 52) texte += " C'est long : fixe-toi des étapes de quelques kg pour rester motivé(e).";
      }
    }
    return texte;
  }

  if (d.poids < min) {
    const aGagner = min - d.poids;
    let texte = "Pour atteindre le bas de la fourchette santé, il faudrait prendre environ " + aGagner.toFixed(1) + " kg.";
    if (d.objectif === "prendre") {
      const semaines = dureeEnSemaines(aGagner, rythme);
      if (semaines) texte += " Avec ton petit surplus (environ " + rythme.toFixed(2).replace(".", ",") + " kg par semaine), cela prend environ " + semaines + " semaines.";
    }
    if (d.objectif === "perdre") {
      texte += " Perdre du poids n'est pas recommandé dans ta situation : parle-en à un médecin ou un diététicien.";
    }
    return texte;
  }

  return "Tu es déjà dans la fourchette santé pour ta taille, bravo ! 🎉";
}

// =====================================================
// CONSEILS
// =====================================================

// Conseils selon l'objectif principal
const conseilsPrincipal = {
  perdre: {
    titre: "📉 Perdre du poids sans perdre de muscle",
    conseils: [
      "Un petit déficit suffit : plus il est modéré, mieux tu protèges tes muscles. Celui proposé ici est adapté à ton IMC.",
      "Garde des protéines à chaque repas (œufs, poulet, poisson, légumineuses, produits laitiers).",
      "Fais de la musculation 2 à 3 fois par semaine : c'est le signal qui dit à ton corps de garder le muscle.",
      "Vise une perte lente, autour de 0,5 % de ton poids par semaine ou moins. Si tu perds beaucoup plus vite, mange un peu plus.",
      "Dors 7 à 9 heures : le manque de sommeil fait perdre plus de muscle et augmente la faim.",
      "Pas de régime extrême ni de repas sautés. Si tu te sens épuisé(e), étourdi(e) ou très stressé(e) par la nourriture, parles-en à un professionnel.",
    ],
  },
  maintenir: {
    titre: "⚖️ Maintenir ton poids",
    conseils: [
      "Pèse-toi une fois par semaine, le même jour, et regarde la tendance sur plusieurs semaines plutôt que le chiffre du jour.",
      "Un écart de 1 à 2 kg d'un jour à l'autre est normal (eau, repas, sel).",
      "Continue à t'entraîner 3 fois par semaine, la musculation aide à garder un corps tonique.",
      "Mange équilibré avec assez de protéines, de légumes et de fibres.",
    ],
  },
  prendre: {
    titre: "📈 Prendre de la masse proprement",
    conseils: [
      "Un petit surplus (environ 10 %) suffit : plus gros, tu prends surtout du gras.",
      "Entraîne-toi en force 3 à 4 fois par semaine et augmente progressivement les charges.",
      "Mange des protéines à chaque repas et des glucides autour de l'entraînement.",
      "Dors bien : c'est pendant le repos que les muscles se construisent.",
      "Compte 0,25 à 0,5 kg par semaine au maximum. La prise de muscle est lente, la patience paie.",
    ],
  },
};

// Conseils par type d'objectif en plus.
// "mots" = mots-clés (sans accents) qui permettent de reconnaître l'objectif,
// même quand l'utilisateur l'écrit lui-même.
const conseilsObjectifs = [
  {
    mots: ["tonif", "raffermir"],
    conseils: [
      "Tonifier = construire un peu de muscle et réduire un peu de gras : combine musculation et cardio modéré.",
      "Fais 3 séances de renforcement par semaine, en travaillant tout le corps.",
      "Mange assez de protéines et ne fais pas de gros déficit, sinon le corps ne se tonifie pas.",
    ],
  },
  {
    mots: ["force", "muscle", "musculation", "soulever"],
    conseils: [
      "Augmente petit à petit la charge ou le nombre de répétitions : c'est la progression qui crée la force.",
      "Travaille chaque groupe musculaire 2 fois par semaine et laisse 48 h de repos entre deux séances du même muscle.",
      "La technique d'abord, la charge ensuite : demande à un coach de corriger tes mouvements si possible.",
      "Échauffe-toi 5 à 10 minutes avant chaque séance.",
    ],
  },
  {
    mots: ["endurance", "cardio", "courir", "course", "souffle", "running"],
    conseils: [
      "Commence par 20 à 30 minutes à une allure facile (tu dois pouvoir parler) 2 à 3 fois par semaine.",
      "Augmente la durée d'environ 10 % par semaine, pas plus.",
      "Alterne marche et course au début pour habituer le corps.",
      "Bois avant, pendant et après l'effort, surtout quand il fait chaud.",
    ],
  },
  {
    mots: ["souplesse", "etirement", "flexib", "mobilite", "yoga"],
    conseils: [
      "Étire-toi 5 à 10 minutes après la séance, quand les muscles sont chauds.",
      "Tiens chaque étirement 20 à 30 secondes, sans jamais forcer jusqu'à la douleur.",
      "La régularité compte plus que l'intensité : un peu chaque jour vaut mieux qu'une grosse séance par semaine.",
    ],
  },
  {
    mots: ["sommeil", "dormir"],
    conseils: [
      "Vise 7 à 9 heures de sommeil par nuit, avec des horaires réguliers.",
      "Évite les écrans pendant l'heure avant le coucher.",
      "Limite la caféine l'après-midi et évite les repas très lourds le soir.",
      "Évite les séances très intenses juste avant de dormir.",
    ],
  },
  {
    mots: ["stress", "anxi", "relax", "detend", "calme"],
    conseils: [
      "Essaie 5 minutes de respiration lente : inspire 4 secondes, expire 6 secondes.",
      "Une marche ou une séance régulière aide beaucoup à relâcher la pression.",
      "Prévois chaque jour un moment à toi, sans écran.",
      "Si le stress devient très pesant ou dure longtemps, parles-en à une personne de confiance ou à un professionnel.",
    ],
  },
  {
    mots: ["boire", "hydrat", "d'eau"],
    conseils: [
      "Compte environ 1,5 à 2 litres par jour, plus s'il fait chaud ou si tu t'entraînes.",
      "Bois un verre d'eau au réveil et garde une bouteille avec toi.",
      "Si ton urine est claire, tu es bien hydraté(e).",
    ],
  },
  {
    mots: ["marche", "marcher", "pas par jour", "escalier"],
    conseils: [
      "Ajoute 1 000 pas par jour chaque semaine plutôt que de viser 10 000 d'un coup.",
      "Marche 10 minutes après les repas, c'est facile et efficace.",
      "Prends les escaliers et descends un arrêt plus tôt quand tu peux.",
    ],
  },
];

// Conseils quand l'objectif écrit n'est pas reconnu
const conseilGenerique = [
  "Rends ton objectif précis et mesurable (par exemple : « 3 séances par semaine pendant 8 semaines »).",
  "Découpe-le en petites étapes, avec une date pour chacune.",
  "Note tes progrès chaque semaine : voir l'évolution motive.",
  "Si ton objectif concerne la santé, demande l'avis d'un professionnel.",
];

// Enlève les accents et met en minuscules, pour comparer les mots plus facilement
function sansAccents(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Cherche le groupe de conseils qui correspond au texte d'un objectif
function trouverConseils(texte) {
  const t = sansAccents(texte);
  const groupe = conseilsObjectifs.find((c) => c.mots.some((mot) => t.includes(mot)));
  return groupe ? groupe.conseils : conseilGenerique;
}

// Construit une liste <ul> à partir d'un tableau de phrases
function creerListeConseils(conseils) {
  const ul = document.createElement("ul");
  ul.className = "liste-conseils";
  conseils.forEach((phrase) => {
    const li = document.createElement("li");
    li.textContent = phrase;
    ul.appendChild(li);
  });
  return ul;
}

// =====================================================
// OBJECTIFS EN PLUS (puces à choisir + objectifs écrits)
// =====================================================
const objectifsSuggeres = [
  "💪 Gagner en force",
  "🏃 Améliorer mon endurance",
  "🧘 Gagner en souplesse",
  "🔥 Me tonifier",
  "😴 Mieux dormir",
  "🧠 Réduire le stress",
  "💧 Boire plus d'eau",
  "🚶 Marcher plus",
];
const MAX_OBJECTIFS = 8;
let autresObjectifs = []; // la liste des objectifs choisis

function dejaPresent(texte) {
  return autresObjectifs.some((o) => o.toLowerCase() === texte.toLowerCase());
}

// Ajoute l'objectif s'il n'y est pas, le retire s'il y est déjà
function basculerObjectif(texte) {
  if (dejaPresent(texte)) {
    autresObjectifs = autresObjectifs.filter((o) => o.toLowerCase() !== texte.toLowerCase());
  } else if (autresObjectifs.length < MAX_OBJECTIFS) {
    autresObjectifs.push(texte);
  }
  dessinerObjectifs();
}

// Redessine les deux zones : les suggestions et les objectifs choisis
function dessinerObjectifs() {
  const zoneSuggestions = $("objectifs-suggeres");
  zoneSuggestions.textContent = "";
  objectifsSuggeres.forEach((texte) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "puce" + (dejaPresent(texte) ? " actif" : "");
    bouton.textContent = texte;
    bouton.addEventListener("click", () => basculerObjectif(texte));
    zoneSuggestions.appendChild(bouton);
  });

  const zoneChoisis = $("objectifs-choisis");
  zoneChoisis.textContent = "";
  autresObjectifs.forEach((texte) => {
    const puce = document.createElement("span");
    puce.className = "puce choisie";
    puce.textContent = texte;

    const retirer = document.createElement("button");
    retirer.type = "button";
    retirer.className = "retirer";
    retirer.textContent = "✕";
    retirer.setAttribute("aria-label", "Retirer " + texte);
    retirer.addEventListener("click", () => basculerObjectif(texte));

    puce.appendChild(retirer);
    zoneChoisis.appendChild(puce);
  });
}

function ajouterObjectifPerso() {
  const champ = $("objectif-perso");
  const texte = champ.value.trim();
  if (!texte) return;

  if (autresObjectifs.length >= MAX_OBJECTIFS) {
    $("message-erreur").textContent = "Maximum " + MAX_OBJECTIFS + " objectifs en plus.";
    return;
  }
  if (!dejaPresent(texte)) autresObjectifs.push(texte);

  champ.value = "";
  $("message-erreur").textContent = "";
  dessinerObjectifs();
}

$("btn-ajout-objectif").addEventListener("click", ajouterObjectifPerso);
$("objectif-perso").addEventListener("keydown", (evenement) => {
  if (evenement.key === "Enter") {
    evenement.preventDefault(); // évite d'envoyer tout le formulaire
    ajouterObjectifPerso();
  }
});

// =====================================================
// FORMULAIRE ET AFFICHAGE
// =====================================================
const formulaire = $("form-profil");

formulaire.addEventListener("submit", (evenement) => {
  evenement.preventDefault();

  const donnees = {
    prenom: $("prenom").value.trim(),
    genre: $("genre").value,
    age: Number($("age").value),
    poids: Number($("poids").value),
    taille: Number($("taille").value),
    niveau: $("niveau").value,
    activite: Number($("activite").value),
    objectif: $("objectif").value,
    autresObjectifs: [...autresObjectifs],
  };

  const erreur = verifier(donnees);
  $("message-erreur").textContent = erreur;
  if (erreur) return;

  try { localStorage.setItem("coach-profil", JSON.stringify(donnees)); } catch (e) {}
  afficherResultats(donnees);
});

function verifier(d) {
  if (!d.prenom) return "Entre ton prénom.";
  if (!d.genre) return "Choisis ton genre.";
  if (!(d.age >= 10 && d.age <= 100)) return "Âge invalide (entre 10 et 100).";
  if (!(d.poids >= 25 && d.poids <= 300)) return "Poids invalide (entre 25 et 300 kg).";
  if (!(d.taille >= 100 && d.taille <= 250)) return "Taille invalide (entre 100 et 250 cm).";
  if (!d.niveau) return "Choisis ton niveau.";
  if (!d.activite) return "Choisis ton activité quotidienne.";
  if (!d.objectif) return "Choisis ton objectif.";
  return "";
}

function afficherResultats(d) {
  const imc = calculerIMC(d.poids, d.taille);
  const bmr = calculerBMR(d.genre, d.poids, d.taille, d.age);
  const tdee = bmr * d.activite;

  // Sécurité : si la personne est déjà en dessous du poids santé, on ne propose pas de déficit
  let objectifCalcul = d.objectif;
  const notes = [];
  if (d.age >= 18 && imc < 18.5 && d.objectif === "perdre") {
    objectifCalcul = "maintenir";
    notes.push("Ton IMC est déjà sous la fourchette santé : le calcul des calories est fait pour maintenir ton poids, sans déficit.");
  }

  const resultatCible = calculerCible(tdee, objectifCalcul, d.genre, d.age, imc);
  if (resultatCible.note) notes.push(resultatCible.note);
  const macros = calculerMacros(resultatCible.cible, d.poids, objectifCalcul);

  // Rythme estimé en kg par semaine (environ 7700 kcal pour 1 kg)
  const rythme = (Math.abs(tdee - resultatCible.cible) * 7) / 7700;

  $("titre-resultats").textContent = "Résultats de " + d.prenom;
  $("res-imc").textContent = imc.toFixed(1);
  $("res-imc-cat").textContent = categorieIMC(imc);
  $("res-bmr").textContent = Math.round(bmr);
  $("res-tdee").textContent = Math.round(tdee);
  $("res-cible").textContent = resultatCible.cible;
  $("res-ajustement").textContent = texteAjustement(tdee, resultatCible.cible);
  $("res-prot").textContent = macros.proteines;
  $("res-gluc").textContent = macros.glucides;
  $("res-lip").textContent = macros.lipides;

  // Conseils selon l'objectif principal (pas pour les moins de 18 ans)
  const blocPrincipal = conseilsPrincipal[objectifCalcul];
  if (d.age >= 18 && blocPrincipal) {
    $("titre-conseils-principal").textContent = blocPrincipal.titre;
    const zone = $("res-conseils-principal");
    zone.textContent = "";
    zone.appendChild(creerListeConseils(blocPrincipal.conseils));
    $("bloc-conseils-principal").classList.remove("cache");
  } else {
    $("bloc-conseils-principal").classList.add("cache");
  }

  // Poids de référence (pas pour les moins de 18 ans : l'IMC adulte ne s'applique pas)
  if (d.age >= 18) {
    const p = poidsReference(d.taille);
    $("res-fourchette").textContent = p.min.toFixed(1) + " – " + p.max.toFixed(1) + " kg";
    $("res-reference").textContent = p.ref.toFixed(1) + " kg";
    $("res-poids-note").textContent = messagePoids(d, rythme) + " Ce sont des repères : l'IMC ne distingue pas le muscle de la graisse.";
    $("bloc-poids").classList.remove("cache");
  } else {
    $("bloc-poids").classList.add("cache");
    notes.push("Pour les moins de 18 ans, on ne donne pas de poids cible : demande à un médecin.");
  }

  // Objectifs en plus : une carte de conseils par objectif
  const autres = d.autresObjectifs || [];
  const zoneAutres = $("res-autres");
  zoneAutres.textContent = "";
  autres.forEach((texte) => {
    const carte = document.createElement("div");
    carte.className = "conseil";

    const titre = document.createElement("h4");
    titre.textContent = texte;

    carte.appendChild(titre);
    carte.appendChild(creerListeConseils(trouverConseils(texte)));
    zoneAutres.appendChild(carte);
  });
  $("bloc-autres").classList.toggle("cache", autres.length === 0);

  $("res-note").textContent = notes.join(" ");

  $("resultats").classList.remove("cache");
  $("resultats").scrollIntoView({ behavior: "smooth" });
}

// --- Démarrage : citation, objectifs, puis profil sauvegardé ---
afficherCitation();
dessinerObjectifs();

try {
  const sauve = JSON.parse(localStorage.getItem("coach-profil"));
  if (sauve) {
    $("prenom").value = sauve.prenom;
    $("genre").value = sauve.genre;
    $("age").value = sauve.age;
    $("poids").value = sauve.poids;
    $("taille").value = sauve.taille;
    $("niveau").value = sauve.niveau;
    $("activite").value = String(sauve.activite);
    $("objectif").value = sauve.objectif;
    autresObjectifs = Array.isArray(sauve.autresObjectifs)
      ? sauve.autresObjectifs.slice(0, MAX_OBJECTIFS).map(String)
      : [];
    dessinerObjectifs();
    afficherResultats(sauve);
  }
} catch (e) {}
