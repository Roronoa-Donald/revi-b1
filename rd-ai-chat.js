/**
 * RD-AI Chat Widget + WhatsApp Contact — Bachelor 1
 * Assistant pédagogique intelligent + bouton contact WhatsApp
 * Streaming, localStorage, contexte par page, dark mode
 */
(function () {
    'use strict';

    // ================================================================
    // 1. CONFIGURATION
    // ================================================================
    const CONFIG = {
        apiUrl: '/api/ai-chat',
        model: 'deepseek/deepseek-chat',
        maxTokens: 2048,
        temperature: 0.7,
        maxHistory: 20
    };

    const WHATSAPP_NUMBER = '22896272034';
    const WHATSAPP_MESSAGE = encodeURIComponent('Bonjour ! Je vous contacte depuis le portail des cours B1. J\'ai une question.');

    // ================================================================
    // 2. CONTEXTES PAR COURS B1
    // ================================================================
    const CONTEXTS = {
        portal: {
            _default: "Portail Bachelor 1 des Cours Interactifs. 7 cours complets pour étudiants en informatique (1ère année) : Algorithmique, C/C++, Python, Réseaux Informatiques, Statistiques Descriptives, Fondamentaux des Bases de Données et MERISE. Chaque cours dispose de chapitres théoriques, exercices interactifs, QCM, flashcards, simulateur d'examen et système de gamification (XP, badges, niveaux)."
        },
        algo: {
            _default: "Cours d'Algorithmique. Sujets : introduction à l'algorithmique, variables, types de données, structures de contrôle (si/sinon, selon), boucles (pour, tant que, répéter), tableaux, chaînes de caractères, fonctions/procédures, récursivité, algorithmes de tri (bulle, sélection, insertion), recherche (séquentielle, dichotomique), complexité algorithmique, structures de données avancées.",
            chapitre1: "Chapitre 1 — Introduction à l'Algorithmique. Définition d'un algorithme, pseudo-code, organigrammes, variables, constantes, types de données (entier, réel, caractère, chaîne, booléen), affectation, E/S (lire, écrire).",
            chapitre2: "Chapitre 2 — Structures de Contrôle. Si/Alors/Sinon, Si imbriqués, Selon/Cas (switch), opérateurs logiques (ET, OU, NON), opérateurs de comparaison.",
            chapitre3: "Chapitre 3 — Boucles. Pour (for), Tant que (while), Répéter...Jusqu'à (do-while), compteurs, accumulateurs, boucles imbriquées, sentinelle.",
            chapitre4: "Chapitre 4 — Tableaux. Déclaration, accès par indice, parcours, recherche séquentielle, tri à bulles, tri par sélection, tri par insertion, tableaux 2D (matrices).",
            chapitre5: "Chapitre 5 — Chaînes de caractères. Longueur, concaténation, extraction, recherche de sous-chaîne, comparaison, conversion majuscule/minuscule.",
            chapitre6: "Chapitre 6 — Fonctions et Procédures. Déclaration, paramètres (entrée, sortie, entrée/sortie), passage par valeur/référence, portée des variables, retour de valeur.",
            chapitre7: "Chapitre 7 — Récursivité. Principe, cas de base et cas récursif, pile d'appels, factorielle, Fibonacci, tours de Hanoï, récursivité vs itération.",
            chapitre8: "Chapitre 8 — Algorithmes de Tri et Recherche. Tri bulle, tri sélection, tri insertion, tri rapide (quicksort), tri fusion (mergesort), recherche dichotomique, complexité O(n), O(n²), O(n log n).",
            chapitre9: "Chapitre 9 — Structures de Données. Piles (LIFO), files (FIFO), listes chaînées, arbres binaires, parcours d'arbres.",
            chapitre10: "Chapitre 10 — Complexité Algorithmique. Notation O(), complexités courantes, analyse du pire cas, meilleur cas, cas moyen, espace mémoire.",
            cartes: "Cartes mémoire Algorithmique — Flashcards des concepts, structures, algorithmes de tri et recherche.",
            formules: "Formulaire Algorithmique — Résumé : pseudo-code, structures, tri, recherche, complexité.",
            'simulateur-examen': "Simulateur d'Examen Algorithmique — QCM chronométré.",
            exercices: "Exercices interactifs Algorithmique — Écriture d'algorithmes, traces d'exécution, complexité."
        },
        c_cpp: {
            _default: "Cours de Programmation C/C++. Sujets : syntaxe C, compilation (gcc), types et variables, opérateurs, structures de contrôle (if, switch, for, while), fonctions, tableaux, pointeurs, allocation dynamique (malloc/free), structures (struct), fichiers, introduction au C++ (classes, objets, héritage).",
            chapitre1: "Chapitre 1 — Introduction au C. Histoire, compilation (gcc -o), structure d'un programme (#include, main, return), printf/scanf, types de base (int, float, double, char).",
            chapitre2: "Chapitre 2 — Variables et Opérateurs. Déclaration, initialisation, constantes (#define, const), opérateurs arithmétiques, relationnels, logiques, bit à bit, affectation composée (+=, -=), cast.",
            chapitre3: "Chapitre 3 — Structures de Contrôle. if/else, switch/case, boucles for, while, do-while, break, continue, goto (à éviter).",
            chapitre4: "Chapitre 4 — Fonctions. Prototypes, définition, paramètres, return, portée (locale/globale), passage par valeur, récursivité en C.",
            chapitre5: "Chapitre 5 — Tableaux et Chaînes. Tableaux 1D/2D, initialisation, parcours, strlen, strcpy, strcmp, strcat, string.h.",
            chapitre6: "Chapitre 6 — Pointeurs. Adresses (&), déréférencement (*), arithmétique des pointeurs, pointeurs et tableaux, passage par adresse, pointeurs de fonctions.",
            chapitre7: "Chapitre 7 — Allocation Dynamique et Structures. malloc/calloc/realloc/free, sizeof, fuites mémoire, struct, typedef, listes chaînées.",
            chapitre8: "Chapitre 8 — Fichiers et Introduction C++. fopen/fclose/fprintf/fscanf/fgets, modes (r, w, a), C++ : cout/cin, classes, constructeurs, héritage, string, vector.",
            cartes: "Cartes mémoire C/C++ — Flashcards : syntaxe, pointeurs, allocation, POO C++.",
            formules: "Formulaire C/C++ — Résumé : types, opérateurs, pointeurs, allocation, fichiers, classes C++.",
            'simulateur-examen': "Simulateur d'Examen C/C++ — QCM chronométré.",
            exercices: "Exercices interactifs C/C++ — Programmation, pointeurs, structures, fichiers."
        },
        python: {
            _default: "Cours de Python. Sujets : syntaxe Python 3, variables et types, opérateurs, structures de contrôle (if/elif/else, for, while), listes, tuples, dictionnaires, ensembles, fonctions, modules, fichiers, exceptions, POO (classes, héritage), bibliothèques courantes.",
            chapitre1: "Chapitre 1 — Introduction à Python. Installation, interpréteur, premier script, print(), input(), commentaires, indentation, types de base (int, float, str, bool).",
            chapitre2: "Chapitre 2 — Variables et Opérateurs. Typage dynamique, conversion (int(), float(), str()), opérateurs arithmétiques (**, //, %), comparaison, logiques (and, or, not), f-strings.",
            chapitre3: "Chapitre 3 — Structures de Contrôle. if/elif/else, boucle for (range, enumerate), while, break, continue, pass, compréhensions de listes.",
            chapitre4: "Chapitre 4 — Listes, Tuples, Dictionnaires. list (append, pop, sort, slice), tuple (immutable), dict (keys, values, items), set (union, intersection), itération.",
            chapitre5: "Chapitre 5 — Fonctions. def, return, paramètres (positionnels, nommés, *args, **kwargs), portée (local/global), lambda, fonctions built-in (map, filter, sorted).",
            chapitre6: "Chapitre 6 — Modules et Fichiers. import, from...import, os, sys, math, random, open(), read/write, with, json, csv.",
            chapitre7: "Chapitre 7 — Exceptions. try/except/else/finally, types d'exceptions (ValueError, TypeError, FileNotFoundError), raise, exceptions personnalisées.",
            chapitre8: "Chapitre 8 — POO en Python. class, __init__, self, attributs, méthodes, héritage, super(), __str__, __repr__, encapsulation, propriétés (@property).",
            cartes: "Cartes mémoire Python — Flashcards : syntaxe, structures de données, fonctions, POO.",
            formules: "Formulaire Python — Résumé : types, listes, dict, fonctions, fichiers, classes.",
            'simulateur-examen': "Simulateur d'Examen Python — QCM chronométré.",
            exercices: "Exercices interactifs Python — Scripts, structures de données, fonctions, POO."
        },
        reseaux: {
            _default: "Cours de Réseaux Informatiques. Sujets : modèle OSI (7 couches), modèle TCP/IP, adressage IP (IPv4, sous-réseaux, CIDR), protocoles (TCP, UDP, HTTP, DNS, DHCP, ARP, ICMP), équipements réseau (switch, routeur), câblage, topologies, Ethernet, Wi-Fi.",
            chapitre1: "Chapitre 1 — Introduction aux Réseaux. Définition, types (LAN, WAN, MAN), topologies (bus, étoile, anneau, maillage), modèles de communication (client-serveur, P2P).",
            chapitre2: "Chapitre 2 — Modèle OSI. 7 couches (Physique, Liaison, Réseau, Transport, Session, Présentation, Application), rôle de chaque couche, encapsulation, PDU (trame, paquet, segment).",
            chapitre3: "Chapitre 3 — Modèle TCP/IP. 4 couches (Accès réseau, Internet, Transport, Application), comparaison OSI/TCP-IP, protocoles par couche.",
            chapitre4: "Chapitre 4 — Adressage IP. IPv4 (32 bits, notation décimale pointée), classes A/B/C, adresses privées/publiques, masque de sous-réseau, CIDR (/24), calcul de sous-réseaux, passerelle.",
            chapitre5: "Chapitre 5 — Protocoles Réseau. ARP (adresse MAC↔IP), ICMP (ping, traceroute), DNS (résolution de noms), DHCP (attribution dynamique), HTTP/HTTPS, FTP.",
            chapitre6: "Chapitre 6 — Couche Transport. TCP (connexion, 3-way handshake, fiabilité, fenêtre, ports), UDP (sans connexion, rapide), ports bien connus (80, 443, 22, 53).",
            chapitre7: "Chapitre 7 — Équipements et Câblage. Hub, switch (commutation, table MAC), routeur (routage, table de routage), câbles (paires torsadées, fibre optique, coaxial), normes Ethernet (10/100/1000 Mbps).",
            chapitre8: "Chapitre 8 — Wi-Fi et Sécurité. Standards 802.11 (a/b/g/n/ac/ax), fréquences (2.4/5 GHz), SSID, WEP/WPA/WPA2/WPA3, pare-feu, NAT, VPN, VLAN.",
            cartes: "Cartes mémoire Réseaux — Flashcards : OSI, TCP/IP, adressage, protocoles, équipements.",
            formules: "Formulaire Réseaux — Résumé : couches, adressage IP, sous-réseaux, protocoles, commandes.",
            'simulateur-examen': "Simulateur d'Examen Réseaux — QCM chronométré.",
            exercices: "Exercices interactifs Réseaux — Sous-réseaux, protocoles, analyse de trames."
        },
        stats: {
            _default: "Cours de Statistiques Descriptives. Sujets : vocabulaire statistique, tableaux de fréquences, représentations graphiques, indicateurs de position (moyenne, médiane, mode), indicateurs de dispersion (variance, écart-type, étendue, quartiles), séries doubles, corrélation et régression linéaire.",
            chapitre1: "Chapitre 1 — Introduction aux Statistiques. Population, individu, échantillon, variable (qualitative/quantitative, discrète/continue), effectif, fréquence, tableaux de distribution.",
            chapitre2: "Chapitre 2 — Représentations Graphiques. Diagramme en bâtons, histogramme, diagramme circulaire, courbe des fréquences cumulées, boîte à moustaches.",
            chapitre3: "Chapitre 3 — Indicateurs de Position. Moyenne arithmétique (x̄ = Σxi·fi), moyenne pondérée, médiane (Me), mode (Mo), classe modale, quantiles (quartiles Q1/Q2/Q3, déciles, centiles).",
            chapitre4: "Chapitre 4 — Indicateurs de Dispersion. Étendue, variance (V = Σfi(xi−x̄)²), écart-type (σ = √V), coefficient de variation (CV = σ/x̄), intervalle interquartile (IQR = Q3−Q1), formule de Koenig-Huygens.",
            chapitre5: "Chapitre 5 — Séries Doubles. Tableau de contingence, distribution marginale et conditionnelle, covariance, corrélation (coefficient de Pearson r), droite de régression (moindres carrés y = ax + b).",
            chapitre6: "Chapitre 6 — Indices et Séries Chronologiques. Indices simples et synthétiques (Laspeyres, Paasche, Fisher), décomposition d'une série chronologique (tendance, saisonnalité), moyennes mobiles.",
            cartes: "Cartes mémoire Statistiques — Flashcards : formules, indicateurs, graphiques.",
            formules: "Formulaire Statistiques — Résumé : moyenne, médiane, variance, écart-type, corrélation, régression.",
            'simulateur-examen': "Simulateur d'Examen Statistiques — QCM chronométré.",
            exercices: "Exercices interactifs Statistiques — Calculs, tableaux, graphiques, régression."
        },
        fbd: {
            _default: "Cours de Fondamentaux des Bases de Données. Sujets : concepts des BD, modèle relationnel, algèbre relationnelle, SQL de base, normalisation (1NF, 2NF, 3NF, BCNF), dépendances fonctionnelles, SGBD.",
            chapitre1: "Chapitre 1 — Introduction aux Bases de Données. Système d'information, limites des fichiers, SGBD (définition, fonctions, avantages), modèles de données (hiérarchique, réseau, relationnel).",
            chapitre2: "Chapitre 2 — Modèle Relationnel. Relations (tables), attributs (colonnes), tuples (lignes), domaines, clé primaire, clé étrangère, schéma relationnel, contraintes d'intégrité.",
            chapitre3: "Chapitre 3 — Algèbre Relationnelle. Projection (π), sélection (σ), union (∪), intersection (∩), différence (−), produit cartésien (×), jointure (⋈), division.",
            chapitre4: "Chapitre 4 — SQL Fondamental. CREATE TABLE, INSERT, SELECT, WHERE, ORDER BY, GROUP BY, HAVING, jointures (INNER JOIN, LEFT JOIN), sous-requêtes, agrégation (COUNT, SUM, AVG, MIN, MAX).",
            chapitre5: "Chapitre 5 — Dépendances Fonctionnelles et Normalisation. Dépendances fonctionnelles (DF), fermeture, axiomes d'Armstrong, 1NF, 2NF, 3NF, BCNF, décomposition sans perte.",
            chapitre6: "Chapitre 6 — Administration et Sécurité. GRANT/REVOKE, transactions (ACID, COMMIT, ROLLBACK), sauvegardes, index, vues, optimisation de requêtes.",
            cartes: "Cartes mémoire Bases de Données — Flashcards : modèle relationnel, algèbre, SQL, normalisation.",
            formules: "Formulaire Bases de Données — Résumé : définitions, algèbre relationnelle, SQL, formes normales.",
            'simulateur-examen': "Simulateur d'Examen Bases de Données — QCM chronométré.",
            exercices: "Exercices interactifs Bases de Données — Modélisation, algèbre relationnelle, SQL, normalisation."
        },
        merise: {
            _default: "Cours MERISE — Méthode de modélisation des systèmes d'information. Sujets : cycle de vie des SI, niveaux d'abstraction (conceptuel, logique, physique), MCD (entités, associations, cardinalités), MLD (passage MCD→MLD), MPD, MCT, MOT, diagrammes de flux.",
            chapitre1: "Chapitre 1 — Introduction à MERISE. Historique, cycles (abstraction, décision, vie), niveaux conceptuel/logique/physique, démarche de modélisation, acteurs.",
            chapitre2: "Chapitre 2 — Modèle Conceptuel de Données (MCD). Entités, attributs, identifiants, associations (verbe), cardinalités (0,1/1,1/0,n/1,n), association porteuse de données, association réflexive.",
            chapitre3: "Chapitre 3 — Cardinalités et Associations Complexes. Cardinalités minimale/maximale, associations binaires/ternaires, associations n-aires, contraintes d'inclusion/exclusion/totalité.",
            chapitre4: "Chapitre 4 — Passage MCD → MLD. Règles de transformation : entités→tables, associations (1,n)→clé étrangère, associations (n,n)→table de jonction, cas particuliers (1,1), héritage.",
            chapitre5: "Chapitre 5 — Modèle Logique et Physique (MLD/MPD). MLD : schéma relationnel avec clés. MPD : types SQL, index, contraintes. Script SQL de création.",
            chapitre6: "Chapitre 6 — MCT et MOT. Modèle Conceptuel de Traitements (MCT) : événements, opérations, synchronisation, résultats. Modèle Organisationnel de Traitements (MOT) : postes de travail, enchaînement temporel.",
            chapitre7: "Chapitre 7 — Diagrammes de Flux et Modèles Organisationnels. Diagrammes de contexte, de flux, acteurs internes/externes, domaines d'activité, flux d'information.",
            chapitre8: "Chapitre 8 — Étude de Cas Complète. Projet MERISE de bout en bout : analyse, MCD, MLD, MPD, MCT, script SQL, validation.",
            chapitre9: "Chapitre 9 — Exercices de Modélisation. Entraînement sur des cas pratiques variés : bibliothèque, gestion école, e-commerce, hôpital.",
            chapitre10: "Chapitre 10 — Comparaison MERISE et UML. Parallèle entre MCD/diagramme de classes, MCT/diagramme d'activité, avantages/limites de chaque approche.",
            chapitre11: "Chapitre 11 — Normalisation Avancée avec MERISE. Application des formes normales dans le contexte MERISE, décomposition, qualité du MCD.",
            cartes: "Cartes mémoire MERISE — Flashcards : MCD, MLD, cardinalités, règles de passage.",
            formules: "Formulaire MERISE — Résumé : entités, associations, cardinalités, règles MCD→MLD.",
            'simulateur-examen': "Simulateur d'Examen MERISE — QCM chronométré.",
            exercices: "Exercices interactifs MERISE — Modélisation MCD, passage MLD, MCT."
        }
    };

    // ================================================================
    // 3. DÉTECTION DU CONTEXTE
    // ================================================================
    function detectContext() {
        const href = window.location.href.toLowerCase().replace(/\\/g, '/');

        let project = 'portal';
        if (href.includes('/algo/')) project = 'algo';
        else if (href.includes('/c_cpp/')) project = 'c_cpp';
        else if (href.includes('/python/')) project = 'python';
        else if (href.includes('/reseaux/')) project = 'reseaux';
        else if (href.includes('/stats/')) project = 'stats';
        else if (href.includes('/fbd/')) project = 'fbd';
        else if (href.includes('/merise/')) project = 'merise';

        const pageMatch = href.match(/\/([^\/]+)\.html/);
        const page = pageMatch ? pageMatch[1] : 'index';

        const projectCtx = CONTEXTS[project] || CONTEXTS.portal;
        const context = projectCtx[page] || projectCtx._default;

        return { project, page, context };
    }

    function getWelcomeMessage(project) {
        const msgs = {
            portal: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant pédagogique Bachelor 1. Choisis un cours et pose-moi tes questions !",
            algo: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant en Algorithmique. Variables, boucles, tri, récursivité… demande-moi !",
            c_cpp: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant C/C++. Syntaxe, pointeurs, allocation, classes C++… pose tes questions !",
            python: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant Python. Listes, fonctions, classes, modules… je t'aide !",
            reseaux: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant Réseaux. OSI, TCP/IP, adressage, protocoles… je t'explique tout !",
            stats: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant en Statistiques. Moyenne, variance, régression… demande-moi !",
            fbd: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant Bases de Données. Modèle relationnel, SQL, normalisation… je suis là !",
            merise: "Bonjour ! 👋 Je suis **RD-AI**, ton assistant MERISE. MCD, MLD, cardinalités, MCT… pose tes questions !"
        };
        return msgs[project] || msgs.portal;
    }

    function buildSystemPrompt(context) {
        return `Tu es RD-AI, un assistant pédagogique intelligent créé pour aider les étudiants du Portail des Cours Interactifs Bachelor 1.

RÈGLES STRICTES :
- Tu es RD-AI. Ne mentionne JAMAIS DeepSeek, OpenAI, ChatGPT, ou tout autre fournisseur d'IA. Si on te demande qui tu es, tu réponds "Je suis RD-AI, ton assistant pédagogique."
- Tu réponds dans la langue de la question posée par l'étudiant.
- Tu fournis des explications claires, structurées, avec des exemples concrets.
- Tu utilises la notation LaTeX pour les formules mathématiques : $formule$ pour inline, $$formule$$ pour les blocs.
- Tu restes concis mais précis. Pas de réponse de plus de 400 mots sauf si l'étudiant le demande.
- Si la question sort du cadre du cours, signale-le poliment et redirige vers le sujet.
- Tu peux proposer des exercices ou des exemples pour aider à la compréhension.
- Sois encourageant et motivant avec les étudiants.

CONTEXTE DE LA PAGE ACTUELLE :
${context}`;
    }

    // ================================================================
    // 4. RENDU MARKDOWN SIMPLIFIÉ
    // ================================================================
    function renderMarkdown(text) {
        if (!text) return '';
        const codeBlocks = [];
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            const i = codeBlocks.length;
            codeBlocks.push(`<pre class="rdai-code-block"><code>${escapeHtml(code.trim())}</code></pre>`);
            return `%%CODEBLOCK_${i}%%`;
        });
        const inlineCodes = [];
        text = text.replace(/`([^`]+)`/g, (_, code) => {
            const i = inlineCodes.length;
            inlineCodes.push(`<code class="rdai-inline-code">${escapeHtml(code)}</code>`);
            return `%%INLINE_${i}%%`;
        });
        text = escapeHtml(text);
        codeBlocks.forEach((block, i) => { text = text.replace(`%%CODEBLOCK_${i}%%`, block); });
        inlineCodes.forEach((code, i) => { text = text.replace(`%%INLINE_${i}%%`, code); });
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
        text = text.replace(/^### (.+)$/gm, '<strong class="rdai-h3">$1</strong>');
        text = text.replace(/^## (.+)$/gm, '<strong class="rdai-h2">$1</strong>');
        text = text.replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>');
        text = text.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul class="rdai-list">$1</ul>');
        text = text.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
        text = text.replace(/\n{2,}/g, '<br><br>');
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ================================================================
    // 5. FILTRE deepseek/openai/chatgpt → RD-AI
    // ================================================================
    function filterResponse(text) {
        return text
            .replace(/deepseek/gi, 'RD-AI')
            .replace(/deep seek/gi, 'RD-AI')
            .replace(/openai/gi, 'RD-AI')
            .replace(/open ai/gi, 'RD-AI')
            .replace(/chatgpt/gi, 'RD-AI')
            .replace(/chat gpt/gi, 'RD-AI')
            .replace(/gpt-4o[\w-]*/gi, 'RD-AI')
            .replace(/gpt-4[\w-]*/gi, 'RD-AI')
            .replace(/gpt-3\.5[\w-]*/gi, 'RD-AI');
    }

    // ================================================================
    // 6. INJECTION CSS
    // ================================================================
    function injectStyles() {
        if (document.getElementById('rdai-styles')) return;
        const style = document.createElement('style');
        style.id = 'rdai-styles';
        style.textContent = `
