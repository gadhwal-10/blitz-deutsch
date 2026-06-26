const Dictionary = {
    allWords: [],
    searchTimeout: null,

    init: () => {
        // Flatten vocabulary pool once for fast search
        Dictionary.allWords = [];
        if (window.Data && Data.vocab) {
            Data.vocab.forEach(lvl => {
                lvl.chapters.forEach(chap => {
                    chap.vocab.forEach(w => {
                        Dictionary.allWords.push({
                            level: lvl.level,
                            chapterName: chap.name,
                            german: w.german,
                            english: w.english
                        });
                    });
                });
            });
        }

        const searchInput = document.getElementById('dict-search-input');
        const clearBtn = document.getElementById('dict-clear-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (clearBtn) {
                    clearBtn.style.display = query.length > 0 ? 'block' : 'none';
                }
                clearTimeout(Dictionary.searchTimeout);
                Dictionary.searchTimeout = setTimeout(() => {
                    Dictionary.search(query);
                }, 250);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                    searchInput.dispatchEvent(new Event('input'));
                }
            });
        }
    },

    levenshtein: (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    },

    cleanWord: (str) => {
        return str.replace(/\([^)]*\)/g, '').trim();
    },

    getExampleSentence: (item) => {
        // Check if explicit example exists in parentheses
        const deMatch = item.german.match(/\(([^)]+)\)/);
        const enMatch = item.english.match(/\(([^)]+)\)/);

        if (deMatch && deMatch[1].length > 3) {
            return {
                german: deMatch[1].trim(),
                english: enMatch ? enMatch[1].trim() : `Example with: ${Dictionary.cleanWord(item.english)}`
            };
        }

        const cleanDe = Dictionary.cleanWord(item.german);
        const cleanEn = Dictionary.cleanWord(item.english);

        // Check if noun with article
        const artMatch = cleanDe.match(/^(der|die|das)\s+(.*)/i);
        if (artMatch) {
            const article = artMatch[1];
            const noun = artMatch[2];
            const capArt = article.charAt(0).toUpperCase() + article.slice(1).toLowerCase();
            return {
                german: `${capArt} ${noun} ist sehr wichtig.`,
                english: `The ${cleanEn.toLowerCase()} is very important.`
            };
        }

        // Check if verb (ends in -en / -rn)
        if (/^[a-zäöüß]+(en|rn)$/.test(cleanDe)) {
            return {
                german: `Ich möchte heute ${cleanDe}.`,
                english: `I would like to ${cleanEn.toLowerCase()} today.`
            };
        }

        // Default adjective / adverb / other
        return {
            german: `Das ist wirklich ${cleanDe}.`,
            english: `That is really ${cleanEn.toLowerCase()}.`
        };
    },

    search: (query) => {
        const resultsContainer = document.getElementById('dict-results');
        if (!resultsContainer) return;

        if (!query) {
            resultsContainer.innerHTML = `
                <div class="dict-placeholder card text-center" style="grid-column: 1 / -1; padding: 48px 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍 📖</div>
                    <h3>Search German & English Vocabulary</h3>
                    <p class="text-muted mt-2">Type any word above to translate, listen to native pronunciation, and see example sentences.</p>
                </div>
            `;
            return;
        }

        const q = query.toLowerCase().trim();
        const scoredResults = [];

        Dictionary.allWords.forEach(w => {
            const cleanDe = Dictionary.cleanWord(w.german).toLowerCase();
            const cleanEn = Dictionary.cleanWord(w.english).toLowerCase();
            
            // Strip article for noun root matching
            const deNounMatch = cleanDe.match(/^(der|die|das)\s+(.*)/);
            const deNoun = deNounMatch ? deNounMatch[2] : cleanDe;

            let score = 0;

            // Check exact match
            if (cleanDe === q || cleanEn === q || deNoun === q) {
                score = 100;
            } else if (cleanDe.startsWith(q) || cleanEn.startsWith(q) || deNoun.startsWith(q)) {
                score = 80;
            } else if (cleanDe.includes(q) || cleanEn.includes(q)) {
                score = 60;
            } else if (q.length >= 4) {
                const distDe = Dictionary.levenshtein(q, deNoun);
                const distEn = Dictionary.levenshtein(q, cleanEn);
                const minDist = Math.min(distDe, distEn);
                if (minDist <= 1 && q.length >= 5) score = 50;
                else if (minDist <= 2 && q.length >= 7) score = 40;
            }

            if (score > 0) {
                scoredResults.push({ item: w, score });
            }
        });

        // If we have strong matches (score >= 60), drop fuzzy matches (score < 60)
        const hasStrongMatches = scoredResults.some(r => r.score >= 60);
        const filteredResults = hasStrongMatches ? scoredResults.filter(r => r.score >= 60) : scoredResults;

        // Sort by score descending, then by shortest word length
        filteredResults.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return Dictionary.cleanWord(a.item.german).length - Dictionary.cleanWord(b.item.german).length;
        });

        const topResults = filteredResults.slice(0, 24).map(r => r.item);
        Dictionary.renderResults(topResults, query);
    },

    renderResults: (results, query) => {
        const resultsContainer = document.getElementById('dict-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="dict-empty card text-center" style="grid-column: 1 / -1; padding: 48px 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
                    <h3>No translations found for "${query}"</h3>
                    <p class="text-muted mt-2">Try checking your spelling or search for root words (e.g., 'sprechen' instead of 'gesprochen').</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = '';

        results.forEach(w => {
            const cleanDe = Dictionary.cleanWord(w.german);
            const cleanEn = Dictionary.cleanWord(w.english);
            const example = Dictionary.getExampleSentence(w);

            let articlePill = '';
            let displayGerman = cleanDe;
            const artMatch = cleanDe.match(/^(der|die|das)\s+(.*)/i);
            if (artMatch) {
                const art = artMatch[1].toLowerCase();
                displayGerman = artMatch[2];
                let pillColor = '#3b82f6'; // blue for der
                if (art === 'die') pillColor = '#ec4899'; // pink for die
                if (art === 'das') pillColor = '#10b981'; // green for das
                articlePill = `<span class="dict-article-pill" style="background:${pillColor}; color:#fff; padding:2px 10px; border-radius:12px; font-size:14px; font-weight:800; margin-right:8px;">${art}</span>`;
            }

            const card = document.createElement('div');
            card.className = 'dict-card card';
            card.style.cssText = 'display:flex; flex-direction:column; justify-content:space-between; gap:16px; padding:24px; transition: transform 0.2s ease, box-shadow 0.2s ease;';

            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span class="level-badge" style="background:var(--border-color); color:var(--accent-color); padding:4px 12px; font-size:12px; font-weight:800; border-radius:12px;">${w.level} • ${w.chapterName}</span>
                    </div>
                    
                    <div style="margin-bottom:12px;">
                        <div style="display:flex; align-items:baseline; flex-wrap:wrap;">
                            ${articlePill}
                            <h2 style="font-size:28px; font-weight:800; color:var(--text-color); margin:0;">${displayGerman}</h2>
                        </div>
                        <p style="font-size:20px; color:var(--secondary-color); font-weight:600; margin-top:4px;">🇬🇧 ${cleanEn}</p>
                    </div>

                    <div class="dict-example-box" style="background:rgba(255,255,255,0.03); border-left: 3px solid var(--accent-color); padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top:16px;">
                        <p style="font-size:15px; color:var(--text-color); font-style:italic; margin:0;">"${example.german}"</p>
                        <p style="font-size:14px; color:#9ca3af; margin-top:4px;">${example.english}</p>
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-top:16px; border-top: 1px solid var(--border-color); padding-top:16px;">
                    <button class="btn btn-secondary dict-listen-de" style="flex:1; padding:8px 12px; font-size:14px; display:flex; align-items:center; justify-content:center; gap:6px;">🇩🇪 🔊 Word</button>
                    <button class="btn btn-secondary dict-listen-ex" style="flex:1; padding:8px 12px; font-size:14px; display:flex; align-items:center; justify-content:center; gap:6px;">💬 🔊 Example</button>
                    <button class="btn btn-secondary dict-listen-en" style="padding:8px 12px; font-size:14px;" title="Listen English">🇬🇧 🔊</button>
                </div>
            `;

            card.querySelector('.dict-listen-de').addEventListener('click', () => {
                if (window.UI) UI.playAudio(cleanDe, 'de-DE');
            });
            card.querySelector('.dict-listen-ex').addEventListener('click', () => {
                if (window.UI) UI.playAudio(example.german, 'de-DE');
            });
            card.querySelector('.dict-listen-en').addEventListener('click', () => {
                if (window.UI) UI.playAudio(cleanEn, 'en-US');
            });

            resultsContainer.appendChild(card);
        });
    }
};

window.Dictionary = Dictionary;
