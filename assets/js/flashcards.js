const Flashcards = {
    words: [],
    currentIndex: 0,
    reviewedCount: 0,
    
    init: () => {
        const levelSelect = document.getElementById('flashcard-level-select');
        levelSelect.innerHTML = '';
        Data.levels.forEach(l => {
            levelSelect.innerHTML += `<option value="${l}">${l}</option>`;
        });
        
        levelSelect.addEventListener('change', (e) => {
            const level = e.target.value;
            const chapterSelect = document.getElementById('flashcard-chapter-select');
            chapterSelect.innerHTML = '<option value="">All Chapters</option>';
            const chapters = Data.getChaptersByLevel(level);
            chapters.forEach(c => {
                chapterSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        });
        
        document.getElementById('start-flashcards-btn').addEventListener('click', Flashcards.start);
        document.getElementById('fc-flip').addEventListener('click', Flashcards.flip);
        document.getElementById('fc-next').addEventListener('click', Flashcards.nextCard);
        document.getElementById('fc-prev').addEventListener('click', Flashcards.prevCard);
        document.getElementById('fc-restart-btn').addEventListener('click', () => {
            document.getElementById('flashcard-summary').classList.add('hidden');
            document.getElementById('flashcard-setup').classList.remove('hidden');
        });
        
        document.getElementById('fc-quit').addEventListener('click', () => {
            if (confirm('Are you sure you want to quit flashcards practice?')) {
                Flashcards.endPractice(true);
            }
        });
        
        // Trigger change to populate initial chapters
        if(Data.levels.length > 0) {
            levelSelect.value = Data.levels[0];
            levelSelect.dispatchEvent(new Event('change'));
        }
        
        const session = Storage.getSessionState('flashcards');
        if (session && session.currentIndex < session.words.length) {
            Flashcards.words = session.words;
            Flashcards.currentIndex = session.currentIndex;
            Flashcards.reviewedCount = session.reviewedCount;
            
            document.getElementById('flashcard-setup').classList.add('hidden');
            document.getElementById('flashcard-container').classList.remove('hidden');
            Flashcards.showCard();
        }
    },
    
    saveState: () => {
        Storage.setSessionState('flashcards', {
            words: Flashcards.words,
            currentIndex: Flashcards.currentIndex,
            reviewedCount: Flashcards.reviewedCount
        });
    },
    
    start: () => {
        const level = document.getElementById('flashcard-level-select').value;
        const chapter = document.getElementById('flashcard-chapter-select').value;
        
        window.location.hash = 'flashcards-practice';
        
        Flashcards.words = Data.getWords(level, chapter);
        if (Flashcards.words.length === 0) {
            alert('No vocabulary found for selection.');
            return;
        }
        
        // Shuffle
        Flashcards.words.sort(() => Math.random() - 0.5);
        
        Flashcards.currentIndex = 0;
        Flashcards.reviewedCount = 0;
        
        document.getElementById('flashcard-setup').classList.add('hidden');
        document.getElementById('flashcard-summary').classList.add('hidden');
        document.getElementById('flashcard-container').classList.remove('hidden');
        
        Flashcards.showCard();
        Flashcards.saveState();
    },
    
    showCard: () => {
        if (Flashcards.currentIndex >= Flashcards.words.length) {
            Flashcards.end();
            return;
        }
        
        const card = document.querySelector('.flashcard');
        card.classList.remove('flipped');
        
        const w = Flashcards.words[Flashcards.currentIndex];
        document.getElementById('fc-german').innerText = w.german;
        document.getElementById('fc-english').innerText = w.english;
        
        const progress = ((Flashcards.currentIndex) / Flashcards.words.length) * 100;
        document.getElementById('flashcard-progress').style.width = `${progress}%`;
    },
    
    flip: () => {
        document.querySelector('.flashcard').classList.toggle('flipped');
    },
    
    prevCard: () => {
        if (Flashcards.currentIndex > 0) {
            Flashcards.currentIndex--;
            Flashcards.saveState();
            Flashcards.showCard();
        }
    },
    
    nextCard: () => {
        Flashcards.reviewedCount++;
        Storage.addWordReviewed(1);
        Flashcards.currentIndex++;
        Flashcards.saveState();
        Flashcards.showCard();
    },
    
    end: (skipHistory = false) => {
        Storage.clearSessionState('flashcards');
        document.getElementById('flashcard-container').classList.add('hidden');
        document.getElementById('flashcard-summary').classList.remove('hidden');
        document.getElementById('fc-total-reviewed').innerText = Flashcards.reviewedCount;
        
        if (!skipHistory && window.location.hash === '#flashcards-practice') {
            window.location.hash = 'flashcards';
        }
    },
    
    endPractice: (updateHash = true) => {
        Storage.clearSessionState('flashcards');
        document.getElementById('flashcard-container').classList.add('hidden');
        document.getElementById('flashcard-summary').classList.add('hidden');
        document.getElementById('flashcard-setup').classList.remove('hidden');
        if (updateHash) window.location.hash = 'flashcards';
    }
};
window.Flashcards = Flashcards;
