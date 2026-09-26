// --- INITIALISATION & SAUVEGARDE & STATS ---
let solde = localStorage.getItem('mpc_solde');
solde = solde === null ? 500 : parseInt(solde);
let estAdmin = localStorage.getItem('mpc_admin') === 'true';

// Gestion des statistiques
let stats = JSON.parse(localStorage.getItem('mpc_stats')) || { parties: 0, mises: 0, gains: 0 };

function mettreAJourAffichage() {
    document.getElementById('solde-text').innerText = solde;
    localStorage.setItem('mpc_solde', solde);

    if (estAdmin === true) {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('btn-code').style.display = 'none'; 
    } else {
        document.getElementById('btn-code').style.display = 'block';
    }
}

function enregistrerStatistique(mise, gain) {
    stats.parties += 1;
    stats.mises += mise;
    stats.gains += gain;
    localStorage.setItem('mpc_stats', JSON.stringify(stats));
}

// --- SYSTÈME D'ALERTES CUSTOMISÉES ---
function customAlerte(message) {
    document.getElementById('custom-alert-text').innerText = message;
    document.getElementById('custom-alert-overlay').style.display = 'flex';
}
function fermerAlerte() {
    document.getElementById('custom-alert-overlay').style.display = 'none';
}

// --- PANNEAU STATISTIQUES ---
function ouvrirStats() {
    document.getElementById('stat-parties').innerText = stats.parties;
    document.getElementById('stat-mises').innerText = stats.mises + " €";
    document.getElementById('stat-gains').innerText = stats.gains + " €";
    
    let pnl = stats.gains - stats.mises;
    let pnlEl = document.getElementById('stat-pnl');
    pnlEl.innerText = (pnl > 0 ? "+" : "") + pnl + " €";
    pnlEl.style.color = pnl > 0 ? "#30d158" : (pnl < 0 ? "#ff453a" : "#fff");
    
    document.getElementById('stats-overlay').style.display = 'flex';
}
function fermerStats() { document.getElementById('stats-overlay').style.display = 'none'; }

// --- LOGIQUE DU MINI-JEU MACHINE À SOUS ---
const symboles = ['🍒', '🍋', '🔔', '💎'];
let enTrainDeTourner = false;

function lancerMiniJeu() {
    document.getElementById('minijeu-overlay').style.display = 'flex';
    document.getElementById('minijeu-message').innerText = "Tente ta chance !";
    document.getElementById('minijeu-message').style.color = "#FFB703";
}
function fermerMiniJeu() { if (!enTrainDeTourner) document.getElementById('minijeu-overlay').style.display = 'none'; }

function jouerMiniJeu() {
    if (enTrainDeTourner) return;
    enTrainDeTourner = true;
    let message = document.getElementById('minijeu-message');
    message.innerText = "Ça tourne..."; message.style.color = "#ffffff";
    let slot1 = document.getElementById('slot1'), slot2 = document.getElementById('slot2'), slot3 = document.getElementById('slot3');

    let tours = 0;
    let interval = setInterval(() => {
        slot1.innerText = symboles[Math.floor(Math.random() * symboles.length)];
        slot2.innerText = symboles[Math.floor(Math.random() * symboles.length)];
        slot3.innerText = symboles[Math.floor(Math.random() * symboles.length)];
        tours++;
        if (tours > 20) {
            clearInterval(interval);
            verifierVictoire(slot1.innerText, slot2.innerText, slot3.innerText);
        }
    }, 80);
}

function verifierVictoire(s1, s2, s3) {
    enTrainDeTourner = false;
    let message = document.getElementById('minijeu-message');
    if (s1 === s2 && s2 === s3) {
        let gain = (s1 === '💎') ? 1000 : 200; 
        message.innerText = `JACKPOT ! Tu gagnes ${gain}€ !`;
        message.style.color = "#4CAF50"; 
        solde += gain;
        enregistrerStatistique(0, gain); // Bonus gratuit
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        message.innerText = "Pas mal ! Tu gagnes 30€ !";
        message.style.color = "#FFB703";
        solde += 30;
        enregistrerStatistique(0, 30);
    } else {
        message.innerText = "Perdu... Retente ta chance !";
        message.style.color = "red";
    }
    mettreAJourAffichage();
}