/* ========== RD-AI Chat Widget ========== */
.rdai-bubble {
    position: fixed;
    bottom: 70px;
    right: 24px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 4px 20px rgba(99,102,241,0.45);
    z-index: 99999;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: rdai-pulse 3s ease-in-out infinite;
}
.rdai-bubble:hover {
    transform: scale(1.12);
    box-shadow: 0 6px 30px rgba(99,102,241,0.65);
}
.rdai-bubble.rdai-active {
    animation: none;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
}
@keyframes rdai-pulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(99,102,241,0.45); }
    50% { box-shadow: 0 4px 30px rgba(139,92,246,0.7); }
}

/* ========== WhatsApp Button ========== */
.rdai-whatsapp {
    position: fixed;
    bottom: 70px;
    left: 24px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #25D366;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 4px 20px rgba(37,211,102,0.45);
    z-index: 99999;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: wa-pulse 3s ease-in-out infinite;
    text-decoration: none;
}
.rdai-whatsapp:hover {
    transform: scale(1.12);
    box-shadow: 0 6px 30px rgba(37,211,102,0.65);
    color: #fff;
}
.rdai-whatsapp .wa-tooltip {
    position: absolute;
    left: 70px;
    background: #1e293b;
    color: #fff;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 13px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform: translateX(-8px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.rdai-whatsapp .wa-tooltip::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: #1e293b;
    border-left: none;
}
.rdai-whatsapp:hover .wa-tooltip {
    opacity: 1;
    transform: translateX(0);
}
@keyframes wa-pulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
    50% { box-shadow: 0 4px 30px rgba(37,211,102,0.7); }
}

