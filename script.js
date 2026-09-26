// --- INITIALISATION & SAUVEGARDE ---
let solde = localStorage.getItem('mpc_solde');
solde = solde === null ? 500 : parseInt(solde);
let estAdmin = localStorage.getItem('mpc_admin') === 'true';

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

// --- LOGIQUE DU MINI-JEU MACHINE À SOUS ---
const symboles = ['🍒', '🍋', '🔔', '💎'];
let enTrainDeTourner = false;

function lancerMiniJeu() {
    document.getElementById('minijeu-overlay').style.display = 'flex';
    document.getElementById('minijeu-message').innerText = "Tente ta chance !";
    document.getElementById('minijeu-message').style.color = "#FFB703";
    document.getElementById('slot1').innerText = '❓';
    document.getElementById('slot2').innerText = '❓';
    document.getElementById('slot3').innerText = '❓';
}

function fermerMiniJeu() {
    if (enTrainDeTourner) return; 
    document.getElementById('minijeu-overlay').style.display = 'none';
}

function jouerMiniJeu() {
    if (enTrainDeTourner) return;
    enTrainDeTourner = true;
    
    let message = document.getElementById('minijeu-message');
    message.innerText = "Ça tourne...";
    message.style.color = "#ffffff";
    
    let slot1 = document.getElementById('slot1');
    let slot2 = document.getElementById('slot2');
    let slot3 = document.getElementById('slot3');

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
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        message.innerText = "Pas mal ! Tu gagnes 30€ !";
        message.style.color = "#FFB703";
        solde += 30;
    } else {
        message.innerText = "Perdu... Retente ta chance !";
        message.style.color = "red";
    }
    
    mettreAJourAffichage();
}

// --- GESTION DE LA FENÊTRE DU CODE SECRET ---
function ouvrirModalCode() {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('input-code').value = ''; 
    document.getElementById('input-code').focus();
}

function fermerModalCode() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function validerCode() {
    let codeTape = document.getElementById('input-code').value;
    if (codeTape === "BOSS") { 
        estAdmin = true;
        localStorage.setItem('mpc_admin', 'true');
        fermerModalCode();
        mettreAJourAffichage();
    } else {
        let input = document.getElementById('input-code');
        input.style.border = "1px solid red";
        setTimeout(() => { input.style.border = "1px solid #333"; }, 1000);
    }
}

// Retrait du panneau une fois l'argent mis
function ajouterArgent() {
    let input = document.getElementById('ajout-montant');
    let montant = parseInt(input.value);
    if (!isNaN(montant) && montant > 0) {
        solde += montant;
        estAdmin = false;
        localStorage.setItem('mpc_admin', 'false');
        document.getElementById('admin-panel').style.display = 'none';
        mettreAJourAffichage();
        input.value = ''; 
    }
}

// --- JEU : LA ROULETTE PROFESSIONNELLE ---
let valeurJetonActuel = 10;
let parisSurTapis = {};
const numerosRouges = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function ouvrirRoulette() {
    document.getElementById('menu-principal').style.display = 'none';
    document.getElementById('roulette-view').style.display = 'flex';
    document.getElementById('roulette-resultat-pro').innerText = "Faites vos jeux !";
    
    const board = document.getElementById('board-numbers');
    if (board.innerHTML === "") {
        for (let i = 1; i <= 36; i++) {
            let couleurClass = numerosRouges.includes(i) ? 'red' : 'black';
            board.innerHTML += `<div class="bet-spot ${couleurClass}" onclick="placerPari('${i}')">${i}<span class="chip-bet" id="bet-${i}"></span></div>`;
        }
    }
}

function fermerRoulette() {
    annulerParis();
    document.getElementById('roulette-view').style.display = 'none';
    document.getElementById('menu-principal').style.display = 'flex';
}

function choisirJeton(valeur) {
    valeurJetonActuel = valeur;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.getElementById(`chip-${valeur}`).classList.add('active');
}

function placerPari(zone) {
    if (solde < valeurJetonActuel) return alert("Fonds insuffisants !");
    
    solde -= valeurJetonActuel;
    mettreAJourAffichage();
    if (!parisSurTapis[zone]) parisSurTapis[zone] = 0;
    parisSurTapis[zone] += valeurJetonActuel;
    
    let bulleJeton = document.getElementById(`bet-${zone}`);
    bulleJeton.style.display = 'block';
    let texteMise = parisSurTapis[zone] >= 1000 ? (parisSurTapis[zone]/1000).toFixed(1) + 'k' : parisSurTapis[zone];
    bulleJeton.innerText = texteMise;
}