// --- GESTION DU CODE SECRET ---
function ouvrirModalCode() {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('input-code').value = ''; document.getElementById('input-code').focus();
}
function fermerModalCode() { document.getElementById('modal-overlay').style.display = 'none'; }
function validerCode() {
    let codeTape = document.getElementById('input-code').value;
    if (codeTape === "BOSS") { 
        estAdmin = true; localStorage.setItem('mpc_admin', 'true');
        fermerModalCode(); mettreAJourAffichage();
    } else {
        let input = document.getElementById('input-code');
        input.style.border = "1px solid red"; setTimeout(() => { input.style.border = "1px solid #333"; }, 1000);
    }
}
function ajouterArgent() {
    let input = document.getElementById('ajout-montant');
    let montant = parseInt(input.value);
    if (!isNaN(montant) && montant > 0) {
        solde += montant;
        estAdmin = false; localStorage.setItem('mpc_admin', 'false'); // Se referme
        document.getElementById('admin-panel').style.display = 'none';
        mettreAJourAffichage(); input.value = ''; 
    }
}

// --- JEU : LA ROULETTE PROFESSIONNELLE ---
let valeurJetonActuel = 10;
let parisSurTapis = {};
const numerosRouges = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function ouvrirRoulette() {
    document.getElementById('menu-principal').style.display = 'none'; document.getElementById('roulette-view').style.display = 'flex';
    const board = document.getElementById('board-numbers');
    if (board.innerHTML === "") {
        for (let i = 1; i <= 36; i++) {
            let col = numerosRouges.includes(i) ? 'red' : 'black';
            board.innerHTML += `<div class="bet-spot ${col}" onclick="placerPari('${i}')">${i}<span class="chip-bet" id="bet-${i}"></span></div>`;
        }
    }
}
function fermerRoulette() { annulerParis(); document.getElementById('roulette-view').style.display = 'none'; document.getElementById('menu-principal').style.display = 'flex'; }
function choisirJeton(valeur) { valeurJetonActuel = valeur; document.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); document.getElementById(`chip-${valeur}`).classList.add('active'); }
function placerPari(zone) {
    if (solde < valeurJetonActuel) return customAlerte("Fonds insuffisants !");
    solde -= valeurJetonActuel; mettreAJourAffichage();
    if (!parisSurTapis[zone]) parisSurTapis[zone] = 0;
    parisSurTapis[zone] += valeurJetonActuel;
    let bulle = document.getElementById(`bet-${zone}`);
    bulle.style.display = 'block';
    bulle.innerText = parisSurTapis[zone] >= 1000 ? (parisSurTapis[zone]/1000).toFixed(1) + 'k' : parisSurTapis[zone];
}
function annulerParis() {
    for (let zone in parisSurTapis) { solde += parisSurTapis[zone]; }
    parisSurTapis = {}; mettreAJourAffichage();
    document.querySelectorAll('.chip-bet').forEach(j => { j.style.display = 'none'; j.innerText = ''; });
}
function lancerRoulettePro() {
    if (Object.keys(parisSurTapis).length === 0) return customAlerte("Placez au moins un pari !");
    let btn = document.getElementById('btn-lancer-roulette'); btn.disabled = true;
    document.getElementById('roulette-resultat-pro').innerText = "La roue tourne... 🌪️";
    setTimeout(() => {
        let numeroGagnant = Math.floor(Math.random() * 37);
        let totalGagne = 0, miseTotaleRonde = 0;
        let estRouge = numerosRouges.includes(numeroGagnant), estNoir = numeroGagnant !== 0 && !estRouge;
        let estPair = numeroGagnant !== 0 && numeroGagnant % 2 === 0, estImpair = numeroGagnant !== 0 && numeroGagnant % 2 !== 0;

        for (let zone in parisSurTapis) {
            let m = parisSurTapis[zone];
            miseTotaleRonde += m;
            if (zone === numeroGagnant.toString()) totalGagne += m * 36;
            if (zone === 'rouge' && estRouge) totalGagne += m * 2;
            if (zone === 'noir' && estNoir) totalGagne += m * 2;
            if (zone === 'pair' && estPair) totalGagne += m * 2;
            if (zone === 'impair' && estImpair) totalGagne += m * 2;
            if (zone === '1-18' && numeroGagnant >= 1 && numeroGagnant <= 18) totalGagne += m * 2;
            if (zone === '19-36' && numeroGagnant >= 19 && numeroGagnant <= 36) totalGagne += m * 2;
        }
        solde += totalGagne; mettreAJourAffichage();
        enregistrerStatistique(miseTotaleRonde, totalGagne); // Stats

        let res = document.getElementById('roulette-resultat-pro');
        res.innerText = `Résultat: ${numeroGagnant === 0 ? "🟢" : (estRouge ? "🔴" : "⚫")} ${numeroGagnant}`;
        res.innerHTML += totalGagne > 0 ? `<br><span style="color:#4CAF50;">+ ${totalGagne}€ !</span>` : `<br><span style="color:#d32f2f;">Perdu (-${miseTotaleRonde}€)</span>`;
        
        parisSurTapis = {}; document.querySelectorAll('.chip-bet').forEach(j => j.style.display = 'none'); btn.disabled = false;
    }, 2000);
}

