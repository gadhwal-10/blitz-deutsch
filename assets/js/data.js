const Data = {
    vocab: [],
    levels: [],
    
    init: async () => {
        try {
            Data.vocab = window.BLITZ_VOCAB_DATA || [];
            Data.levels = Data.vocab.map(l => l.level);
        } catch (e) {
            console.error('Failed to load vocab data', e);
        }
    },

    getChaptersByLevel: (level) => {
        const lvlData = Data.vocab.find(l => l.level === level);
        return lvlData ? lvlData.chapters : [];
    },

    getWords: (level, chapterId) => {
        const chapters = Data.getChaptersByLevel(level);
        if (!chapterId) {
            // return all words for level
            let all = [];
            chapters.forEach(c => all = all.concat(c.vocab));
            return all;
        }
        const chapter = chapters.find(c => c.id === chapterId);
        return chapter ? chapter.vocab : [];
    },

    getRandomWord: () => {
        if (!Data.vocab.length) return null;
        const randLevel = Data.vocab[Math.floor(Math.random() * Data.vocab.length)];
        if (!randLevel || !randLevel.chapters.length) return null;
        const randChapter = randLevel.chapters[Math.floor(Math.random() * randLevel.chapters.length)];
        if (!randChapter || !randChapter.vocab.length) return null;
        const randWord = randChapter.vocab[Math.floor(Math.random() * randChapter.vocab.length)];
        return {
            level: randLevel.level,
            word: randWord
        };
    }
};
window.Data = Data;