function annulerParis() {
    for (let zone in parisSurTapis) { solde += parisSurTapis[zone]; }
    parisSurTapis = {};
    mettreAJourAffichage();
    document.querySelectorAll('.chip-bet').forEach(jeton => {
        jeton.style.display = 'none';
        jeton.innerText = '';
    });
}

function lancerRoulettePro() {
    if (Object.keys(parisSurTapis).length === 0) return alert("Placez au moins un pari avant de tourner !");
    
    let bouton = document.getElementById('btn-lancer-roulette');
    let resultatTexte = document.getElementById('roulette-resultat-pro');
    
    bouton.disabled = true;
    resultatTexte.innerText = "La roue tourne... 🌪️";

    setTimeout(() => {
        let numeroGagnant = Math.floor(Math.random() * 37);
        let totalGagne = 0;
        let estRouge = numerosRouges.includes(numeroGagnant);
        let estNoir = numeroGagnant !== 0 && !estRouge;
        let estPair = numeroGagnant !== 0 && numeroGagnant % 2 === 0;
        let estImpair = numeroGagnant !== 0 && numeroGagnant % 2 !== 0;

        let icone = numeroGagnant === 0 ? "🟢" : (estRouge ? "🔴" : "⚫");
        resultatTexte.innerText = `Résultat: ${icone} ${numeroGagnant}`;

        for (let zone in parisSurTapis) {
            let mise = parisSurTapis[zone];
            if (zone === numeroGagnant.toString()) { totalGagne += mise * 36; }
            if (zone === 'rouge' && estRouge) { totalGagne += mise * 2; }
            if (zone === 'noir' && estNoir) { totalGagne += mise * 2; }
            if (zone === 'pair' && estPair) { totalGagne += mise * 2; }
            if (zone === 'impair' && estImpair) { totalGagne += mise * 2; }
            if (zone === '1-18' && numeroGagnant >= 1 && numeroGagnant <= 18) { totalGagne += mise * 2; }
            if (zone === '19-36' && numeroGagnant >= 19 && numeroGagnant <= 36) { totalGagne += mise * 2; }
        }

        if (totalGagne > 0) {
            solde += totalGagne;
            resultatTexte.innerHTML += `<br><span style="color:#4CAF50;">+ ${totalGagne}€ !</span>`;
        } else {
            resultatTexte.innerHTML += `<br><span style="color:#d32f2f;">Aucun gain</span>`;
        }

        mettreAJourAffichage();
        parisSurTapis = {};
        document.querySelectorAll('.chip-bet').forEach(j => j.style.display = 'none');
        bouton.disabled = false;
    }, 2000);
}

// --- JEU : POKER BETCLIC ---
function ouvrirPoker() {
    document.getElementById('menu-principal').style.display = 'none';
    document.getElementById('poker-view').style.display = 'flex';
    document.getElementById('hero-poker-chips').innerText = solde + " €";
}

function fermerPoker() {
    document.getElementById('poker-view').style.display = 'none';
    document.getElementById('menu-principal').style.display = 'flex';
}

function pokerAction(action) {
    alert("Action choisie : " + action + " (Le moteur de jeu arrive bientôt !)");
}

// --- JEU : BLACKJACK PREMIUM ---
let bjDeck = [];
let bjPlayerHand = [];
let bjDealerHand = [];
let bjMiseMain = 0;
let bjMiseLL = 0;
let bjMiseAssurance = 0;
let bjValeurJeton = 10;
let bjPartieEnCours = false;

const symbolesCartes = { 'coeur': '♥', 'carreau': '♦', 'pique': '♠', 'trefle': '♣' };

function ouvrirBlackjack() {
    document.getElementById('menu-principal').style.display = 'none';
    document.getElementById('bj-view').style.display = 'flex';
    reinitialiserBj();
}

function fermerBlackjack() {
    if (bjPartieEnCours) return alert("Terminez la main en cours avant de quitter.");
    retirerMisesBj();
    document.getElementById('bj-view').style.display = 'none';
    document.getElementById('menu-principal').style.display = 'flex';
}

function choisirJetonBj(valeur) {
    bjValeurJeton = valeur;
    document.querySelectorAll('#bj-chip-selector .chip-clean').forEach(c => c.classList.remove('active'));
    document.getElementById(`bj-chip-${valeur}`).classList.add('active');
}

