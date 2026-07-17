let solde = localStorage.getItem('mpc_solde');
solde = solde === null ? 500 : parseInt(solde);
let estAdmin = localStorage.getItem('mpc_admin') === 'true';

function mettreAJourAffichage() {
    document.getElementById('solde-text').innerText = solde;
    localStorage.setItem('mpc_solde', solde);

    // Cache le bouton CODE si le joueur a déjà débloqué l'accès à vie
    if (estAdmin === true) {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('btn-code').style.display = 'none'; 
    } else {
        document.getElementById('btn-code').style.display = 'block';
    }
}

// --- FONCTION DU CLIC SUR L'ARGENT ---
function lancerMiniJeu() {
    alert("C'est ici que s'ouvrira la page du mini-jeu pour gagner des euros en plus !");
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
    
    // Le code d'accès est BOSS
    if (codeTape === "BOSS") { 
        estAdmin = true;
        localStorage.setItem('mpc_admin', 'true');
        fermerModalCode();
        mettreAJourAffichage();
    } else {
        // Effet rouge si on se trompe de code
        let input = document.getElementById('input-code');
        input.style.border = "1px solid red";
        setTimeout(() => { input.style.border = "1px solid #333"; }, 1000);
    }
}

// --- AJOUT D'ARGENT DEPUIS LE PANNEAU ---
function ajouterArgent() {
    let input = document.getElementById('ajout-montant');
    let montant = parseInt(input.value);

    if (!isNaN(montant) && montant > 0) {
        solde = solde + montant;
        mettreAJourAffichage();
        input.value = ''; 
    }
}

mettreAJourAffichage();