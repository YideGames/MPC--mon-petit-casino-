// Ce fichier permet à ton téléphone de reconnaître le site comme une application installable
self.addEventListener('install', (e) => {
    console.log('Service Worker installé');
});

self.addEventListener('fetch', (e) => {
    // Requis pour que l'installation soit proposée par le navigateur
});