function animerJeton(valeur, cibleId) {
    let selecteur = document.getElementById(`bj-chip-${valeur}`);
    let cible = document.getElementById(cibleId);
    let rectSelecteur = selecteur.getBoundingClientRect();
    let rectCible = cible.getBoundingClientRect();
    
    let jetonVolant = document.createElement('div');
    jetonVolant.className = 'flying-chip';
    jetonVolant.style.left = rectSelecteur.left + 'px';
    jetonVolant.style.top = rectSelecteur.top + 'px';
    document.body.appendChild(jetonVolant);
    
    setTimeout(() => {
        jetonVolant.style.left = (rectCible.left + rectCible.width/2 - 22) + 'px';
        jetonVolant.style.top = (rectCible.top + rectCible.height/2 - 22) + 'px';
    }, 10);
    
    setTimeout(() => {
        jetonVolant.remove();
        dessinerJetonsVisuels();
    }, 400);
}

function placerMiseBj(zone) {
    if (bjPartieEnCours) return;
    if (solde < bjValeurJeton) return alert("Fonds insuffisants !");
    
    solde -= bjValeurJeton;
    if (zone === 'main') {
        bjMiseMain += bjValeurJeton;
        animerJeton(bjValeurJeton, 'bj-main-spot');
    } else if (zone === 'll') {
        bjMiseLL += bjValeurJeton;
        animerJeton(bjValeurJeton, 'bj-ll-spot');
    }
    
    mettreAJourAffichage();
    document.getElementById('btn-clear-bets').style.visibility = 'visible';
    if (bjMiseMain > 0) document.getElementById('btn-deal').disabled = false;
}

function dessinerJetonsVisuels() {
    let divMain = document.getElementById('bj-main-chips');
    divMain.innerHTML = bjMiseMain > 0 ? `<div class="chip-mini">${bjMiseMain >= 1000 ? (bjMiseMain/1000).toFixed(1)+'k' : bjMiseMain}</div>` : '';
    
    let divLL = document.getElementById('bj-ll-chips');
    divLL.innerHTML = bjMiseLL > 0 ? `<div class="chip-mini" style="background: #e91e63; color: white;">${bjMiseLL >= 1000 ? (bjMiseLL/1000).toFixed(1)+'k' : bjMiseLL}</div>` : '';
}

function retirerMisesBj() {
    if (bjPartieEnCours) return;
    solde += (bjMiseMain + bjMiseLL);
    bjMiseMain = 0; bjMiseLL = 0;
    mettreAJourAffichage();
    document.getElementById('btn-deal').disabled = true;
    document.getElementById('btn-clear-bets').style.visibility = 'hidden';
    dessinerJetonsVisuels();
}

