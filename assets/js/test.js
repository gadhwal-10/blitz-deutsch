const Test = {
    words: [],
    currentIndex: 0,
    score: 0,
    maxQuestions: 100,
    
    levenshtein: (a, b) => {
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        var matrix = [];
        for(let i = 0; i <= b.length; i++) matrix[i] = [i];
        for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    },

    init: () => {
        const levelSelect = document.getElementById('test-level-select');
        levelSelect.innerHTML = '';
        Data.levels.forEach(l => {
            levelSelect.innerHTML += `<option value="${l}">${l}</option>`;
        });
        
        document.getElementById('start-test-btn').addEventListener('click', Test.start);
        document.getElementById('test-submit').addEventListener('click', Test.checkAnswer);
        document.getElementById('test-next').addEventListener('click', () => {
            Test.showFeedback(false, "Skipped", Test.words[Test.currentIndex].german);
            setTimeout(() => Test.nextQuestion(), 1000);
        });
        document.getElementById('test-quit').addEventListener('click', () => Test.quitTest(true));
        document.getElementById('test-submit-test').addEventListener('click', () => {
            if (confirm('Are you sure you want to submit your test early? You will be scored based on your current progress.')) {
                Test.end();
            }
        });
        
        document.getElementById('test-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // If it's already disabled, they are hitting enter to skip the timeout and go next
                if (document.getElementById('test-input').disabled) {
                    Test.nextQuestion();
                } else {
                    Test.checkAnswer();
                }
            }
        });
        
        document.getElementById('test-home-btn').addEventListener('click', () => {
            document.querySelector('.nav-btn[data-target="home"]').click();
            document.getElementById('test-results').classList.add('hidden');
            document.getElementById('test-setup').classList.remove('hidden');
        });
        
        const session = Storage.getSessionState('test');
        if (session && session.currentIndex < session.words.length) {
            Test.words = session.words;
            Test.currentIndex = session.currentIndex;
            Test.score = session.score;
            
            document.getElementById('test-setup').classList.add('hidden');
            document.getElementById('test-container').classList.remove('hidden');
            document.getElementById('test-total-questions').innerText = Test.words.length;
            Test.showQuestion();
        }
    },
    
    saveState: () => {
        Storage.setSessionState('test', {
            words: Test.words,
            currentIndex: Test.currentIndex,
            score: Test.score
        });
    },

    start: () => {
        const level = document.getElementById('test-level-select').value;
        const allWords = Data.getWords(level, null);
        
        if (allWords.length === 0) {
            alert('No vocabulary found for level.');
            return;
        }
        
        // Fisher-Yates Shuffle for robust randomization
        for (let i = allWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
        }
        
        Test.words = allWords.slice(0, Math.min(Test.maxQuestions, allWords.length));
        
        Test.currentIndex = 0;
        Test.score = 0;
        
        document.getElementById('test-setup').classList.add('hidden');
        document.getElementById('test-container').classList.remove('hidden');
        
        document.getElementById('test-total-questions').innerText = Test.words.length;
        Test.showQuestion();
        Test.saveState();
    },

    showQuestion: () => {
        if (Test.currentIndex >= Test.words.length) {
            Test.end();
            return;
        }
        
        const w = Test.words[Test.currentIndex];
        document.getElementById('test-question-number').innerText = `Question ${Test.currentIndex + 1} of ${Test.words.length}`;
        document.getElementById('test-question').innerText = w.english;
        document.getElementById('test-input').value = '';
        document.getElementById('test-input').disabled = false;
        document.getElementById('test-input').focus();
        document.getElementById('test-feedback').innerText = '';
        
        const progress = (Test.currentIndex / Test.words.length) * 100;
        document.getElementById('test-progress').style.width = `${progress}%`;
    },

    checkAnswer: () => {
        const inputEl = document.getElementById('test-input');
        const answer = inputEl.value.trim().toLowerCase();
        if (!answer) return;
        
        inputEl.disabled = true;
        
        const w = Test.words[Test.currentIndex];
        const target = w.german.toLowerCase();
        const cleanTarget = target.replace(/\([^)]*\)/g, '').trim();
        const englishPrompt = w.english.toLowerCase().trim();
        
        let isCorrect = false;
        let matchedTarget = cleanTarget;
        
        const checkSynonyms = (cleanStr) => {
            const parts = cleanStr.split(/[,/]/).map(s => s.trim()).filter(s => s);
            for (const p of parts) {
                if (answer === p) return p;
                const dist = Test.levenshtein(answer, p);
                if (dist <= 2 && p.length > 4) return p;
            }
            return null;
        };

        const match = checkSynonyms(cleanTarget);
        if (match) {
            isCorrect = true;
            matchedTarget = match;
        }
        
        // If not correct against primary target, check for valid synonyms in the whole dictionary
        if (!isCorrect) {
            let foundSynonym = false;
            const baseEnglish = englishPrompt.replace(/\([^)]*\)/g, '').trim();
            
            Data.vocab.forEach(lvl => {
                lvl.chapters.forEach(chap => {
                    chap.vocab.forEach(v => {
                        const synEnglish = v.english.toLowerCase().replace(/\([^)]*\)/g, '').trim();
                        if (synEnglish === baseEnglish && synEnglish !== "") {
                            const synTarget = v.german.toLowerCase();
                            const synCleanTarget = synTarget.replace(/\([^)]*\)/g, '').trim();
                            
                            const synMatch = checkSynonyms(synCleanTarget);
                            if (synMatch) {
                                foundSynonym = true;
                                matchedTarget = synMatch;
                            }
                        }
                    });
                });
            });
            if (foundSynonym) {
                isCorrect = true;
            }
        }
        
        if (isCorrect) {
            Test.score++;
            if (matchedTarget !== cleanTarget) {
                Test.showFeedback(true, `Correct! (also: ${cleanTarget})`);
            } else {
                Test.showFeedback(true, "Correct!");
            }
        } else {
            Test.showFeedback(false, "Incorrect.", cleanTarget);
        }
        Test.saveState();
        
        setTimeout(() => Test.nextQuestion(), 2000);
    },

    showFeedback: (isCorrect, msg, correctAnswer = '') => {
        const fbEl = document.getElementById('test-feedback');
        if (isCorrect) {
            fbEl.innerHTML = `<span style="color:var(--success-color)">✅ ${msg}</span>`;
        } else {
            fbEl.innerHTML = `<span style="color:var(--error-color)">❌ ${msg} Correct answer: ${correctAnswer}</span>`;
        }
    },

    nextQuestion: () => {
        Test.currentIndex++;
        Test.saveState();
        Test.showQuestion();
    },

    end: (skipHistory = false) => {
        Storage.clearSessionState('test');
        document.getElementById('test-container').classList.add('hidden');
        document.getElementById('test-results').classList.remove('hidden');
        
        const percent = Math.round((Test.score / Test.words.length) * 100);
        document.getElementById('test-final-score').innerText = Test.score;
        
        Storage.addTestResult(percent);
        
        if (!skipHistory && window.location.hash === '#test-practice') {
            window.location.hash = 'test';
        }
    },

    quitTest: (triggeredByButton = true, skipPrompt = false) => {
        const testContainer = document.getElementById('test-container');
        if (testContainer.classList.contains('hidden')) {
            // Not actively in a test, so don't prompt
            if (triggeredByButton) window.location.hash = 'test';
            return;
        }

        if (skipPrompt || confirm('Are you sure you want to quit the test? Your progress will be lost.')) {
            Storage.clearSessionState('test');
            testContainer.classList.add('hidden');
            document.getElementById('test-results').classList.add('hidden');
            document.getElementById('test-setup').classList.remove('hidden');
            if (triggeredByButton) window.location.hash = 'test';
        }
    }
};
window.Test = Test;
