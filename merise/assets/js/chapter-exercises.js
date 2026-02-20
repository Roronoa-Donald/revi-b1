/* ═══════════════════════════════════════════════════════════════
   RD MERISE — chapter-exercises.js
   Moteur d'exercices interactifs embarqués dans chaque chapitre
   5 guidés + 10 quiz + 3 drag&drop par chapitre = 108 exercices
   ═══════════════════════════════════════════════════════════════ */

const exerciseData = {

  /* ──────── MODULE 1 : SI & Méthode MERISE ──────── */
  chapitre1: {
    guided: [
      { q: "Quel est le sigle de « Système d'Information » ?", hints: ["2 lettres", "S et I", "C'est littéral"], answer: "SI" },
      { q: "Quel niveau MERISE décrit le « Quoi ? » (les données et traitements sans technique) ?", hints: ["Niveau le plus abstrait", "Commence par 'C'", "Conceptuel"], answer: "conceptuel" },
      { q: "Quel diagramme MERISE modélise les données au niveau conceptuel ?", hints: ["3 lettres", "Modèle Conceptuel de…", "MCD"], answer: "MCD" },
      { q: "Combien de niveaux d'abstraction comporte la méthode MERISE ?", hints: ["Plus que 2", "Conceptuel, Logique, Physique", "Un chiffre"], answer: "3" },
      { q: "Quel document formalise les besoins du client au début d'un projet MERISE ?", hints: ["C'est un document contractuel", "Cahier des…", "Cahier des charges"], answer: "cahier des charges" }
    ],
    quiz: [
      { type: "mcq", q: "Que signifie le sigle MERISE ?", options: ["Méthode d'Étude et de Réalisation Informatique pour les Systèmes d'Entreprise", "Modèle Entité-Relation pour les SI d'Entreprise", "Méthode Expérimentale de Recherche en Ingénierie des SI", "Aucun acronyme, c'est un nom propre"], correct: 0 },
      { type: "mcq", q: "Quel niveau MERISE répond à la question « Comment ? » (technique) ?", options: ["Conceptuel", "Logique / Organisationnel", "Physique / Opérationnel", "Stratégique"], correct: 2 },
      { type: "qa", q: "Quel modèle MERISE est l'équivalent logique du MCD ?", answer: ["MLD", "Modèle Logique de Données"] },
      { type: "mcq", q: "Le système d'information est l'interface entre :", options: ["Le réseau et le serveur", "Le système opérant et le système de pilotage", "Le MCD et le MLD", "L'utilisateur et le clavier"], correct: 1 },
      { type: "qa", q: "Comment s'appelle le modèle qui décrit les traitements au niveau conceptuel ?", answer: ["MCT", "Modèle Conceptuel des Traitements"] },
      { type: "mcq", q: "L'approche MERISE sépare les données et les traitements. Vrai ou faux ?", options: ["Vrai", "Faux"], correct: 0 },
      { type: "mcq", q: "Le système opérant correspond à :", options: ["La direction qui décide", "La production qui exécute", "Le logiciel de gestion", "Le réseau informatique"], correct: 1 },
      { type: "qa", q: "Quel modèle MERISE est implémenté directement dans le SGBD ?", answer: ["MPD", "Modèle Physique de Données"] },
      { type: "mcq", q: "Quel est l'ordre correct des niveaux MERISE (du plus abstrait au plus concret) ?", options: ["Physique → Logique → Conceptuel", "Logique → Conceptuel → Physique", "Conceptuel → Logique → Physique", "Conceptuel → Physique → Logique"], correct: 2 },
      { type: "qa", q: "Le système de pilotage est aussi appelé système de… ?", answer: ["décision", "decision"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque niveau MERISE à sa question :", pairs: [["Conceptuel", "Quoi ?"], ["Logique", "Qui ? Où ? Quand ?"], ["Physique", "Comment ?"]] },
      { instruction: "Associe chaque modèle à son domaine :", pairs: [["MCD", "Données — Conceptuel"], ["MCT", "Traitements — Conceptuel"], ["MLD", "Données — Logique"], ["MOT", "Traitements — Organisationnel"], ["MPD", "Données — Physique"]] },
      { instruction: "Associe chaque sous-système à sa fonction :", pairs: [["Système opérant", "Exécute les activités de production"], ["Système de pilotage", "Prend les décisions et contrôle"], ["Système d'information", "Collecte, stocke et diffuse l'information"]] }
    ]
  },

  /* ──────── MODULE 2 : Modèle Conceptuel de Données (MCD) ──────── */
  chapitre2: {
    guided: [
      { q: "Comment appelle-t-on un objet du monde réel représenté dans un MCD (ex : CLIENT, PRODUIT) ?", hints: ["Rectangle dans le MCD", "Commence par 'E'", "Entité"], answer: "entité" },
      { q: "Comment appelle-t-on le lien entre deux entités dans un MCD ?", hints: ["Représenté par un ovale ou un losange", "Commence par 'A'", "Association"], answer: "association" },
      { q: "Quelle notation indique qu'un client peut passer 0 ou plusieurs commandes ? (min,max)", hints: ["Le minimum est 0", "Le maximum est n", "Écris les deux valeurs séparées par une virgule"], answer: "0,n" },
      { q: "Comment s'appelle l'attribut qui identifie de façon unique une occurrence d'entité ?", hints: ["C'est souvent souligné dans le MCD", "Identifiant ou clé…", "Clé primaire ou identifiant"], answer: "identifiant" },
      { q: "Une association qui relie 3 entités est dite…", hints: ["Préfixe pour trois", "Ternaire"], answer: "ternaire" }
    ],
    quiz: [
      { type: "mcq", q: "Dans un MCD, une entité est représentée par :", options: ["Un losange", "Un rectangle", "Un ovale", "Une flèche"], correct: 1 },
      { type: "mcq", q: "La cardinalité (1,1) signifie :", options: ["0 ou 1 occurrence", "Exactement 1 occurrence", "1 ou plusieurs occurrences", "0 ou plusieurs occurrences"], correct: 1 },
      { type: "qa", q: "Quelle cardinalité maximale indique 'plusieurs' ?", answer: ["n", "N"] },
      { type: "mcq", q: "Un attribut d'association est une propriété portée par :", options: ["Une entité", "Une association (relation)", "Une clé primaire", "Un identifiant"], correct: 1 },
      { type: "qa", q: "Quelle est la cardinalité d'une participation obligatoire minimum ?", answer: ["1", "1,1", "1,n"] },
      { type: "mcq", q: "Deux entités avec des cardinalités (1,1)—(0,n) forment une association de type :", options: ["Plusieurs à plusieurs (n:n)", "Un à plusieurs (1:n)", "Un à un (1:1)", "Ternaire"], correct: 1 },
      { type: "mcq", q: "L'identifiant d'une entité doit être :", options: ["Optionnel", "Unique et non nul", "Toujours un entier", "Toujours composé"], correct: 1 },
      { type: "qa", q: "Comment appelle-t-on une association qui relie une entité à elle-même ?", answer: ["réflexive", "association réflexive", "reflexive"] },
      { type: "mcq", q: "Dans le MCD d'une bibliothèque, l'association EMPRUNTER entre ADHERENT et LIVRE peut porter l'attribut :", options: ["Nom_adherent", "Titre_livre", "Date_emprunt", "ISBN"], correct: 2 },
      { type: "qa", q: "Combien d'entités au minimum participent à une association binaire ?", answer: ["2"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque concept MCD à sa représentation :", pairs: [["Entité", "Rectangle avec nom en majuscules"], ["Association", "Ovale ou losange reliant des entités"], ["Attribut", "Propriété listée dans l'entité"], ["Identifiant", "Attribut souligné dans l'entité"], ["Cardinalité", "Couple (min,max) sur le lien"]] },
      { instruction: "Associe chaque cardinalité à sa signification :", pairs: [["(0,1)", "Zéro ou une occurrence"], ["(1,1)", "Exactement une occurrence"], ["(0,n)", "Zéro ou plusieurs occurrences"], ["(1,n)", "Au moins une occurrence"]] },
      { instruction: "Associe le type d'association à son exemple :", pairs: [["Binaire", "CLIENT — passe — COMMANDE"], ["Ternaire", "ÉTUDIANT — s'inscrit — MATIÈRE — SEMESTRE"], ["Réflexive", "EMPLOYÉ — supervise — EMPLOYÉ"]] }
    ]
  },

  /* ──────── MODULE 3 : Modèle Logique de Données (MLD) ──────── */
  chapitre3: {
    guided: [
      { q: "Comment s'appelle la transformation du MCD en tables relationnelles ?", hints: ["Passage du conceptuel au logique", "Commence par 'D'", "Dérivation ou passage MCD→MLD"], answer: "passage MCD vers MLD" },
      { q: "Dans le MLD, une entité devient une… ?", hints: ["Structure à lignes et colonnes", "Un mot de 5 lettres", "Table ou relation"], answer: "table" },
      { q: "Quel attribut dans une table fait référence à la clé primaire d'une autre table ?", hints: ["Clé…", "Étrangère", "Clé étrangère"], answer: "clé étrangère" },
      { q: "Règle de passage : une association (0,n)—(0,n) génère quoi ?", hints: ["Une nouvelle structure", "Table d'association", "Table intermédiaire avec les 2 clés"], answer: "une table d'association" },
      { q: "Règle de passage : dans une relation (1,1)—(0,n), la clé étrangère migre du côté… ?", hints: ["Du côté de la cardinalité la plus restrictive", "Côté 1,1", "La FK va dans la table côté (1,1)"], answer: "1,1" }
    ],
    quiz: [
      { type: "mcq", q: "Que devient une entité du MCD dans le MLD relationnel ?", options: ["Un attribut", "Une table (relation)", "Une clé étrangère", "Un index"], correct: 1 },
      { type: "mcq", q: "Règle 1 : Pour une association (1,1)—(0,n), la clé étrangère va :", options: ["Dans la table côté (0,n)", "Dans la table côté (1,1)", "Dans une table intermédiaire", "Nulle part"], correct: 1 },
      { type: "qa", q: "Comment appelle-t-on la contrainte qui garantit qu'une FK référence une PK existante ?", answer: ["intégrité référentielle", "integrite referentielle", "contrainte d'intégrité référentielle"] },
      { type: "mcq", q: "Une association n:n avec attribut génère dans le MLD :", options: ["Un attribut supplémentaire dans une table", "Une table d'association avec clé composée", "Rien, on l'ignore", "Deux clés étrangères sans table"], correct: 1 },
      { type: "qa", q: "Comment note-t-on la clé primaire dans le MLD textuel ?", answer: ["souligné", "soulignée", "soulignement", "en souligné"] },
      { type: "mcq", q: "PARTICIPER(#Num_Etudiant, #Code_Matière, Note) — Les # indiquent :", options: ["Des attributs optionnels", "Des clés étrangères", "Des index", "Des commentaires"], correct: 1 },
      { type: "mcq", q: "Si DEPARTEMENT (1,1)—EMPLOYE (0,n), combien de tables minimum au MLD ?", options: ["1", "2", "3", "4"], correct: 1 },
      { type: "qa", q: "Quel est le nom anglais du MLD ?", answer: ["logical data model", "LDM"] },
      { type: "mcq", q: "L'identifiant de l'entité devient dans la table :", options: ["Un attribut ordinaire", "La clé primaire", "Une clé étrangère", "Un index unique"], correct: 1 },
      { type: "qa", q: "Quelle notation se lit « la clé primaire est composée de Num_Etudiant ET Code_Matière » ?", answer: ["clé composée", "cle composee", "clé primaire composée"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque règle de passage MCD→MLD :", pairs: [["Entité", "Devient une table avec sa clé primaire"], ["Association 1:n", "FK migrée dans la table côté 1,1"], ["Association n:n", "Nouvelle table d'association avec clé composée"], ["Attribut d'association", "Devient attribut de la table d'association"]] },
      { instruction: "Associe chaque terme MCD à son équivalent MLD :", pairs: [["Entité", "Table / Relation"], ["Propriété", "Attribut / Colonne"], ["Identifiant", "Clé primaire"], ["Occurrence", "Tuple / Ligne"]] },
      { instruction: "Associe chaque symbole MLD à sa signification :", pairs: [["PK (souligné)", "Clé primaire"], ["# (dièse)", "Clé étrangère"], ["NOT NULL", "Attribut obligatoire"], ["UNIQUE", "Valeur sans doublon"]] }
    ]
  },

  /* ──────── MODULE 4 : Extensions du MCD & Normalisation ──────── */
  chapitre4: {
    guided: [
      { q: "Comment appelle-t-on la relation d'héritage entre entités dans un MCD étendu ?", hints: ["Comme en POO", "Spécialisation / Généralisation", "Héritage"], answer: "héritage" },
      { q: "Quelle forme normale exige que chaque attribut soit atomique (pas de groupe répétitif) ?", hints: ["La première", "1FN", "Première forme normale"], answer: "1FN" },
      { q: "En 2FN, tout attribut non-clé doit dépendre de… ?", hints: ["Pas d'une partie de la clé", "La totalité de la clé", "Toute la clé primaire"], answer: "toute la clé" },
      { q: "Quelle contrainte d'héritage signifie qu'une occurrence appartient à exactement un sous-type ?", hints: ["Les sous-types ne se chevauchent pas", "Exclusion totale", "Partition ou {XT}"], answer: "partition" },
      { q: "La 3FN élimine les dépendances fonctionnelles… ?", hints: ["Pas directes", "Qui passent par un intermédiaire", "Transitives"], answer: "transitives" }
    ],
    quiz: [
      { type: "mcq", q: "La 1FN interdit :", options: ["Les clés composées", "Les attributs multivalués et les groupes répétitifs", "Les clés étrangères", "Les associations ternaires"], correct: 1 },
      { type: "mcq", q: "Un attribut qui dépend d'une partie seulement de la clé primaire composée viole :", options: ["La 1FN", "La 2FN", "La 3FN", "La BCNF"], correct: 1 },
      { type: "qa", q: "Quelle forme normale élimine les dépendances transitives ?", answer: ["3FN", "troisième forme normale", "3eme forme normale"] },
      { type: "mcq", q: "L'héritage {T} (total) signifie :", options: ["Les sous-types se chevauchent", "Toute occurrence du sur-type est dans au moins un sous-type", "Les sous-types sont exclusifs", "L'héritage est optionnel"], correct: 1 },
      { type: "qa", q: "Comment appelle-t-on une dépendance fonctionnelle A → B où A n'est pas une clé ?", answer: ["dépendance transitive", "transitive", "DF transitive"] },
      { type: "mcq", q: "La contrainte {XT} dans un héritage signifie :", options: ["Exclusivité et totalité (partition)", "Extension temporaire", "Exclusion partielle", "Héritage multiple"], correct: 0 },
      { type: "mcq", q: "Une association identifiante (CIF) est utilisée quand :", options: ["L'entité faible ne peut exister seule", "Les entités ont la même clé", "On veut supprimer une association", "La cardinalité est 0,0"], correct: 0 },
      { type: "qa", q: "A → B signifie : connaissant A, on détermine…", answer: ["B", "B de façon unique"] },
      { type: "mcq", q: "Quel outil conceptuel MCD permet de modéliser PERSONNE → ÉTUDIANT / SALARIÉ ?", options: ["Association ternaire", "Héritage (spécialisation)", "Entité faible", "Contrainte de cardinalité"], correct: 1 },
      { type: "qa", q: "Comment appelle-t-on une entité qui ne peut pas être identifiée sans l'entité parente ?", answer: ["entité faible", "entite faible"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque forme normale à ce qu'elle élimine :", pairs: [["1FN", "Attributs non atomiques / groupes répétitifs"], ["2FN", "Dépendances partielles sur la clé composée"], ["3FN", "Dépendances transitives"], ["BCNF", "Toute DF dont le déterminant n'est pas une clé candidate"]] },
      { instruction: "Associe chaque contrainte d'héritage à sa signification :", pairs: [["{T} Total", "Chaque occurrence du sur-type est dans un sous-type"], ["{X} Exclusif", "Une occurrence ne peut être que dans un seul sous-type"], ["{XT} Partition", "Total + Exclusif combinés"]] },
      { instruction: "Ordonne les formes normales (la plus faible en haut) :", pairs: [["Niveau 1", "1FN — Attributs atomiques"], ["Niveau 2", "2FN — Dépendance totale de la clé"], ["Niveau 3", "3FN — Pas de transitivité"], ["Niveau 4", "BCNF — Tout déterminant est clé candidate"]] }
    ]
  },

  /* ──────── MODULE 5 : Modélisation des Flux ──────── */
  chapitre5: {
    guided: [
      { q: "Comment s'appelle un acteur situé à l'extérieur du domaine étudié ?", hints: ["Il est dehors", "Acteur…", "Acteur externe"], answer: "acteur externe" },
      { q: "Comment appelle-t-on un échange d'information entre deux acteurs dans un diagramme de flux ?", hints: ["C'est une flèche", "Un flux d'…", "Flux d'information"], answer: "flux" },
      { q: "Quel diagramme représente le périmètre du domaine étudié avec ses acteurs externes ?", hints: ["C'est le premier diagramme de flux", "Diagramme de contexte", "Il délimite le domaine"], answer: "diagramme de contexte" },
      { q: "Dans un diagramme de flux, le domaine étudié est représenté par quel symbole ?", hints: ["Un rectangle", "Un grand rectangle central", "Rectangle représentant le système"], answer: "rectangle" },
      { q: "Quel diagramme détaille les flux entre les activités internes du domaine ?", hints: ["Il décompose le contexte", "Diagramme de flux de données", "DFD"], answer: "diagramme de flux de données" }
    ],
    quiz: [
      { type: "mcq", q: "Un acteur externe dans un diagramme de flux est :", options: ["Un utilisateur du logiciel", "Une entité hors du domaine étudié qui échange des flux", "Un serveur distant", "Un sous-système interne"], correct: 1 },
      { type: "mcq", q: "Le diagramme de contexte montre :", options: ["Les tables de la base de données", "Le domaine étudié et ses acteurs externes", "Le détail des traitements internes", "Les cardinalités entre entités"], correct: 1 },
      { type: "qa", q: "Comment appelle-t-on un acteur situé à l'intérieur du domaine étudié ?", answer: ["acteur interne", "domaine interne"] },
      { type: "mcq", q: "Une flèche dans un diagramme de flux représente :", options: ["Une clé étrangère", "Un flux d'information", "Une association", "Une héritage"], correct: 1 },
      { type: "qa", q: "Dans un schéma de flux, quel type de diagramme donne la vue la plus globale ?", answer: ["diagramme de contexte", "contexte"] },
      { type: "mcq", q: "L'analyse des flux se situe à quel niveau du SI ?", options: ["Physique", "Logique / Organisationnel", "Conceptuel", "Aucun, c'est hors MERISE"], correct: 2 },
      { type: "mcq", q: "Un flux peut être :", options: ["Uniquement un document papier", "Uniquement électronique", "Matériel, immatériel ou monétaire", "Uniquement interne"], correct: 2 },
      { type: "qa", q: "Le DFD signifie :", answer: ["Diagramme de Flux de Données", "Data Flow Diagram"] },
      { type: "mcq", q: "Les flux entrants dans le domaine proviennent de :", options: ["La base de données", "Les acteurs externes", "Les tables MLD", "Les clés étrangères"], correct: 1 },
      { type: "qa", q: "Dans le diagramme de flux, quel élément délimite le périmètre du système étudié ?", answer: ["domaine", "le domaine", "rectangle du domaine"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque élément du diagramme de flux à sa représentation :", pairs: [["Acteur externe", "Ellipse (ou rectangle) en dehors du domaine"], ["Domaine étudié", "Grand rectangle central"], ["Flux", "Flèche orientée entre deux éléments"], ["Acteur interne", "Ellipse à l'intérieur du domaine"]] },
      { instruction: "Associe chaque type de diagramme de flux à son niveau de détail :", pairs: [["Diagramme de contexte", "Vue globale : domaine + acteurs externes"], ["DFD niveau 0", "Décomposition en activités principales"], ["DFD niveau 1", "Détail de chaque activité"]] },
      { instruction: "Associe chaque exemple au type de flux :", pairs: [["Bon de commande", "Flux d'information documentaire"], ["Virement bancaire", "Flux monétaire"], ["Colis livré", "Flux matériel"], ["E-mail de confirmation", "Flux d'information électronique"]] }
    ]
  },

  /* ──────── MODULE 6 : Modèle Conceptuel des Traitements (MCT) ──────── */
  chapitre6: {
    guided: [
      { q: "Dans un MCT, qu'est-ce qui déclenche une opération ?", hints: ["C'est un fait", "Quelque chose qui arrive", "Un événement"], answer: "un événement" },
      { q: "Comment s'appelle le rectangle central du MCT qui transforme les événements en résultats ?", hints: ["C'est le cœur du MCT", "Commence par 'O'", "Opération"], answer: "opération" },
      { q: "Quel mot désigne la condition qui détermine l'issue d'une opération (succès / échec) ?", hints: ["C'est une règle d'émission", "Commence par 'R'", "Règle d'émission"], answer: "règle d'émission" },
      { q: "Un événement peut être de deux types : contributif et… ?", hints: ["Le deuxième type de déclencheur", "Synchronisation", "Déclencheur ou synchronisation"], answer: "déclencheur" },
      { q: "Le MCT décrit les traitements à quel niveau MERISE ?", hints: ["Le plus abstrait", "Pas organisationnel ni physique", "Conceptuel"], answer: "conceptuel" }
    ],
    quiz: [
      { type: "mcq", q: "Un événement dans un MCT est :", options: ["Une table de la base de données", "Un fait significatif qui déclenche ou contribue à une opération", "Un attribut d'entité", "Une cardinalité"], correct: 1 },
      { type: "mcq", q: "Les résultats d'une opération dans le MCT sont :", options: ["De nouvelles entités", "Des événements résultats", "Des clés primaires", "Des dépendances fonctionnelles"], correct: 1 },
      { type: "qa", q: "Comment s'appelle la condition exprimée en bas de l'opération MCT ?", answer: ["règle d'émission", "regle d'emission", "règle d'émission de résultat"] },
      { type: "mcq", q: "La synchronisation d'événements dans le MCT utilise les opérateurs :", options: ["+ et −", "ET, OU, NON", "IF, ELSE", "SELECT, FROM"], correct: 1 },
      { type: "qa", q: "Un événement qui arrive de l'extérieur du domaine est dit :", answer: ["externe", "événement externe"] },
      { type: "mcq", q: "L'opération dans un MCT est représentée par :", options: ["Un losange", "Un rectangle avec le nom de l'opération", "Un ovale", "Une flèche"], correct: 1 },
      { type: "mcq", q: "Le MCT est indépendant de :", options: ["Des données", "De l'organisation et de la technique", "Des traitements", "Du MCD"], correct: 1 },
      { type: "qa", q: "Quel modèle décrit le « Qui fait quoi, quand, où ? » pour les traitements ?", answer: ["MOT", "Modèle Organisationnel des Traitements"] },
      { type: "mcq", q: "La condition « Commande complète » ou « Commande incomplète » est une :", options: ["Entité", "Règle d'émission", "Cardinalité", "Dépendance fonctionnelle"], correct: 1 },
      { type: "qa", q: "Le lien entre événements entrants et opération est un lien de :", answer: ["synchronisation", "déclenchement"] }
    ],
    dragdrop: [
      { instruction: "Associe chaque concept MCT à sa description :", pairs: [["Événement", "Fait significatif qui déclenche un traitement"], ["Opération", "Ensemble d'actions déclenchées par des événements"], ["Règle d'émission", "Condition déterminant l'issue d'une opération"], ["Événement résultat", "Produit en sortie d'une opération"], ["Synchronisation", "Combinaison logique (ET/OU) d'événements"]] },
      { instruction: "Associe chaque opérateur de synchronisation à sa signification :", pairs: [["ET (∧)", "Tous les événements doivent être présents"], ["OU (∨)", "Au moins un événement suffit"], ["NON (¬)", "L'événement ne doit PAS être présent"]] },
      { instruction: "Ordonne les étapes de construction d'un MCT :", pairs: [["Étape 1", "Identifier les événements déclencheurs"], ["Étape 2", "Définir les opérations et leur contenu"], ["Étape 3", "Établir les synchronisations (ET/OU)"], ["Étape 4", "Définir les règles d'émission et événements résultats"]] }
    ]
  }
};


/* ═══════════════════════════════════════════════
   MOTEUR DE RENDU DES EXERCICES
   ═══════════════════════════════════════════════ */

const ExerciseEngine = {
  currentChapter: null,
  data: null,

  init() {
    const container = document.getElementById('interactive-exercise');
    if (!container) return;
    const path = window.location.pathname;
    const match = path.match(/chapitre(\d+)/);
    if (!match) return;
    this.currentChapter = 'chapitre' + match[1];
    this.data = exerciseData[this.currentChapter];
    if (!this.data) return;
    this.render(container);
  },

  render(container) {
    container.innerHTML = `
      <h2><i class="fa-solid fa-dumbbell" style="color:var(--accent);margin-right:0.5rem;"></i>Exercices Interactifs</h2>
      <div class="exercise-tabs">
        <button class="ex-tab active" data-tab="guided"><i class="fa-solid fa-hands-helping"></i> Guidés (${this.data.guided.length})</button>
        <button class="ex-tab" data-tab="quiz"><i class="fa-solid fa-circle-question"></i> Quiz (${this.data.quiz.length})</button>
        <button class="ex-tab" data-tab="dragdrop"><i class="fa-solid fa-arrows-alt"></i> Drag & Drop (${this.data.dragdrop.length})</button>
      </div>
      <div id="ex-guided" class="ex-panel active">${this.renderGuided()}</div>
      <div id="ex-quiz" class="ex-panel">${this.renderQuiz()}</div>
      <div id="ex-dragdrop" class="ex-panel">${this.renderDragDrop()}</div>
    `;
    this.bindTabs(container);
    this.bindGuided(container);
    this.bindQuiz(container);
    this.bindDragDrop(container);
  },

  /* ── Onglets ── */
  bindTabs(container) {
    container.querySelectorAll('.ex-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.ex-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.ex-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#ex-' + tab.dataset.tab).classList.add('active');
      });
    });
  },

  /* ══════════ GUIDED ══════════ */
  renderGuided() {
    return this.data.guided.map((g, i) => `
      <div class="guided-exercise" data-index="${i}">
        <p class="guided-q"><strong>Q${i + 1}.</strong> ${g.q}</p>
        <div class="guided-hints">
          ${g.hints.map((h, hi) => `<button class="hint-btn" data-hint="${hi}">💡 Indice ${hi + 1}</button><span class="hint-text" id="hint-${i}-${hi}">${h}</span>`).join('')}
        </div>
        <div class="guided-answer-zone">
          <input type="text" class="guided-input" placeholder="Ta réponse..." data-index="${i}">
          <button class="guided-check-btn" data-index="${i}">Vérifier</button>
        </div>
        <div class="guided-feedback" id="gfeedback-${i}"></div>
      </div>
    `).join('');
  },

  bindGuided(container) {
    container.querySelectorAll('.hint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.closest('.guided-exercise').dataset.index;
        const hintId = btn.dataset.hint;
        const el = document.getElementById(`hint-${idx}-${hintId}`);
        el.classList.toggle('visible');
      });
    });
    container.querySelectorAll('.guided-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.index);
        const input = container.querySelector(`.guided-input[data-index="${i}"]`);
        const fb = document.getElementById(`gfeedback-${i}`);
        const userAns = input.value.trim().toLowerCase();
        const correct = this.data.guided[i].answer.toLowerCase();
        if (userAns === correct || correct.includes(userAns) && userAns.length > 1) {
          fb.innerHTML = '<span class="correct">✅ Correct ! +15 XP</span>';
          fb.className = 'guided-feedback correct';
          btn.disabled = true;
          input.readOnly = true;
          if (typeof window.RD_Gamification !== 'undefined') window.RD_Gamification.addXP(15);
        } else {
          fb.innerHTML = `<span class="incorrect">❌ Pas tout à fait. La réponse est : <code>${this.data.guided[i].answer}</code></span>`;
          fb.className = 'guided-feedback incorrect';
        }
      });
    });
    container.querySelectorAll('.guided-input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          container.querySelector(`.guided-check-btn[data-index="${input.dataset.index}"]`).click();
        }
      });
    });
  },

  /* ══════════ QUIZ ══════════ */
  renderQuiz() {
    return this.data.quiz.map((q, i) => {
      if (q.type === 'mcq') {
        return `
          <div class="quiz-question" data-index="${i}" data-type="mcq">
            <p><strong>Q${i + 1}.</strong> ${q.q}</p>
            <div class="mcq-options">
              ${q.options.map((o, oi) => `<button class="mcq-btn" data-qi="${i}" data-oi="${oi}">${o}</button>`).join('')}
            </div>
            <div class="quiz-feedback" id="qfeedback-${i}"></div>
          </div>`;
      } else {
        return `
          <div class="quiz-question" data-index="${i}" data-type="qa">
            <p><strong>Q${i + 1}.</strong> ${q.q}</p>
            <div class="qa-zone">
              <input type="text" class="qa-input" placeholder="Ta réponse..." data-index="${i}">
              <button class="qa-check-btn" data-index="${i}">Vérifier</button>
            </div>
            <div class="quiz-feedback" id="qfeedback-${i}"></div>
          </div>`;
      }
    }).join('');
  },

  bindQuiz(container) {
    container.querySelectorAll('.mcq-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qi = parseInt(btn.dataset.qi);
        const oi = parseInt(btn.dataset.oi);
        const fb = document.getElementById(`qfeedback-${qi}`);
        const btns = container.querySelectorAll(`.mcq-btn[data-qi="${qi}"]`);
        btns.forEach(b => { b.disabled = true; b.classList.remove('correct', 'incorrect'); });
        if (oi === this.data.quiz[qi].correct) {
          btn.classList.add('correct');
          fb.innerHTML = '✅ Bonne réponse ! +10 XP';
          fb.className = 'quiz-feedback correct';
          if (typeof window.RD_Gamification !== 'undefined') window.RD_Gamification.addXP(10);
        } else {
          btn.classList.add('incorrect');
          btns[this.data.quiz[qi].correct].classList.add('correct');
          fb.innerHTML = '❌ Mauvaise réponse.';
          fb.className = 'quiz-feedback incorrect';
        }
      });
    });
    container.querySelectorAll('.qa-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.index);
        const input = container.querySelector(`.qa-input[data-index="${i}"]`);
        const fb = document.getElementById(`qfeedback-${i}`);
        const userAns = input.value.trim().toLowerCase();
        const correct = this.data.quiz[i].answer.map(a => a.toLowerCase());
        if (correct.some(c => userAns === c || c.includes(userAns) && userAns.length > 1)) {
          fb.innerHTML = '✅ Correct ! +10 XP';
          fb.className = 'quiz-feedback correct';
          btn.disabled = true;
          input.readOnly = true;
          if (typeof window.RD_Gamification !== 'undefined') window.RD_Gamification.addXP(10);
        } else {
          fb.innerHTML = `❌ Réponse attendue : <code>${this.data.quiz[i].answer[0]}</code>`;
          fb.className = 'quiz-feedback incorrect';
        }
      });
    });
    container.querySelectorAll('.qa-input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') container.querySelector(`.qa-check-btn[data-index="${input.dataset.index}"]`).click();
      });
    });
  },

  /* ══════════ DRAG & DROP ══════════ */
  renderDragDrop() {
    return this.data.dragdrop.map((dd, i) => {
      const shuffledVals = [...dd.pairs.map(p => p[1])].sort(() => Math.random() - 0.5);
      return `
        <div class="dd-exercise" data-index="${i}">
          <p><strong>Exercice ${i + 1}.</strong> ${dd.instruction}</p>
          <div class="dd-targets">
            ${dd.pairs.map((p, pi) => `
              <div class="dd-row" data-pair="${pi}">
                <span class="dd-key">${p[0]}</span>
                <span class="dd-dropzone" data-expected="${p[1]}" data-pi="${pi}">Glisse ici</span>
              </div>
            `).join('')}
          </div>
          <div class="dd-pool" id="dd-pool-${i}">
            ${shuffledVals.map(v => `<span class="dd-item" draggable="true" data-value="${v}">${v}</span>`).join('')}
          </div>
          <button class="dd-check-btn" data-index="${i}">Vérifier</button>
          <div class="dd-feedback" id="ddfeedback-${i}"></div>
        </div>`;
    }).join('');
  },

  bindDragDrop(container) {
    let draggedItem = null;

    container.querySelectorAll('.dd-item').forEach(item => {
      item.addEventListener('dragstart', e => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
      });
    });

    container.querySelectorAll('.dd-dropzone').forEach(zone => {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (!draggedItem) return;
        if (zone.querySelector('.dd-item')) {
          const existing = zone.querySelector('.dd-item');
          const pool = draggedItem.closest('.dd-pool') || container.querySelector(`#dd-pool-${zone.closest('.dd-exercise').dataset.index}`);
          pool.appendChild(existing);
        }
        zone.textContent = '';
        zone.appendChild(draggedItem);
      });
    });

    /* Mobile : tap-to-select */
    let selectedItem = null;
    container.querySelectorAll('.dd-item').forEach(item => {
      item.addEventListener('click', () => {
        if (selectedItem) selectedItem.classList.remove('selected');
        selectedItem = item;
        item.classList.add('selected');
      });
    });
    container.querySelectorAll('.dd-dropzone').forEach(zone => {
      zone.addEventListener('click', () => {
        if (!selectedItem) return;
        if (zone.querySelector('.dd-item')) {
          const existing = zone.querySelector('.dd-item');
          const pool = container.querySelector(`#dd-pool-${zone.closest('.dd-exercise').dataset.index}`);
          pool.appendChild(existing);
        }
        zone.textContent = '';
        zone.appendChild(selectedItem);
        selectedItem.classList.remove('selected');
        selectedItem = null;
      });
    });

    container.querySelectorAll('.dd-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.index);
        const exercise = container.querySelector(`.dd-exercise[data-index="${i}"]`);
        const zones = exercise.querySelectorAll('.dd-dropzone');
        const fb = document.getElementById(`ddfeedback-${i}`);
        let correct = 0;
        zones.forEach(zone => {
          const placed = zone.querySelector('.dd-item');
          zone.classList.remove('dd-correct', 'dd-incorrect');
          if (placed && placed.dataset.value === zone.dataset.expected) {
            zone.classList.add('dd-correct');
            correct++;
          } else {
            zone.classList.add('dd-incorrect');
          }
        });
        if (correct === zones.length) {
          fb.innerHTML = `✅ Parfait ! ${correct}/${zones.length} — +20 XP`;
          fb.className = 'dd-feedback correct';
          btn.disabled = true;
          if (typeof window.RD_Gamification !== 'undefined') window.RD_Gamification.addXP(20);
        } else {
          fb.innerHTML = `❌ ${correct}/${zones.length} correct(s). Réessaie !`;
          fb.className = 'dd-feedback incorrect';
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => ExerciseEngine.init());
