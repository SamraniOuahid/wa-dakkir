const apiUrl = 'https://mp3quran.net/api/v3';
const a = 'https://www.mp3quran.net/api/v3/reciters?language=eng' ;

const reciter = 'reciters';
const language= 'ar';

async function getReciters() {
    const chooseReciter = document.querySelector('#chooseReciter');
    const res = await fetch(`${apiUrl}/${reciter}?language=${language}`);
    const data = await res.json();
    chooseReciter.innerHTML = '<option value="">اختر القارئ</option>';
    data.reciters.forEach(reciter => chooseReciter.innerHTML += `<option value="${reciter.id}">${reciter.name}</option>` );
    chooseReciter.addEventListener('change', e=>getMoshaf(e.target.value));
}

getReciters();

async function getMoshaf(reciterId) {
    
    const chooseMoshaf = document.querySelector('#chooseMoshaf');
    const res = await fetch(`${apiUrl}/${reciter}?language=${language}&reciter=${reciterId}`);
    const data = await res.json();
    const moshafs = data.reciters[0].moshaf;
    chooseMoshaf.innerHTML = '<option value="">اختر المصحف</option>';
    moshafs.forEach(moshaf => chooseMoshaf.innerHTML += `<option value="${moshaf.id}" data-surahlist="${moshaf.surah_list}" data-server="${moshaf.server}" >${moshaf.name}</option>`);
    
    chooseMoshaf.addEventListener('change', e=>{
        const selectedMoshaf = chooseMoshaf.options[chooseMoshaf.selectedIndex];
        const surahServer = selectedMoshaf.dataset.server;
        const surahList = selectedMoshaf.dataset.surahlist;
        
        getSurah(surahServer, surahList);
    });
}
async function getSurah(surahServer, surahList) {
    const chooseSurah = document.querySelector('#chooseSurah');
    const res = await fetch(`https://mp3quran.net/api/v3/suwar`);
    const data = await res.json();
    const surahNames = data.suwar;
    
    // Vider le contenu précédent
    chooseSurah.innerHTML = '<option value="">اختر السورة</option>';
    
    // Convertir surahList en tableau de nombres
    const surahListArray = surahList.split(',').map(Number);
    
    // Pour chaque sourate disponible
    surahListArray.forEach(surahNumber => {
        // Trouver le nom de la sourate correspondante
        const surahInfo = surahNames.find(surah => surah.id === surahNumber);
        
        if (surahInfo) {
            // Formater le numéro de la sourate avec des zéros
            const paddedNumber = surahNumber.toString().padStart(3, '0');
            // Ajouter l'option au select
            chooseSurah.innerHTML += `
                <option value="${surahServer}${paddedNumber}.mp3">
                    ${surahInfo.name}
                </option>`;
        }
        chooseSurah.addEventListener('change', e=>{
            const selectedSurah = chooseSurah.options[chooseSurah.selectedIndex];
            playSurah(selectedSurah.value);

        });
    });
}

function playSurah(surahMp3) {
    const audio = document.querySelector('#chooseAudio');
    audio.src = surahMp3;
    audio.play();
}
// async function getAudio(surahId) {
//     const chooseAudio = document.querySelector('#chooseAudio');
//     const res = await fetch(`${apiUrl}/suwar?language=${language}&moshaf=${moshafId}&surah=${surahId}`);
//     const data = await res.json();
//     console.log(data);
// }
// async function initQuranPlayer() {
//     const languageSelect = document.getElementById('languageSelect');
//     const reciterSelect = document.getElementById('reciterSelect');
//     const surahSelect = document.getElementById('surahSelect');
//     const audio = document.getElementById('quranAudio');
//     const playBtn = document.getElementById('playBtn');
    
//     // Charger les langues
//     try {
//         const response = await fetch('https://mp3quran.net/api/v3/languages');
//         const data = await response.json();
        
//         data.language.forEach(lang => {
//             const option = document.createElement('option');
//             option.value = lang.id;
//             option.textContent = lang.native;
//             languageSelect.appendChild(option);
//         });
        
//         languageSelect.disabled = false;
//     } catch (error) {
//         console.error('Erreur lors du chargement des langues:', error);
//     }
    
//     // Événement de changement de langue
//     languageSelect.addEventListener('change', async () => {
//         const langId = languageSelect.value;
//         if (!langId) return;
        
//         reciterSelect.innerHTML = '<option value="">اختر القارئ</option>';
//         surahSelect.innerHTML = '<option value="">اختر السورة</option>';
        
//         try {
//             const response = await fetch(`https://mp3quran.net/api/v3/reciters?language=${langId}`);
//             const data = await response.json();
            
