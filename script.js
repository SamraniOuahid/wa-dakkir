function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
}

// Vérifier les mises à jour toutes les 5 minutes
setInterval(checkForUpdates, 300000);

// Ajouter un événement pour détecter les nouvelles versions
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
        refreshing = true;
        showUpdateMessage();
    }
});

const apiUrl = 'https://mp3quran.net/api/v3';
const a = 'https://www.mp3quran.net/api/v3/reciters?language=eng' ;

const reciter = 'reciters';
const language= 'ar';

let currentAudio = null; // Variable globale pour suivre l'audio en cours

// Fonction de recherche des récitateurs
function setupReciterSearch() {
    const searchInput = document.getElementById('searchReciter');
    const reciterSelect = document.getElementById('chooseReciter');
    const chooseMoshaf = document.getElementById('chooseMoshaf');
    const chooseSurah = document.getElementById('chooseSurah');
    
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        let firstMatch = null;
        
        // Arrêter l'audio en cours s'il existe
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.remove();
            currentAudio = null;
        }

        // Réinitialiser les sélecteurs
        chooseMoshaf.innerHTML = '<option value="">اختر المصحف</option>';
        chooseSurah.innerHTML = '<option value="">اختر السورة</option>';
        
        Array.from(reciterSelect.options).forEach((option, index) => {
            if (index === 0) return;
            
            const reciterName = option.text.toLowerCase();
            const isMatch = reciterName.includes(searchText);
            
            option.style.display = isMatch ? '' : 'none';
            
            if (isMatch && !firstMatch) {
                firstMatch = option;
            }
        });
        
        // Si une correspondance est trouvée
        if (firstMatch && searchText.length > 0) {
            reciterSelect.value = firstMatch.value;
            // Nettoyer l'audio container
            const audioContainer = document.querySelector('.audio-container');
            audioContainer.innerHTML = '';
            // Charger le nouveau moshaf
            getMoshaf(firstMatch.value);
        }
    });
}

// Modification de la fonction getReciters pour inclure la recherche
async function getReciters() {
    try {
        const chooseReciter = document.querySelector('#chooseReciter');
        const res = await fetch(`${apiUrl}/${reciter}?language=${language}`);
        const data = await res.json();
        
        // Remplir le select avec les récitateurs
        chooseReciter.innerHTML = '<option value="">اختر القارئ</option>';
        data.reciters.forEach(reciter => {
            chooseReciter.innerHTML += `<option value="${reciter.id}">${reciter.name}</option>`;
        });
        
        // Ajouter l'écouteur d'événements pour le changement de récitateur
        chooseReciter.addEventListener('change', e => getMoshaf(e.target.value));
        
        // Initialiser la recherche
        setupReciterSearch();
        
    } catch (error) {
        console.error('Erreur lors du chargement des récitateurs:', error);
    }
}

// Appeler getReciters au chargement de la page
getReciters();

async function getMoshaf(reciterId) {
    try {
        const chooseMoshaf = document.querySelector('#chooseMoshaf');
        const res = await fetch(`${apiUrl}/${reciter}?language=${language}&reciter=${reciterId}`);
        const data = await res.json();
        const moshafs = data.reciters[0].moshaf;
        
        chooseMoshaf.innerHTML = '<option value="">اختر المصحف</option>';
        moshafs.forEach(moshaf => {
            chooseMoshaf.innerHTML += `
                <option value="${moshaf.id}" 
                        data-server="${moshaf.server}"
                        data-surahlist="${moshaf.surah_list}">
                    ${moshaf.name}
                </option>`;
        });

        // Ajouter un écouteur d'événements pour le changement de moshaf
        chooseMoshaf.addEventListener('change', function(e) {
            if (e.target.value) {
                const selectedOption = e.target.selectedOptions[0];
                const surahServer = selectedOption.dataset.server;
                const surahList = selectedOption.dataset.surahlist;
                getSurah(surahServer, surahList);
            }
        });

    } catch (error) {
        console.error('Erreur lors du chargement des moshaf:', error);
    }
}