/* Panel */
.rdai-panel {
    position: fixed;
    bottom: 140px;
    right: 24px;
    width: 400px;
    height: 540px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05);
    z-index: 99998;
    opacity: 0;
    transform: translateY(24px) scale(0.92);
    pointer-events: none;
    transition: opacity 0.35s ease, transform 0.35s ease;
}
.rdai-panel.rdai-open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}

/* Header */
.rdai-header {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}
.rdai-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.rdai-header-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}
.rdai-header-info h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
}
.rdai-header-info span {
    font-size: 11px;
    opacity: 0.85;
}
.rdai-header-actions {
    display: flex;
    gap: 4px;
}
.rdai-header-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.75;
    padding: 4px 6px;
    border-radius: 6px;
    transition: opacity 0.2s, background 0.2s;
}
.rdai-header-btn:hover {
    opacity: 1;
    background: rgba(255,255,255,0.15);
}

/* Messages */
.rdai-messages {
    flex: 1;
    overflow-y: auto;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
}
.rdai-messages::-webkit-scrollbar { width: 5px; }
.rdai-messages::-webkit-scrollbar-track { background: transparent; }
.rdai-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.rdai-msg {
    display: flex;
    align-items: flex-end;
    gap: 8px;
}
.rdai-msg-user { flex-direction: row-reverse; }