// --- JEU : POKER ---
function ouvrirPoker() { document.getElementById('menu-principal').style.display = 'none'; document.getElementById('poker-view').style.display = 'flex'; }
function fermerPoker() { document.getElementById('poker-view').style.display = 'none'; document.getElementById('menu-principal').style.display = 'flex'; }
function pokerAction(action) { customAlerte("Action : " + action + " (Moteur Poker à venir !)"); }

// --- JEU : BLACKJACK PREMIUM (Avec Split & Animation fluide) ---
let bjDeck = [];
let bjDealerHand = [];
let bjHands = [[]]; // Tableau de mains (pour le split)
let bjMises = [0];  // Mise pour chaque main
let bjMiseLL = 0;
let bjMiseAssurance = 0;
let bjValeurJeton = 10;
let bjPartieEnCours = false;
let currentHandIndex = 0;

const symbolesCartes = { 'coeur': '♥', 'carreau': '♦', 'pique': '♠', 'trefle': '♣' };

function ouvrirBlackjack() {
    document.getElementById('menu-principal').style.display = 'none'; document.getElementById('bj-view').style.display = 'flex';
    reinitialiserBj();
}
function fermerBlackjack() {
    if (bjPartieEnCours) return customAlerte("Terminez la main en cours avant de quitter.");
    retirerMisesBj(); document.getElementById('bj-view').style.display = 'none'; document.getElementById('menu-principal').style.display = 'flex';
}

function choisirJetonBj(valeur) {
    bjValeurJeton = valeur;
    document.querySelectorAll('#bj-chip-selector .chip-clean').forEach(c => c.classList.remove('active'));
    document.getElementById(`bj-chip-${valeur}`).classList.add('active');
}

// Animation parfaitement fluide basée sur Transform
function animerJeton(valeur, cibleId) {
    let selecteur = document.getElementById(`bj-chip-${valeur}`);
    let cible = document.getElementById(cibleId);
    let rSel = selecteur.getBoundingClientRect(); let rCib = cible.getBoundingClientRect();
    
    let jeton = document.createElement('div');
    jeton.className = 'flying-chip';
    jeton.style.left = '0'; jeton.style.top = '0';
    jeton.style.transform = `translate(${rSel.left}px, ${rSel.top}px)`;
    document.body.appendChild(jeton);
    
    // Déclenchement de l'animation CSS fluide
    setTimeout(() => {
        jeton.style.transform = `translate(${rCib.left + rCib.width/2 - 22}px, ${rCib.top + rCib.height/2 - 22}px)`;
    }, 10);
    
    setTimeout(() => { jeton.remove(); dessinerJetonsVisuels(); }, 300);
}

