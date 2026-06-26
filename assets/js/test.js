const Test = {
    words: [],
    history: [],
    currentIndex: 0,
    score: 0,
    maxQuestions: 25,
    level: '',
    chapter: '',
    
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
        
        levelSelect.addEventListener('change', (e) => {
            const level = e.target.value;
            const chapterSelect = document.getElementById('test-chapter-select');
            chapterSelect.innerHTML = '<option value="">All Chapters</option>';
            const chapters = Data.getChaptersByLevel(level);
            chapters.forEach(c => {
                chapterSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        });
        
        document.getElementById('start-test-btn').addEventListener('click', Test.start);
        document.getElementById('test-next').addEventListener('click', () => {
            // If already disabled (waiting for timeout), skip timeout and go next immediately
            if (document.getElementById('test-input').disabled) {
                Test.nextQuestion();
            } else {
                Test.checkAnswer();
            }
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
        
        const dlBtn = document.getElementById('test-download-btn');
        if (dlBtn) dlBtn.addEventListener('click', Test.downloadAnswerKey);
        
        if (Data.levels.length > 0) {
            levelSelect.value = Data.levels[0];
            levelSelect.dispatchEvent(new Event('change'));
        }
        
        const session = Storage.getSessionState('test');
        if (session && session.currentIndex < session.words.length) {
            Test.words = session.words;
            Test.currentIndex = session.currentIndex;
            Test.score = session.score;
            Test.history = session.history || [];
            Test.level = session.level || '';
            Test.chapter = session.chapter || '';
            
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
            score: Test.score,
            history: Test.history,
            level: Test.level,
            chapter: Test.chapter
        });
    },

    start: () => {
        const level = document.getElementById('test-level-select').value;
        const chapter = document.getElementById('test-chapter-select').value;
        const chapterEl = document.getElementById('test-chapter-select');
        Test.level = level;
        Test.chapter = chapterEl && chapterEl.value ? chapterEl.options[chapterEl.selectedIndex].text : 'All Chapters';
        
        const allWords = Data.getWords(level, chapter);
        
        if (allWords.length === 0) {
            alert('No vocabulary found for selection.');
            return;
        }
        
        window.location.hash = 'test-practice';
        
        // Filter out recently tested words
        const recentWords = Storage.getRecentTestWords();
        let availableWords = allWords.filter(w => !recentWords.includes(w.german));
        
        // If we don't have enough unseen words, backfill with the oldest recent words
        if (availableWords.length < Test.maxQuestions) {
            const needed = Test.maxQuestions - availableWords.length;
            const fallbackWords = allWords.filter(w => recentWords.includes(w.german));
            // Prioritize older ones by reversing
            availableWords = [...availableWords, ...fallbackWords.reverse().slice(0, needed)];
        }
        
        // Fisher-Yates Shuffle
        for (let i = availableWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
        }
        
        Test.words = availableWords.slice(0, Math.min(Test.maxQuestions, availableWords.length));
        Storage.addRecentTestWords(Test.words);
        
        Test.currentIndex = 0;
        Test.score = 0;
        Test.history = [];
        
        document.getElementById('test-setup').classList.add('hidden');
        document.getElementById('test-container').classList.remove('hidden');
        
        const tTotal = document.getElementById('test-total-questions');
        if (tTotal) tTotal.innerText = Test.words.length;
        Test.showQuestion();
        Test.saveState();
    },

    getDifficultyStars: (w) => {
        let stars = 1;
        if (w.level === 'A2') stars = 2;
        if (w.level === 'B1') stars = 3;
        if (w.level === 'B2') stars = 4;
        if (w.level === 'C1') stars = 5;
        if (w.german && w.german.length >= 10 && stars < 5) stars += 1;
        return '⭐'.repeat(stars) + '<span style="opacity:0.2;">' + '⭐'.repeat(5 - stars) + '</span>' + `<span style="font-size:12px; font-weight:800; color:var(--accent-color); margin-left:8px;">${w.level || 'A1'}</span>`;
    },

    showQuestion: () => {
        if (Test.currentIndex >= Test.words.length) {
            Test.end();
            return;
        }
        
        const w = Test.words[Test.currentIndex];
        document.getElementById('test-question-number').innerText = `Question ${Test.currentIndex + 1} of ${Test.words.length}`;
        const starContainer = document.getElementById('test-difficulty-stars');
        if (starContainer) starContainer.innerHTML = Test.getDifficultyStars(w);
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
        
        inputEl.disabled = true;
        
        const w = Test.words[Test.currentIndex];
        const target = w.german.toLowerCase();
        const cleanTarget = target.replace(/\([^)]*\)/g, '').trim();
        const englishPrompt = w.english.toLowerCase().trim();
        
        let isCorrect = false;
        let matchedTarget = cleanTarget;
        
        if (answer) {
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
        }
        
        if (isCorrect) {
            Test.score++;
            if (matchedTarget !== cleanTarget) {
                Test.showFeedback(true, `Correct! (also: ${cleanTarget})`);
            } else {
                Test.showFeedback(true, "Correct!");
            }
        } else {
            if (!answer) {
                Test.showFeedback(false, "Skipped.", cleanTarget);
            } else {
                Test.showFeedback(false, "Incorrect.", cleanTarget);
            }
        }
        
        Test.history.push({
            question: w.english,
            userAnswer: answer || '(skipped)',
            correctAnswer: cleanTarget,
            isCorrect: isCorrect
        });
        
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
        const totalResultEl = document.getElementById('test-total-questions-result');
        if(totalResultEl) totalResultEl.innerText = Test.words.length;
        
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
    },
    
    downloadAnswerKey: () => {
        let text = "Blitz Deutsch - Test Answer Key\n";
        if (Test.level) {
            text += `Level: ${Test.level} (${Test.chapter || 'All Chapters'})\n`;
        }
        text += `Score: ${Test.score} / ${Test.words.length}\n`;
        text += "----------------------------------------\n\n";
        
        Test.words.forEach((w, index) => {
            text += `${index + 1}. Question: ${w.english}\n`;
            
            const historyItem = Test.history.find(h => h.question === w.english);
            
            if (historyItem) {
                text += `   Your Answer: ${historyItem.userAnswer}\n`;
                text += `   Correct Answer: ${historyItem.correctAnswer}\n`;
                text += `   Result: ${historyItem.isCorrect ? '✅ Correct' : '❌ Incorrect'}\n\n`;
            } else {
                const cleanTarget = w.german.replace(/\([^)]*\)/g, '').trim();
                text += `   Your Answer: (skipped)\n`;
                text += `   Correct Answer: ${cleanTarget}\n`;
                text += `   Result: ❌ Skipped\n\n`;
            }
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blitz-deutsch-answer-key.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
window.Test = Test;