function creerDeck() {
    let valeurs = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let couleurs = ['coeur', 'carreau', 'pique', 'trefle'];
    let deck = [];
    for(let j=0; j<4; j++) {
        for (let couleur of couleurs) {
            for (let valeur of valeurs) { deck.push({ valeur, couleur }); }
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function calculerScore(main) {
    let score = 0, as = 0;
    for (let carte of main) {
        if (['J', 'Q', 'K'].includes(carte.valeur)) score += 10;
        else if (carte.valeur === 'A') { score += 11; as += 1; }
        else score += parseInt(carte.valeur);
    }
    while (score > 21 && as > 0) { score -= 10; as -= 1; }
    return score;
}

// Ajoute physiquement la carte sur la table sans redessiner les anciennes
function ajouterCarteVisuelle(cibleId, carte, cachee = false, noAnim = false) {
    let container = document.getElementById(cibleId);
    let div = document.createElement('div');
    
    if (cachee) {
        div.className = 'bj-card hidden';
        div.id = 'dealer-hidden-card';
    } else {
        let couleurCSS = (carte.couleur === 'coeur' || carte.couleur === 'carreau') ? 'red' : 'black';
        let icone = symbolesCartes[carte.couleur];
        div.className = `bj-card ${couleurCSS}`;
        if (noAnim) div.classList.add('no-anim'); // Bloque l'animation
        div.innerHTML = `
            <div class="card-top">${carte.valeur}${icone}</div>
            <div class="card-center">${icone}</div>
            <div class="card-bottom">${carte.valeur}${icone}</div>
        `;
    }
    container.appendChild(div);
}

// Mise à jour propre des scores sans casser l'interface
function actualiserScoresVisuels(cacherCroupier = true) {
    if (bjPlayerHand.length > 0) {
        document.getElementById('player-score').innerText = calculerScore(bjPlayerHand);
        document.getElementById('player-score-box').classList.add('active');
    }
    if (bjDealerHand.length > 0) {
        let score = cacherCroupier ? calculerScore([bjDealerHand[0]]) : calculerScore(bjDealerHand);
        document.getElementById('dealer-score').innerText = score;
        document.getElementById('dealer-score-box').classList.add('active');
    }
}

// Distribution carte par carte via JavaScript
function distribuerBj() {
    bjPartieEnCours = true;
    document.getElementById('bj-bet-controls').style.display = 'none';
    document.getElementById('btn-clear-bets').style.visibility = 'hidden';
    
    bjDeck = creerDeck();
    bjPlayerHand = [];
    bjDealerHand = [];
    
    document.getElementById('player-cards').innerHTML = "";
    document.getElementById('dealer-cards').innerHTML = "";
    
    let delai = 0;
    
    // Joueur Carte 1
    setTimeout(() => {
        let c = bjDeck.pop();
        bjPlayerHand.push(c);
        ajouterCarteVisuelle('player-cards', c);
        actualiserScoresVisuels(true);
    }, delai += 300);

    // Croupier Carte 1
    setTimeout(() => {
        let c = bjDeck.pop();
        bjDealerHand.push(c);
        ajouterCarteVisuelle('dealer-cards', c);
        actualiserScoresVisuels(true);
    }, delai += 500);

    // Joueur Carte 2
    setTimeout(() => {
        let c = bjDeck.pop();
        bjPlayerHand.push(c);
        ajouterCarteVisuelle('player-cards', c);
        actualiserScoresVisuels(true);
    }, delai += 500);

    // Croupier Carte 2 (Cachée)
    setTimeout(() => {
        let c = bjDeck.pop();
        bjDealerHand.push(c);
        ajouterCarteVisuelle('dealer-cards', c, true);
    }, delai += 500);
    
    // Évaluations après distribution
    setTimeout(() => {
        evaluerLuckyLadies();
        if (bjDealerHand[0].valeur === 'A') {
            document.getElementById('bj-insurance-cost').innerText = `Coût: ${bjMiseMain / 2}€`;
            document.getElementById('bj-insurance-overlay').style.display = 'block';
        } else {
            continuerApresDistribution();
        }
    }, delai += 600);
}

function evaluerLuckyLadies() {
    if (bjMiseLL === 0) return;
    let c1 = bjPlayerHand[0], c2 = bjPlayerHand[1];
    let v1 = (['J','Q','K'].includes(c1.valeur)) ? 10 : parseInt(c1.valeur);
    let v2 = (['J','Q','K'].includes(c2.valeur)) ? 10 : parseInt(c2.valeur);
    
    if (v1 + v2 === 20) {
        let gain = 0;
        let isSuited = c1.couleur === c2.couleur;
        let isMatched = isSuited && c1.valeur === c2.valeur;
        
        if (c1.valeur === 'Q' && c2.valeur === 'Q' && c1.couleur === 'coeur' && c2.couleur === 'coeur') { gain = bjMiseLL * 200; }
        else if (isMatched) { gain = bjMiseLL * 25; }
        else if (isSuited) { gain = bjMiseLL * 10; }
        else { gain = bjMiseLL * 4; }
        
        solde += (gain + bjMiseLL);
        mettreAJourAffichage();
        
        let notif = document.createElement('div');
        notif.style = "position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); color:#e91e63; font-weight:bold; font-size:24px; z-index:99; background:rgba(0,0,0,0.8); padding:10px; border-radius:10px;";
        notif.innerText = `Lucky Ladies Gagné ! +${gain}€`;
        document.getElementById('bj-view').appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    }
    bjMiseLL = 0; 
    dessinerJetonsVisuels();
}

function repondreAssurance(veutAssurance) {
    document.getElementById('bj-insurance-overlay').style.display = 'none';
    if (veutAssurance && solde >= (bjMiseMain / 2)) {
        bjMiseAssurance = bjMiseMain / 2;
        solde -= bjMiseAssurance;
        mettreAJourAffichage();
    }
    
    if (calculerScore(bjDealerHand) === 21) {
        if (bjMiseAssurance > 0) {
            solde += (bjMiseAssurance * 3);
            mettreAJourAffichage();
        }
        finirPartie("croupier_bj");
    } else {
        continuerApresDistribution();
    }
}

function continuerApresDistribution() {
    document.getElementById('bj-play-controls').style.display = 'flex';
    document.getElementById('btn-double').disabled = (solde < bjMiseMain);
    if (calculerScore(bjPlayerHand) === 21) finirPartie("blackjack");
}

function tirerCarteBj() {
    document.getElementById('btn-double').disabled = true; 
    let c = bjDeck.pop();
    bjPlayerHand.push(c);
    ajouterCarteVisuelle('player-cards', c);
    actualiserScoresVisuels(true);
    
    setTimeout(() => { 
        if (calculerScore(bjPlayerHand) > 21) finirPartie("bust"); 
    }, 600);
}

function doublerBj() {
    if (solde >= bjMiseMain) {
        solde -= bjMiseMain;
        bjMiseMain *= 2;
        mettreAJourAffichage();
        dessinerJetonsVisuels();
        
        let c = bjDeck.pop();
        bjPlayerHand.push(c);
        ajouterCarteVisuelle('player-cards', c);
        actualiserScoresVisuels(true);
        
        setTimeout(() => {
            if (calculerScore(bjPlayerHand) > 21) finirPartie("bust");
            else tourCroupier();
        }, 600);
    }
}

function resterBj() { tourCroupier(); }

function tourCroupier() {
    document.getElementById('bj-play-controls').style.display = 'none';
    
    // Révèle la carte proprement sans la faire re-sauter
    let hidden = document.getElementById('dealer-hidden-card');
    if (hidden) hidden.remove();
    document.getElementById('dealer-cards').innerHTML = "";
    for(let c of bjDealerHand) {
        ajouterCarteVisuelle('dealer-cards', c, false, true); 
    }
    actualiserScoresVisuels(false);

    let playDealer = () => {
        if (calculerScore(bjDealerHand) < 17) {
            let c = bjDeck.pop();
            bjDealerHand.push(c);
            ajouterCarteVisuelle('dealer-cards', c);
            actualiserScoresVisuels(false);
            setTimeout(playDealer, 800);
        } else {
            evaluerFin();
        }
    };
    setTimeout(playDealer, 800);
}

function evaluerFin() {
    let scoreJoueur = calculerScore(bjPlayerHand);
    let scoreCroupier = calculerScore(bjDealerHand);
    
    if (scoreCroupier > 21 || scoreJoueur > scoreCroupier) finirPartie("gagne");
    else if (scoreCroupier > scoreJoueur) finirPartie("perdu");
    else finirPartie("egalite");
}

function finirPartie(resultat) {
    document.getElementById('bj-play-controls').style.display = 'none';
    let overlay = document.getElementById('bj-message-overlay');
    let messageText = document.getElementById('bj-message-text');
    
    // Révéler la dernière carte s'il restait en attente (ex: Blackjack Joueur)
    let hidden = document.getElementById('dealer-hidden-card');
    if (hidden) {
        hidden.remove();
        document.getElementById('dealer-cards').innerHTML = "";
        for(let c of bjDealerHand) { ajouterCarteVisuelle('dealer-cards', c, false, true); }
        actualiserScoresVisuels(false);
    }
    
    if (resultat === "blackjack") {
        let gain = bjMiseMain + (bjMiseMain * 1.5);
        solde += gain;
        messageText.innerText = `BLACKJACK !\n+${gain}€`;
        messageText.style.color = "#FFD700";
    } else if (resultat === "gagne") {
        let gain = bjMiseMain * 2;
        solde += gain;
        messageText.innerText = `GAGNÉ !\n+${gain}€`;
        messageText.style.color = "#30d158";
    } else if (resultat === "egalite") {
        solde += bjMiseMain;
        messageText.innerText = "ÉGALITÉ\nMise rendue";
        messageText.style.color = "#fff";
    } else if (resultat === "croupier_bj") {
        messageText.innerText = bjMiseAssurance > 0 ? "ASSURANCE GAGNANTE" : "BLACKJACK CROUPIER";
        messageText.style.color = bjMiseAssurance > 0 ? "#30d158" : "#ff453a";
    } else {
        messageText.innerText = "PERDU...";
        messageText.style.color = "#ff453a";
    }
    
    mettreAJourAffichage();
    setTimeout(() => { overlay.style.display = 'flex'; }, 800);
}

function reinitialiserBj() {
    bjPartieEnCours = false;
    bjMiseMain = 0; bjMiseLL = 0; bjMiseAssurance = 0;
    bjPlayerHand = []; bjDealerHand = [];
    
    document.getElementById('bj-message-overlay').style.display = 'none';
    document.getElementById('bj-bet-controls').style.display = 'flex';
    document.getElementById('btn-deal').disabled = true;
    dessinerJetonsVisuels();
    
    document.getElementById('player-cards').innerHTML = "";
    document.getElementById('dealer-cards').innerHTML = "";
    document.getElementById('player-score-box').classList.remove('active');
    document.getElementById('dealer-score-box').classList.remove('active');
}

// --- DÉMARRAGE ---
mettreAJourAffichage();