function placerMiseBj(zone) {
    if (bjPartieEnCours) return;
    if (solde < bjValeurJeton) return customAlerte("Fonds insuffisants !");
    
    solde -= bjValeurJeton;
    if (zone === 'main') { bjMises[0] += bjValeurJeton; animerJeton(bjValeurJeton, 'bj-main-spot'); }
    else if (zone === 'll') { bjMiseLL += bjValeurJeton; animerJeton(bjValeurJeton, 'bj-ll-spot'); }
    
    mettreAJourAffichage();
    document.getElementById('btn-clear-bets').style.visibility = 'visible';
    if (bjMises[0] > 0) document.getElementById('btn-deal').disabled = false;
}

function dessinerJetonsVisuels() {
    document.getElementById('bj-main-chips').innerHTML = bjMises[0] > 0 ? `<div class="chip-mini">${bjMises[0] >= 1000 ? (bjMises[0]/1000).toFixed(1)+'k' : bjMises[0]}</div>` : '';
    document.getElementById('bj-ll-chips').innerHTML = bjMiseLL > 0 ? `<div class="chip-mini" style="background: #e91e63; color: white;">${bjMiseLL >= 1000 ? (bjMiseLL/1000).toFixed(1)+'k' : bjMiseLL}</div>` : '';
}

function retirerMisesBj() {
    if (bjPartieEnCours) return;
    solde += (bjMises[0] + bjMiseLL); bjMises[0] = 0; bjMiseLL = 0; mettreAJourAffichage();
    document.getElementById('btn-deal').disabled = true; document.getElementById('btn-clear-bets').style.visibility = 'hidden';
    dessinerJetonsVisuels();
}

function creerDeck() {
    let vals = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let cols = ['coeur', 'carreau', 'pique', 'trefle']; let deck = [];
    for(let j=0; j<4; j++) { for (let c of cols) { for (let v of vals) { deck.push({ valeur:v, couleur:c }); } } }
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    return deck;
}

function calculerScore(main) {
    let score = 0, as = 0;
    for (let c of main) {
        if (['J', 'Q', 'K'].includes(c.valeur)) score += 10;
        else if (c.valeur === 'A') { score += 11; as += 1; }
        else score += parseInt(c.valeur);
    }
    while (score > 21 && as > 0) { score -= 10; as -= 1; }
    return score;
}

function getValeurAbsolue(carte) { return ['J','Q','K'].includes(carte.valeur) ? 10 : (carte.valeur === 'A' ? 11 : parseInt(carte.valeur)); }

function ajouterCarteVisuelle(cibleId, carte, cachee = false, noAnim = false) {
    let container = document.getElementById(cibleId);
    let div = document.createElement('div');
    if (cachee) { div.className = 'bj-card hidden'; div.id = 'dealer-hidden-card'; } 
    else {
        div.className = `bj-card ${(carte.couleur === 'coeur' || carte.couleur === 'carreau') ? 'red' : 'black'}`;
        if (noAnim) div.classList.add('no-anim');
        div.innerHTML = `<div class="card-top">${carte.valeur}${symbolesCartes[carte.couleur]}</div><div class="card-center">${symbolesCartes[carte.couleur]}</div><div class="card-bottom">${carte.valeur}${symbolesCartes[carte.couleur]}</div>`;
    }
    container.appendChild(div);
}

function actualiserScoresVisuels(cacherCroupier = true) {
    for (let i = 0; i < bjHands.length; i++) {
        if (bjHands[i].length > 0) {
            document.getElementById(`player-score-${i}`).innerText = calculerScore(bjHands[i]);
            document.getElementById(`player-score-box-${i}`).classList.add('active');
        }
    }
    if (bjDealerHand.length > 0) {
        document.getElementById('dealer-score').innerText = cacherCroupier ? calculerScore([bjDealerHand[0]]) : calculerScore(bjDealerHand);
        document.getElementById('dealer-score-box').classList.add('active');
    }
}