async function getSurah(surahServer, surahList) {
    const chooseSurah = document.querySelector('#chooseSurah');
    
    // Cloner pour éviter les écouteurs multiples
    const newChooseSurah = chooseSurah.cloneNode(true);
    chooseSurah.parentNode.replaceChild(newChooseSurah, chooseSurah);
    
    try {
        const res = await fetch(`https://mp3quran.net/api/v3/suwar`);
        const data = await res.json();
        const surahNames = data.suwar;
        
        newChooseSurah.innerHTML = '<option value="">اختر السورة</option>';
        
        const surahListArray = surahList.split(',').map(Number);
        
        surahListArray.forEach(surahNumber => {
            const surahInfo = surahNames.find(surah => surah.id === surahNumber);
            
            if (surahInfo) {
                const paddedNumber = surahNumber.toString().padStart(3, '0');
                newChooseSurah.innerHTML += `
                    <option value="${surahServer}${paddedNumber}.mp3">
                        ${surahInfo.name}
                    </option>`;
            }
        });

        // Écouteur d'événements optimisé
        newChooseSurah.addEventListener('change', e => {
            const selectedValue = e.target.value;
            if (selectedValue) {
                playSurah(selectedValue);
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des sourates:', error);
        newChooseSurah.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

function playSurah(surahMp3) {
    // Arrêter l'audio en cours immédiatement
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
    }

    const audioContainer = document.querySelector('.audio-container');
    
    // Créer et configurer le nouvel audio avec le bouton de téléchargement
    audioContainer.innerHTML = `
        <div class="audio-wrapper">
            <audio id="chooseAudio" controls>
                <source src="${surahMp3}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <button class="download-btn" onclick="downloadAudio('${surahMp3}', '${getSurahName()}')">
                <i class="fas fa-download"></i> تحميل
            </button>
        </div>
    `;

    // Démarrer la lecture
    const playPromise = audioContainer.querySelector('audio').play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error('Erreur de lecture:', error);
        });
    }

    currentAudio = audioContainer.querySelector('audio');

    currentAudio.onerror = () => {
        console.error('Erreur de chargement audio');
        audioContainer.innerHTML = `
            <div class="error-message">
                Erreur de chargement de l'audio. Veuillez réessayer.
            </div>
        `;
        currentAudio = null;
    };
}

// Fonction pour obtenir le nom de la sourate sélectionnée
function getSurahName() {
    const surahSelect = document.querySelector('#chooseSurah');
    const selectedOption = surahSelect.options[surahSelect.selectedIndex];
    return selectedOption.text || 'surah';
}

// Fonction de téléchargement améliorée
async function downloadAudio(audioUrl, surahName) {
    try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        
        // Créer un objet URL pour le blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Créer un lien temporaire
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${surahName}.mp3`; // Nom du fichier avec le nom de la sourate
        
        // Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement. Veuillez réessayer.');
    }
}

// Ajouter ces styles CSS pour l'animation de rotation
const styles = `
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .rotating {
        animation: rotate 4s linear infinite;
    }

    .play-button {
        transition: background-color 0.3s ease;
    }

    .play-button:hover {
        opacity: 0.9;
    }
`;

// Ajouter les styles au document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Fonction pour initialiser l'état de la batterie
async function initBatteryStatus() {
    try {
        if (!navigator.getBattery) {
            throw new Error('API Batterie non supportée');
        }

        const battery = await navigator.getBattery();
        
        // Mise à jour initiale
        updateBatteryStatus(battery);

        // Écouteurs d'événements pour les changements
        battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
        battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));

    } catch (error) {
        console.error('Erreur de batterie:', error);
        // Afficher un état par défaut en cas d'erreur
        updateBatteryUI('--', false);
    }
}

// Fonction pour mettre à jour l'état de la batterie
function updateBatteryStatus(battery) {
    // Convertir le niveau en pourcentage
    const level = Math.round(battery.level * 100);
    const isCharging = battery.charging;
    
    // Mettre à jour l'interface
    updateBatteryUI(level, isCharging);
}

// Fonction pour mettre à jour l'interface utilisateur
function updateBatteryUI(level, isCharging) {
    const batteryIcon = document.querySelector('.battery-icon');
    const batteryLevel = document.querySelector('.battery-level');
    const batteryStatus = document.querySelector('.battery-status');

    if (!batteryIcon || !batteryLevel || !batteryStatus) {
        console.error('Éléments de batterie non trouvés');
        return;
    }

    // Mettre à jour le texte du niveau
    batteryLevel.textContent = level === '--' ? level : `${level}%`;

    // Déterminer l'icône et la couleur
    let icon, color;
    if (isCharging) {
        icon = '<i class="fas fa-bolt"></i>';
        color = '#ffd700';
    } else if (level <= 20) {
        icon = '<i class="fas fa-battery-quarter"></i>';
        color = '#ff4444';
    } else if (level <= 50) {
        icon = '<i class="fas fa-battery-half"></i>';
        color = '#ffa500';
    } else if (level <= 80) {
        icon = '<i class="fas fa-battery-three-quarters"></i>';
        color = '#90EE90';
    } else {
        icon = '<i class="fas fa-battery-full"></i>';
        color = '#00C851';
    }

    // Mettre à jour l'icône et les styles
    batteryIcon.innerHTML = icon;
    batteryIcon.style.color = color;
    batteryLevel.style.color = color;

    // Mettre à jour les classes
    batteryStatus.className = 'battery-status';
    if (level <= 20 && !isCharging) {
        batteryStatus.classList.add('low');
    }
    if (isCharging) {
        batteryStatus.classList.add('charging');
    }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si les éléments existent
    const batteryElements = document.querySelector('.battery-status');
    if (!batteryElements) {
        console.error('Éléments de batterie non trouvés dans le DOM');
        return;
    }

    initBatteryStatus();

    // Arrêter toute rotation au chargement initial
    const quranIcon = document.getElementById('quranIcon');
    quranIcon.classList.remove('rotating');
});

// Ajoutez cette fonction pour gérer l'animation
function handleQuranIconAnimation() {
    const audioElement = document.querySelector('audio');
    const quranIcon = document.querySelector('.quran-icon');

    audioElement.addEventListener('play', () => {
        quranIcon.classList.add('rotating');
    });

    audioElement.addEventListener('pause', () => {
        quranIcon.classList.remove('rotating');
    });

    audioElement.addEventListener('ended', () => {
        quranIcon.classList.remove('rotating');
    });
}

// Ajoutez cette fonction dans votre fichier script.js
function setupAudioPlayer(audioElement) {
    const quranIcon = document.getElementById('quranIcon');
    
    // Retirer toute animation existante
    quranIcon.style.animation = 'none';
    quranIcon.classList.remove('active');
    
    // Gérer les événements audio
    audioElement.addEventListener('play', function() {
        quranIcon.style.animation = '';  // Réinitialiser le style inline
        quranIcon.classList.add('active');
    });

    audioElement.addEventListener('pause', function() {
        quranIcon.classList.remove('active');
    });

    audioElement.addEventListener('ended', function() {
        quranIcon.classList.remove('active');
    });
}

// Modifiez votre fonction createAudioElement
function createAudioElement(audioUrl) {
    const audioContainer = document.querySelector('.audio-container');
    audioContainer.innerHTML = '';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = audioUrl;
    
    const quranIcon = document.getElementById('quranIcon');

    // Gérer la lecture
    audio.addEventListener('play', () => {
        quranIcon.style.animation = 'spin 3s linear infinite';
    });

    // Gérer la pause
    audio.addEventListener('pause', () => {
        quranIcon.style.animation = 'none';
    });

    // Gérer la fin
    audio.addEventListener('ended', () => {
        quranIcon.style.animation = 'none';
    });

    audioContainer.appendChild(audio);
    return audio;
}

// Ajouter cette fonction
function showUpdateMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    message.textContent = 'تم تحديث التطبيق! جاري إعادة التحميل...';
    document.body.appendChild(message);
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}