.rdai-msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
}
.rdai-msg-ai .rdai-msg-avatar {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
}
.rdai-msg-user .rdai-msg-avatar {
    background: #e2e8f0;
    color: #475569;
}

.rdai-msg-content {
    max-width: 82%;
    padding: 11px 15px;
    border-radius: 18px;
    font-size: 13.5px;
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
}
.rdai-msg-user .rdai-msg-content {
    background: linear-gradient(135deg, #6366f1, #7c3aed);
    color: #fff;
    border-bottom-right-radius: 6px;
}
.rdai-msg-ai .rdai-msg-content {
    background: #f1f5f9;
    color: #1e293b;
    border-bottom-left-radius: 6px;
}

/* Code blocks */
.rdai-code-block {
    background: #1e293b;
    color: #e2e8f0;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 12.5px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    overflow-x: auto;
    margin: 8px 0;
    white-space: pre-wrap;
    word-break: break-all;
}
.rdai-inline-code {
    background: rgba(99,102,241,0.12);
    color: #6366f1;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12.5px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
.rdai-list {
    margin: 6px 0;
    padding-left: 20px;
}
.rdai-list li {
    margin: 3px 0;
}
.rdai-h2 { font-size: 1.1em; display: block; margin: 8px 0 4px; }
.rdai-h3 { font-size: 1.05em; display: block; margin: 6px 0 3px; }

/* Typing indicator */
.rdai-typing .rdai-msg-content {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 14px 20px;
}
.rdai-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    animation: rdai-bounce 1.4s infinite ease-in-out;
}
.rdai-dot:nth-child(2) { animation-delay: 0.16s; }
.rdai-dot:nth-child(3) { animation-delay: 0.32s; }
@keyframes rdai-bounce {
    0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
}

/* Input area */
.rdai-input-area {
    padding: 14px 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-shrink: 0;
    background: #fff;
}
.rdai-input {
    flex: 1;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 13.5px;
    line-height: 1.4;
    resize: none;
    outline: none;
    font-family: inherit;
    max-height: 100px;
    min-height: 42px;
    background: #f8fafc;
    transition: border-color 0.2s;
}
.rdai-input:focus {
    border-color: #6366f1;
}
.rdai-input::placeholder {
    color: #94a3b8;
}
.rdai-send {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s, opacity 0.2s;
    font-size: 16px;
}
.rdai-send:hover:not(:disabled) { transform: scale(1.08); }
.rdai-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Footer */
.rdai-footer {
    text-align: center;
    padding: 6px;
    font-size: 10px;
    color: #94a3b8;
    flex-shrink: 0;
    border-top: 1px solid #f1f5f9;
}

/* ========== DARK MODE ========== */
[data-theme="dark"] .rdai-panel,
html.dark .rdai-panel,
body.dark-mode .rdai-panel {
    background: #0f172a;
    box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
}
[data-theme="dark"] .rdai-msg-ai .rdai-msg-content,
html.dark .rdai-msg-ai .rdai-msg-content,
body.dark-mode .rdai-msg-ai .rdai-msg-content {
    background: #1e293b;
    color: #e2e8f0;
}
[data-theme="dark"] .rdai-msg-user .rdai-msg-avatar,
html.dark .rdai-msg-user .rdai-msg-avatar,
body.dark-mode .rdai-msg-user .rdai-msg-avatar {
    background: #334155;
    color: #e2e8f0;
}
[data-theme="dark"] .rdai-input-area,
html.dark .rdai-input-area,
body.dark-mode .rdai-input-area {
    border-top-color: #1e293b;
    background: #0f172a;
}
[data-theme="dark"] .rdai-input,
html.dark .rdai-input,
body.dark-mode .rdai-input {
    background: #1e293b;
    border-color: #334155;
    color: #e2e8f0;
}
[data-theme="dark"] .rdai-input::placeholder,
html.dark .rdai-input::placeholder,
body.dark-mode .rdai-input::placeholder {
    color: #64748b;
}
[data-theme="dark"] .rdai-messages::-webkit-scrollbar-thumb,
html.dark .rdai-messages::-webkit-scrollbar-thumb,
body.dark-mode .rdai-messages::-webkit-scrollbar-thumb {
    background: #334155;
}
[data-theme="dark"] .rdai-footer,
html.dark .rdai-footer,
body.dark-mode .rdai-footer {
    border-top-color: #1e293b;
    color: #475569;
}
[data-theme="dark"] .rdai-inline-code,
html.dark .rdai-inline-code,
body.dark-mode .rdai-inline-code {
    background: rgba(99,102,241,0.2);
    color: #a5b4fc;
}
[data-theme="dark"] .rdai-code-block,
html.dark .rdai-code-block,
body.dark-mode .rdai-code-block {
    background: #0f172a;
    border: 1px solid #1e293b;
}
[data-theme="dark"] .rdai-whatsapp .wa-tooltip,
html.dark .rdai-whatsapp .wa-tooltip,
body.dark-mode .rdai-whatsapp .wa-tooltip {
    background: #334155;
}
[data-theme="dark"] .rdai-whatsapp .wa-tooltip::before,
html.dark .rdai-whatsapp .wa-tooltip::before,
body.dark-mode .rdai-whatsapp .wa-tooltip::before {
    border-right-color: #334155;
}

/* ========== MOBILE ========== */
@media (max-width: 480px) {
    .rdai-panel {
        bottom: 46px;
        right: 0;
        left: 0;
        width: 100%;
        height: 70vh;
        border-radius: 20px 20px 0 0;
    }
    .rdai-bubble {
        bottom: 62px;
        right: 16px;
        width: 52px;
        height: 52px;
        font-size: 22px;
    }
    .rdai-whatsapp {
        bottom: 62px;
        left: 16px;
        width: 52px;
        height: 52px;
        font-size: 24px;
    }
    .rdai-whatsapp .wa-tooltip {
        display: none;
    }
}
@media (max-width: 768px) and (min-width: 481px) {
    .rdai-panel {
        width: 340px;
        height: 480px;
    }
}
`;
        document.head.appendChild(style);
    }

    // ================================================================
    // 7. CRÉATION DU WIDGET + WHATSAPP
    // ================================================================
    let panelEl, messagesEl, inputEl, sendBtn, typingEl;
    let isOpen = false;
    let isStreaming = false;
    let messages = [];
    let ctx;

    function createWidget() {
        // AI Chat Bubble (right)
        const bubble = document.createElement('button');
        bubble.className = 'rdai-bubble';
        bubble.setAttribute('aria-label', 'Ouvrir le chat RD-AI');
        bubble.setAttribute('title', 'Discuter avec RD-AI');
        bubble.innerHTML = '<i class="fas fa-robot"></i>';
        bubble.addEventListener('click', togglePanel);
        document.body.appendChild(bubble);

        // WhatsApp Button (left)
        const waLink = document.createElement('a');
        waLink.className = 'rdai-whatsapp';
        waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        waLink.setAttribute('aria-label', 'Contacter sur WhatsApp');
        waLink.setAttribute('title', 'Contacter sur WhatsApp');
        waLink.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span class="wa-tooltip">💬 Me contacter sur WhatsApp</span>
        `;
        document.body.appendChild(waLink);

        // Chat Panel
        panelEl = document.createElement('div');
        panelEl.className = 'rdai-panel';
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-label', 'Chat RD-AI');
        panelEl.innerHTML = `
            <div class="rdai-header">
                <div class="rdai-header-left">
                    <div class="rdai-header-avatar"><i class="fas fa-robot"></i></div>
                    <div class="rdai-header-info">
                        <h3>RD-AI</h3>
                        <span>Assistant pédagogique B1</span>
                    </div>
                </div>
                <div class="rdai-header-actions">
                    <button class="rdai-header-btn rdai-clear-btn" title="Effacer l'historique"><i class="fas fa-trash-can"></i></button>
                    <button class="rdai-header-btn rdai-close-btn" title="Fermer"><i class="fas fa-xmark"></i></button>
                </div>
            </div>
            <div class="rdai-messages"></div>
            <div class="rdai-input-area">
                <textarea class="rdai-input" placeholder="Pose ta question..." rows="1"></textarea>
                <button class="rdai-send" title="Envoyer" disabled><i class="fas fa-paper-plane"></i></button>
            </div>
            <div class="rdai-footer">RD-AI — Assistant pédagogique intelligent</div>
        `;
        document.body.appendChild(panelEl);

        messagesEl = panelEl.querySelector('.rdai-messages');
        inputEl = panelEl.querySelector('.rdai-input');
        sendBtn = panelEl.querySelector('.rdai-send');

        panelEl.querySelector('.rdai-close-btn').addEventListener('click', togglePanel);
        panelEl.querySelector('.rdai-clear-btn').addEventListener('click', clearHistory);
        sendBtn.addEventListener('click', sendMessage);

        inputEl.addEventListener('input', () => {
            sendBtn.disabled = !inputEl.value.trim() || isStreaming;
            autoResize(inputEl);
        });
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputEl.value.trim() && !isStreaming) sendMessage();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) togglePanel();
        });
    }

    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }

    function togglePanel() {
        isOpen = !isOpen;
        panelEl.classList.toggle('rdai-open', isOpen);
        document.querySelector('.rdai-bubble').classList.toggle('rdai-active', isOpen);
        if (isOpen) {
            inputEl.focus();
            scrollToBottom();
        }
    }

    // ================================================================
    // 8. GESTION DES MESSAGES
    // ================================================================
    function addMessageToDOM(role, content, isWelcome) {
        const msg = document.createElement('div');
        msg.className = `rdai-msg rdai-msg-${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'rdai-msg-avatar';
        avatar.innerHTML = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        const contentEl = document.createElement('div');
        contentEl.className = 'rdai-msg-content';
        contentEl.innerHTML = renderMarkdown(content);

        msg.appendChild(avatar);
        msg.appendChild(contentEl);

        if (typingEl && typingEl.parentNode) {
            messagesEl.insertBefore(msg, typingEl);
        } else {
            messagesEl.appendChild(msg);
        }
        scrollToBottom();
        return contentEl;
    }

    function showTyping() {
        typingEl = document.createElement('div');
        typingEl.className = 'rdai-msg rdai-msg-ai rdai-typing';
        typingEl.innerHTML = `
            <div class="rdai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="rdai-msg-content">
                <div class="rdai-dot"></div>
                <div class="rdai-dot"></div>
                <div class="rdai-dot"></div>
            </div>
        `;
        messagesEl.appendChild(typingEl);
        scrollToBottom();
    }

    function hideTyping() {
        if (typingEl && typingEl.parentNode) {
            typingEl.parentNode.removeChild(typingEl);
            typingEl = null;
        }
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        });
    }

    // ================================================================
    // 9. HISTORIQUE localStorage
    // ================================================================
    function getStorageKey() {
        return `rdai_history_b1_${ctx.project}`;
    }

    function loadHistory() {
        try {
            const stored = localStorage.getItem(getStorageKey());
            if (stored) {
                const data = JSON.parse(stored);
                messages = data.messages || [];
            }
        } catch (e) {
            messages = [];
        }
    }

    function saveHistory() {
        try {
            const data = {
                project: ctx.project,
                messages: messages.slice(-CONFIG.maxHistory),
                timestamp: Date.now()
            };
            localStorage.setItem(getStorageKey(), JSON.stringify(data));
        } catch (e) { /* quota exceeded */ }
    }

    function clearHistory() {
        messages = [];
        try { localStorage.removeItem(getStorageKey()); } catch (e) {}
        messagesEl.innerHTML = '';
        addMessageToDOM('ai', getWelcomeMessage(ctx.project), true);
    }

    function renderStoredMessages() {
        messagesEl.innerHTML = '';
        addMessageToDOM('ai', getWelcomeMessage(ctx.project), true);
        messages.forEach(m => {
            addMessageToDOM(m.role === 'user' ? 'user' : 'ai', m.content);
        });
        scrollToBottom();
    }

    // ================================================================
    // 10. ENVOI / APPEL API (streaming)
    // ================================================================
    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text || isStreaming) return;

        inputEl.value = '';
        inputEl.style.height = 'auto';
        sendBtn.disabled = true;
        addMessageToDOM('user', text);
        messages.push({ role: 'user', content: text });
        saveHistory();

        isStreaming = true;
        showTyping();

        try {
            const apiMessages = [
                { role: 'system', content: buildSystemPrompt(ctx.context) },
                ...messages.slice(-CONFIG.maxHistory)
            ];

            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: CONFIG.model,
                    messages: apiMessages,
                    max_tokens: CONFIG.maxTokens,
                    temperature: CONFIG.temperature,
                    stream: true
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error ${response.status}: ${errText}`);
            }

            hideTyping();
            let fullResponse = '';
            const contentEl = addMessageToDOM('ai', '');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data: ')) continue;
                    const data = trimmed.slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content || '';
                        if (delta) {
                            fullResponse += delta;
                            contentEl.innerHTML = renderMarkdown(filterResponse(fullResponse));
                            scrollToBottom();
                        }
                    } catch (e) { /* skip malformed chunk */ }
                }
            }

            fullResponse = filterResponse(fullResponse);
            contentEl.innerHTML = renderMarkdown(fullResponse);
            messages.push({ role: 'assistant', content: fullResponse });
            saveHistory();

            triggerMathJax(contentEl);

        } catch (err) {
            hideTyping();
            console.error('RD-AI Error:', err);
            let errorMsg = "Désolé, je n'ai pas pu répondre. ";
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                errorMsg += "Vérifie ta connexion internet.";
            } else if (err.message.includes('401') || err.message.includes('403')) {
                errorMsg += "Problème d'authentification. Contacte l'administrateur.";
            } else if (err.message.includes('429')) {
                errorMsg += "Trop de requêtes. Attends un moment et réessaie.";
            } else {
                errorMsg += "Une erreur est survenue. Réessaie dans quelques instants.";
            }
            addMessageToDOM('ai', errorMsg);
        } finally {
            isStreaming = false;
            sendBtn.disabled = !inputEl.value.trim();
        }
    }

    function triggerMathJax(el) {
        try {
            if (window.MathJax) {
                if (typeof MathJax.typesetPromise === 'function') {
                    MathJax.typesetPromise([el]).catch(() => {});
                } else if (typeof MathJax.typeset === 'function') {
                    MathJax.typeset([el]);
                }
            }
        } catch (e) { /* MathJax not available */ }
    }

    // ================================================================
    // 11. INITIALISATION
    // ================================================================
    function init() {
        ctx = detectContext();
        injectStyles();
        createWidget();
        loadHistory();
        renderStoredMessages();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