// Distribution carte par carte avec JavaScript
function distribuerBj() {
    bjPartieEnCours = true; currentHandIndex = 0;
    document.getElementById('bj-bet-controls').style.display = 'none';
    document.getElementById('btn-clear-bets').style.visibility = 'hidden';
    document.getElementById('bj-bet-zones').style.display = 'none'; // Masque les zones de mises visuelles
    
    bjDeck = creerDeck(); bjHands = [[]]; bjDealerHand = [];
    document.getElementById('player-cards-0').innerHTML = ""; document.getElementById('dealer-cards').innerHTML = "";
    
    let delai = 0;
    setTimeout(() => { let c = bjDeck.pop(); bjHands[0].push(c); ajouterCarteVisuelle('player-cards-0', c); actualiserScoresVisuels(true); }, delai += 300);
    setTimeout(() => { let c = bjDeck.pop(); bjDealerHand.push(c); ajouterCarteVisuelle('dealer-cards', c); actualiserScoresVisuels(true); }, delai += 500);
    setTimeout(() => { let c = bjDeck.pop(); bjHands[0].push(c); ajouterCarteVisuelle('player-cards-0', c); actualiserScoresVisuels(true); }, delai += 500);
    setTimeout(() => { let c = bjDeck.pop(); bjDealerHand.push(c); ajouterCarteVisuelle('dealer-cards', c, true); }, delai += 500);
    
    setTimeout(() => {
        evaluerLuckyLadies();
        if (bjDealerHand[0].valeur === 'A') {
            document.getElementById('bj-insurance-cost').innerText = `Coût: ${bjMises[0] / 2}€`;
            document.getElementById('bj-insurance-overlay').style.display = 'block';
        } else { continuerApresDistribution(); }
    }, delai += 600);
}

function evaluerLuckyLadies() {
    if (bjMiseLL === 0) return;
    let c1 = bjHands[0][0], c2 = bjHands[0][1];
    let v1 = getValeurAbsolue(c1), v2 = getValeurAbsolue(c2);
    
    let mise = bjMiseLL; bjMiseLL = 0; // Consommée
    if (v1 + v2 === 20) {
        let gain = 0, isSuited = c1.couleur === c2.couleur, isMatched = isSuited && c1.valeur === c2.valeur;
        if (c1.valeur === 'Q' && c2.valeur === 'Q' && c1.couleur === 'coeur' && c2.couleur === 'coeur') gain = mise * 200;
        else if (isMatched) gain = mise * 25;
        else if (isSuited) gain = mise * 10;
        else gain = mise * 4;
        
        solde += (gain + mise); mettreAJourAffichage(); enregistrerStatistique(mise, gain);
        customAlerte(`Lucky Ladies Gagné ! +${gain}€`);
    } else {
        enregistrerStatistique(mise, 0); // Perte stat
    }
}

function repondreAssurance(veutAssurance) {
    document.getElementById('bj-insurance-overlay').style.display = 'none';
    if (veutAssurance && solde >= (bjMises[0] / 2)) {
        bjMiseAssurance = bjMises[0] / 2; solde -= bjMiseAssurance; mettreAJourAffichage();
    } else if (veutAssurance) { customAlerte("Fonds insuffisants pour l'assurance."); }
    
    if (calculerScore(bjDealerHand) === 21) {
        if (bjMiseAssurance > 0) { solde += (bjMiseAssurance * 3); mettreAJourAffichage(); enregistrerStatistique(bjMiseAssurance, bjMiseAssurance * 2); }
        finirPartieFinale("croupier_bj");
    } else {
        if (bjMiseAssurance > 0) enregistrerStatistique(bjMiseAssurance, 0); // Perdue
        continuerApresDistribution();
    }
}

function continuerApresDistribution() {
    document.getElementById('bj-play-controls').style.display = 'flex';
    verifierBoutonsJoueur();
    if (calculerScore(bjHands[0]) === 21) {
        // Blackjack naturel
        gererFinDeMainCourante();
    }
}