//             data.reciters.forEach(reciter => {
//                 const option = document.createElement('option');
//                 option.value = reciter.id;
//                 option.textContent = reciter.name;
//                 reciterSelect.appendChild(option);
//             });
            
//             reciterSelect.disabled = false;
//             surahSelect.disabled = true;
//             playBtn.disabled = true;
//         } catch (error) {
//             console.error('Erreur lors du chargement des récitateurs:', error);
//         }
//     });
    
//     // Événement de changement de récitateur
//     reciterSelect.addEventListener('change', async () => {
//         const reciterId = reciterSelect.value;
//         if (!reciterId) return;
        
//         surahSelect.innerHTML = '<option value="">اختر السورة</option>';
        
//         try {
//             const response = await fetch(`https://mp3quran.net/api/v3/suwar`);
//             const data = await response.json();
            
//             data.suwar.forEach(surah => {
//                 const option = document.createElement('option');
//                 option.value = surah.id;
//                 option.textContent = `${surah.id}. ${surah.name}`;
//                 surahSelect.appendChild(option);
//             });
            
//             surahSelect.disabled = false;
//             playBtn.disabled = true;
//         } catch (error) {
//             console.error('Erreur lors du chargement des sourates:', error);
//         }
//     });
    
//     // Événement de changement de sourate
//     surahSelect.addEventListener('change', async () => {
//         const surahId = surahSelect.value;
//         if (!surahId) return;
        
//         const reciterId = reciterSelect.value;
//         try {
//             const response = await fetch(`https://mp3quran.net/api/v3/reciters?reciter=${reciterId}`);
//             const data = await response.json();
//             const reciter = data.reciters[0];
            
//             // Construire l'URL correcte avec le serveur et le dossier du récitateur
//             const audioUrl = `${reciter.moshaf[0].server}${reciter.moshaf[0].surah_list}/${surahId.padStart(3, '0')}.mp3`;
            
//             audio.src = audioUrl;
//             playBtn.disabled = false;
//         } catch (error) {
//             console.error('Erreur lors du chargement de l\'audio:', error);
//         }
//     });
    
//     // Contrôles du lecteur
//     playBtn.addEventListener('click', () => {
//         if (audio.paused) {
//             audio.play();
//             playBtn.innerHTML = '<i class="fas fa-pause"></i>';
//         } else {
//             audio.pause();
//             playBtn.innerHTML = '<i class="fas fa-play"></i>';
//         }
//     });
    
//     // Mise à jour de la barre de progression
//     audio.addEventListener('timeupdate', () => {
//         const progress = document.querySelector('.progress');
//         const timeDisplay = document.querySelector('.time-display');
        
//         const percent = (audio.currentTime / audio.duration) * 100;
//         progress.style.width = `${percent}%`;
        
//         const currentMinutes = Math.floor(audio.currentTime / 60);
//         const currentSeconds = Math.floor(audio.currentTime % 60);
//         const totalMinutes = Math.floor(audio.duration / 60) || 0;
//         const totalSeconds = Math.floor(audio.duration % 60) || 0;
        
//         timeDisplay.textContent = `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')} / ${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
//     });
    
//     // Clic sur la barre de progression
//     document.querySelector('.progress-bar').addEventListener('click', (e) => {
//         const progressBar = e.currentTarget;
//         const clickPosition = e.offsetX;
//         const totalWidth = progressBar.offsetWidth;
//         const percent = clickPosition / totalWidth;
        
//         audio.currentTime = audio.duration * percent;
//     });
// }

// document.addEventListener('DOMContentLoaded', () => {
//     initQuranPlayer();
//     const cards = document.querySelectorAll('.book-card');
    
//     // Animation d'entrée progressive
//     cards.forEach((card, index) => {
//         card.style.animationDelay = `${index * 0.15}s`;
//     });

//     // Animation des boutons d'achat avec effets améliorés
//     const buyButtons = document.querySelectorAll('.buy-btn');
//     buyButtons.forEach(button => {
//         button.addEventListener('click', (e) => {
//             const btn = e.target;
            
//             // Création d'effet d'onde
//             const ripple = document.createElement('span');
//             ripple.classList.add('ripple');
//             btn.appendChild(ripple);
            
//             // Position de l'effet d'onde
//             const rect = btn.getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const y = e.clientY - rect.top;
//             ripple.style.left = x + 'px';
//             ripple.style.top = y + 'px';
            
//             // Animation du bouton
//             btn.innerHTML = '✓ Ajouté au panier';
//             btn.style.background = '#27ae60';
//             btn.style.transform = 'scale(1.1)';
            
//             // Animation de la carte
//             const card = btn.closest('.book-card');
//             card.style.transform = 'translateY(-15px)';
            
