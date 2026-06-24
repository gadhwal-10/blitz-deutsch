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
        
        const rawWords = Data.getWords(level, chapter);
        if (rawWords.length === 0) {
            alert('No vocabulary found for selection.');
            return;
        }
        
        // Shuffle the initial pool
        rawWords.sort(() => Math.random() - 0.5);
        
        // Chunk into blocks of 10, duplicate them to enforce repetition, and shuffle each block
        const finalDeck = [];
        const chunkSize = 10;
        for (let i = 0; i < rawWords.length; i += chunkSize) {
            let chunk = rawWords.slice(i, i + chunkSize);
            // Duplicate the chunk so every word appears twice in this small window
            let doubledChunk = [...chunk, ...chunk];
            // Shuffle this local window
            doubledChunk.sort(() => Math.random() - 0.5);
            finalDeck.push(...doubledChunk);
        }
        
        Flashcards.words = finalDeck;
        
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
        
        let article = "";
        let germanText = w.german;
        const articleMatch = germanText.match(/^(der|die|das)\s+(.*)/i);
        if (articleMatch) {
            article = articleMatch[1].toLowerCase();
            germanText = articleMatch[2];
        }
        
        const fcGerman = document.getElementById('fc-german');
        fcGerman.innerText = germanText;
        fcGerman.classList.remove('long-text', 'very-long-text');
        if (germanText.length > 30) {
            fcGerman.classList.add('very-long-text');
        } else if (germanText.length > 15) {
            fcGerman.classList.add('long-text');
        }
        
        document.getElementById('fc-article').innerText = article;
        
        const fcEnglish = document.getElementById('fc-english');
        fcEnglish.innerText = w.english;
        fcEnglish.classList.remove('long-text', 'very-long-text');
        if (w.english.length > 30) {
            fcEnglish.classList.add('very-long-text');
        } else if (w.english.length > 15) {
            fcEnglish.classList.add('long-text');
        }
        
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