function verifierBoutonsJoueur() {
    let main = bjHands[currentHandIndex];
    document.getElementById('btn-double').disabled = (main.length !== 2 || solde < bjMises[currentHandIndex]);
    
    // Le Split n'est possible que s'il y a 1 seule main (pas de re-split), 2 cartes de même valeur
    let btnSplit = document.getElementById('btn-split');
    if (bjHands.length === 1 && main.length === 2 && getValeurAbsolue(main[0]) === getValeurAbsolue(main[1]) && solde >= bjMises[0]) {
        btnSplit.style.display = 'block';
    } else {
        btnSplit.style.display = 'none';
    }
    
    // Met en évidence la main active
    document.querySelectorAll('.bj-hand-column').forEach((el, index) => {
        if (index === currentHandIndex) el.classList.add('active-hand');
        else el.classList.remove('active-hand');
    });
}

function separerBj() {
    if (solde < bjMises[0]) return;
    solde -= bjMises[0]; mettreAJourAffichage();
    
    // Création de la seconde main
    bjMises.push(bjMises[0]);
    let carteSeparee = bjHands[0].pop();
    bjHands.push([carteSeparee]);
    
    // UI : Créer la deuxième colonne
    let wrapper = document.getElementById('bj-player-hands-wrapper');
    wrapper.innerHTML = `
        <div class="bj-hand-column active-hand" id="bj-hand-0">
            <div class="bj-score-pill player-score active" id="player-score-box-0"><span id="player-score-0">0</span></div>
            <div class="cards-container" id="player-cards-0"></div>
        </div>
        <div class="bj-hand-column" id="bj-hand-1">
            <div class="bj-score-pill player-score active" id="player-score-box-1"><span id="player-score-1">0</span></div>
            <div class="cards-container" id="player-cards-1"></div>
        </div>
    `;
    // Redessiner sans animation
    ajouterCarteVisuelle('player-cards-0', bjHands[0][0], false, true);
    ajouterCarteVisuelle('player-cards-1', bjHands[1][0], false, true);
    
    document.getElementById('btn-split').style.display = 'none';
    
    // Tirer une carte pour la première main
    setTimeout(() => {
        let c = bjDeck.pop(); bjHands[0].push(c); ajouterCarteVisuelle('player-cards-0', c); actualiserScoresVisuels(true);
        verifierBoutonsJoueur();
    }, 300);
}

function tirerCarteBj() {
    let c = bjDeck.pop();
    bjHands[currentHandIndex].push(c);
    ajouterCarteVisuelle(`player-cards-${currentHandIndex}`, c);
    actualiserScoresVisuels(true);
    verifierBoutonsJoueur();
    
    setTimeout(() => { if (calculerScore(bjHands[currentHandIndex]) >= 21) gererFinDeMainCourante(); }, 600);
}

function doublerBj() {
    let mise = bjMises[currentHandIndex];
    if (solde >= mise) {
        solde -= mise; bjMises[currentHandIndex] *= 2; mettreAJourAffichage();
        let c = bjDeck.pop();
        bjHands[currentHandIndex].push(c);
        ajouterCarteVisuelle(`player-cards-${currentHandIndex}`, c);
        actualiserScoresVisuels(true);
        
        setTimeout(() => { gererFinDeMainCourante(); }, 600);
    }
}

function resterBj() { gererFinDeMainCourante(); }

function gererFinDeMainCourante() {
    if (currentHandIndex < bjHands.length - 1) {
        // Passe à la seconde main du Split
        currentHandIndex++;
        let c = bjDeck.pop(); bjHands[1].push(c);
        ajouterCarteVisuelle('player-cards-1', c);
        actualiserScoresVisuels(true);
        verifierBoutonsJoueur();
    } else {
        // Toutes les mains sont jouées
        tourCroupier();
    }
}

function tourCroupier() {
    document.getElementById('bj-play-controls').style.display = 'none';
    
    // Si toutes les mains ont "bust" ou sont des Blackjack, le croupier n'a pas besoin de tirer
    let toutBuste = true;
    for (let main of bjHands) { if (calculerScore(main) <= 21) toutBuste = false; }
    
    let hidden = document.getElementById('dealer-hidden-card'); if (hidden) hidden.remove();
    document.getElementById('dealer-cards').innerHTML = "";
    for(let c of bjDealerHand) { ajouterCarteVisuelle('dealer-cards', c, false, true); }
    actualiserScoresVisuels(false);

    if (toutBuste) { setTimeout(() => { finirPartieFinale(); }, 800); return; }

    let playDealer = () => {
        if (calculerScore(bjDealerHand) < 17) {
            let c = bjDeck.pop(); bjDealerHand.push(c);
            ajouterCarteVisuelle('dealer-cards', c); actualiserScoresVisuels(false);
            setTimeout(playDealer, 800);
        } else {
            finirPartieFinale();
        }
    };
    setTimeout(playDealer, 800);
}