//             setTimeout(() => {
//                 btn.style.transform = 'scale(1)';
//                 card.style.transform = 'translateY(0)';
//                 ripple.remove();
//             }, 600);
            
//             setTimeout(() => {
//                 btn.innerHTML = 'Acheter';
//                 btn.style.background = '#3498db';
//             }, 2000);
//         });
//     });

//     // Animation au scroll
//     const observerOptions = {
//         threshold: 0.1
//     };

//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.style.opacity = '1';
//                 entry.target.style.transform = 'translateY(0)';
//             }
//         });
//     }, observerOptions);

//     cards.forEach(card => {
//         observer.observe(card);
//     });

//     // Animation au survol
//     cards.forEach(card => {
//         card.addEventListener('mousemove', (e) => {
//             const rect = card.getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const y = e.clientY - rect.top;
            
//             const shine = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), transparent)`;
//             card.style.backgroundImage = shine;
//         });
        
//         card.addEventListener('mouseleave', () => {
//             card.style.backgroundImage = 'none';
//         });
//     });

//     // Animation du bouton d'achat
//     const buyButtons = document.querySelectorAll('.buy-btn');
//     buyButtons.forEach(button => {
//         button.addEventListener('click', (e) => {
//             const btn = e.target;
//             btn.innerHTML = 'تمت الإضافة ✓';
//             btn.style.background = 'linear-gradient(45deg, #2c5f2e, #1a4a1c)';
            
//             setTimeout(() => {
//                 btn.innerHTML = 'اشتري الآن';
//                 btn.style.background = 'linear-gradient(45deg, #1a4a1c, #2c5f2e)';
//             }, 2000);
//         });
//     });

//     // Sélectionner tous les boutons de filtre et les cartes de livres
//     const filterButtons = document.querySelectorAll('.filter-btn');
//     const bookCards = document.querySelectorAll('.book-card');

//     // Fonction pour filtrer les livres
//     function filterBooks(category) {
//         bookCards.forEach(card => {
//             // Récupérer la catégorie de la carte
//             const cardCategory = card.dataset.category;
            
//             // Si la catégorie est "all" ou correspond à la catégorie de la carte
//             if (category === 'all' || cardCategory === category) {
//                 // Afficher la carte avec animation
//                 card.style.display = 'block';
//                 setTimeout(() => {
//                     card.style.opacity = '1';
//                     card.style.transform = 'scale(1) translateY(0)';
//                 }, 10);
//             } else {
//                 // Cacher la carte avec animation
//                 card.style.opacity = '0';
//                 card.style.transform = 'scale(0.8) translateY(50px)';
//                 setTimeout(() => {
//                     card.style.display = 'none';
//                 }, 300);
//             }
//         });
//     }

//     // Ajouter les écouteurs d'événements aux boutons
//     filterButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             // Retirer la classe active de tous les boutons
//             filterButtons.forEach(btn => btn.classList.remove('active'));
            
//             // Ajouter la classe active au bouton cliqué
//             button.classList.add('active');
            
//             // Filtrer les livres selon la catégorie
//             const category = button.dataset.category;
//             filterBooks(category);
//         });
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('chooseAudio');
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const timeDisplay = document.querySelector('.time-display');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.querySelector('.volume-control i');

    // Fonction pour formater le temps (00:00)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    // Contrôle Play/Pause
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Mise à jour de la barre de progression
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percent}%`;
        
        // Mise à jour du temps
        const currentTime = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration || 0);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    });

    // Cliquer sur la barre de progression pour changer la position
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Contrôle du volume
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        audio.volume = value / 100;
        
        // Changer l'icône du volume en fonction du niveau
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });

    // Cliquer sur l'icône du volume pour muter/démuter
    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.dataset.previousVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = 'fas fa-volume-mute';
        } else {
            const previousVolume = audio.dataset.previousVolume || 1;
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume * 100;
            volumeIcon.className = previousVolume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
        }
    });

    // Gestion des raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            playBtn.click();
        } else if (e.code === 'ArrowLeft') {
            audio.currentTime = Math.max(0, audio.currentTime - 5);
        } else if (e.code === 'ArrowRight') {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        } else if (e.code === 'ArrowUp') {
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
            volumeSlider.dispatchEvent(new Event('input'));
        } else if (e.code === 'ArrowDown') {
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
            volumeSlider.dispatchEvent(new Event('input'));
        }
    });

    // Gestion de la fin de l'audio
    audio.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        progress.style.width = '0%';
    });

    // Gestion des erreurs
    audio.addEventListener('error', () => {
        console.error('Erreur de lecture audio');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
});