function finirPartieFinale(specialResult = null) {
    let overlay = document.getElementById('bj-message-overlay');
    let messageText = document.getElementById('bj-message-text');
    let scoreCroupier = calculerScore(bjDealerHand);
    
    let totalMiseRonde = 0; let totalGainRonde = 0;
    let messageFinal = "";

    if (specialResult === "croupier_bj") {
        totalMiseRonde = bjMises[0];
        messageFinal = bjMiseAssurance > 0 ? `ASSURANCE GAGNANTE\n(Mise perdue: -${bjMises[0]}€)` : `BLACKJACK CROUPIER\n-${bjMises[0]}€`;
    } else {
        for (let i = 0; i < bjHands.length; i++) {
            let main = bjHands[i];
            let scoreJoueur = calculerScore(main);
            let mise = bjMises[i];
            totalMiseRonde += mise;
            
            let prefix = bjHands.length > 1 ? `Main ${i+1}: ` : "";
            
            if (scoreJoueur > 21) {
                messageFinal += `${prefix}PERDU (Bust) : -${mise}€\n`;
            } else if (scoreJoueur === 21 && main.length === 2 && bjHands.length === 1) {
                let gain = mise + (mise * 1.5);
                solde += gain; totalGainRonde += (mise * 1.5);
                messageFinal += `${prefix}BLACKJACK ! : +${mise * 1.5}€\n`;
            } else if (scoreCroupier > 21 || scoreJoueur > scoreCroupier) {
                solde += (mise * 2); totalGainRonde += mise;
                messageFinal += `${prefix}GAGNÉ ! : +${mise}€\n`;
            } else if (scoreCroupier === scoreJoueur) {
                solde += mise;
                messageFinal += `${prefix}ÉGALITÉ : Remboursé\n`;
            } else {
                messageFinal += `${prefix}PERDU : -${mise}€\n`;
            }
        }
    }
    
    enregistrerStatistique(totalMiseRonde, totalGainRonde);
    mettreAJourAffichage();
    messageText.innerText = messageFinal;
    
    // Couleur du message global
    if (totalGainRonde > 0) messageText.style.color = "#30d158";
    else if (totalGainRonde === 0 && totalMiseRonde > 0) messageText.style.color = "#ff453a"; // Perte
    else messageText.style.color = "#fff";
    
    setTimeout(() => { overlay.style.display = 'flex'; }, 800);
}

function reinitialiserBj() {
    bjPartieEnCours = false; bjMises = [0]; bjMiseLL = 0; bjMiseAssurance = 0;
    bjHands = [[]]; bjDealerHand = []; currentHandIndex = 0;
    
    document.getElementById('bj-message-overlay').style.display = 'none';
    document.getElementById('bj-bet-controls').style.display = 'flex';
    document.getElementById('btn-deal').disabled = true;
    document.getElementById('bj-bet-zones').style.display = 'flex';
    document.getElementById('btn-split').style.display = 'none';
    dessinerJetonsVisuels();
    
    // Réinitialise l'UI à 1 seule colonne
    document.getElementById('bj-player-hands-wrapper').innerHTML = `
        <div class="bj-hand-column" id="bj-hand-0">
            <div class="bj-score-pill player-score" id="player-score-box-0"><span id="player-score-0">0</span></div>
            <div class="cards-container" id="player-cards-0"></div>
        </div>`;
    document.getElementById('dealer-cards').innerHTML = "";
    document.getElementById('dealer-score-box').classList.remove('active');
}

// --- DÉMARRAGE ---
mettreAJourAffichage();