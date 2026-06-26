# 🇩🇪 Blitz Deutsch

<p align="center">
  <img src="https://img.shields.io/badge/Level-A1--B1-blue?style=for-the-badge" alt="Level">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla_JS-yellow?style=for-the-badge" alt="JavaScript">
  <img src="https://img.shields.io/badge/Responsive-Yes-success?style=for-the-badge" alt="Responsive">
  <img src="https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge" alt="Open Source">
  <img src="https://img.shields.io/badge/Dark%20Mode-🌙-black?style=for-the-badge" alt="Dark Mode">
</p>

<p align="center">
A modern German vocabulary learning platform for <b>A1–B1 learners</b> featuring interactive vocabulary practice, gamified learning with streak tracking, difficulty-rated tests, and an engaging word jumble game.
</p>

---

## 🌐 Live Demo

🔗 **https://blitz-deutsch.vercel.app**

---

## 📖 About

**Blitz Deutsch** is an interactive German vocabulary learning platform designed for learners preparing for **A1, A2, and B1** German language levels.

Instead of relying on scattered resources, **Blitz Deutsch** brings everything together in one unified platform. Master German vocabulary through structured lessons, interactive flashcards, difficulty-rated tests, gamified word games, and detailed progress tracking.

Whether you're preparing for Goethe German exams, language tests, or simply improving your German vocabulary, Blitz Deutsch offers a clean, responsive, and engaging learning experience built with modern web technologies.

---

## ✨ Key Features

### 📊 **Dashboard & Progress Tracking**
- 🔥 **Day Streak Counter** - Build and maintain a consistent learning habit
- 📈 **Progress Metrics** - Track words reviewed, tests taken, and average score
- 📱 **Real-time Stats** - Monitor your learning journey at a glance
- 💾 **Persistent Progress** - All data saved locally in localStorage

### 📚 **Vocabulary Learning**
- 🎓 **5000+ German Words** - Organized by A1, A2, and B1 levels
- 📖 **Chapter-wise Vocabulary** - Structured learning by topic
- 🔍 **Bilingual Dictionary** - Search German ↔ English with instant translations
- 💬 **Example Sentences** - Understand vocabulary in real-world context
- 🌟 **Word of the Day** - Daily vocabulary boost

### ⭐ **Intelligent Testing System**
- 📝 **25-Question Vocabulary Tests** - A1–B1 level and chapter-wise quizzes
- ⭐ **Difficulty Rating System** - 5-star difficulty indicators (⭐ = easy, ⭐⭐⭐⭐⭐ = hard)
- ✅ **Instant Score Feedback** - View results immediately after submission
- 📥 **Answer Keys** - Download and review correct answers
- 🎯 **Level-wise Testing** - Filter tests by language level

### 🎮 **Gamification & Engagement**
- 🎯 **Wort-Salat Game** - Unscramble German words for instant streak bonuses
- 🃏 **Interactive Flashcards** - Active recall practice with spaced repetition
- 🏆 **Streak Bonuses** - Earn extra streak points from game performance
- 🎪 **Fun Learning Experience** - Make vocabulary practice engaging, not tedious

### 🎨 **User Experience**
- 🌙 **Dark Mode Design** - Modern, professional, easy on the eyes
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- ⚡ **Fast & Smooth** - Vanilla JS for zero-dependency speed
- 🎯 **Intuitive Navigation** - Clean UI with clear call-to-actions

---

## 🎯 Learning Benefits

✅ Build German vocabulary systematically from A1 to B1  
✅ Learn through active recall with flashcards  
✅ Test your knowledge with difficulty-rated quizzes  
✅ Gamify learning with streak tracking and word jumble game  
✅ Search German-English vocabulary instantly  
✅ See example sentences for contextual learning  
✅ Track progress with real-time statistics  
✅ Develop a consistent daily learning habit  
✅ Prepare confidently for German language exams  
✅ Practice at your own pace, anytime, anywhere  

---

## 📚 Learning Levels

| Level | Description | Words |
|------|-------------|-------|
| 🟢 A1 | Beginner German Vocabulary | 1800+ |
| 🔵 A2 | Elementary German Vocabulary | 1800+ |
| 🟠 B1 | Intermediate German Vocabulary | 1800+ |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data:** JSON vocabulary database
- **Storage:** Browser localStorage for progress persistence
- **Deployment:** Vercel
- **Version Control:** Git & GitHub

---

## 📂 Project Structure

```
blitz-deutsch/
│
├── assets/
│   ├── css/
│   │   └── styles.css              # Main styling (dark mode, responsive)
│   │
│   └── js/
│       ├── app.js                  # Main application logic
│       ├── data.js                 # Data management
│       ├── dictionary.js           # Dictionary & search functionality
│       ├── flashcards.js           # Flashcard logic
│       ├── game.js                 # Wort-Salat jumble game
│       ├── storage.js              # localStorage wrapper (streak, progress)
│       ├── test.js                 # Test/quiz logic with star difficulty
│       └── ui.js                   # UI updates & DOM manipulation
│
├── data/
│   ├── vocab.js                    # Vocabulary data with difficulty ratings
│   └── vocab.json                  # JSON vocabulary backup
│
├── index.html                      # Main HTML file
├── LICENSE                         # MIT License
├── README.md                       # This file
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No backend server required (100% client-side)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/gadhwal-10/blitz-deutsch.git
cd blitz-deutsch
```

**2. Run locally**

Option A: Open in browser
```bash
# Simply open index.html in your web browser
open index.html
```

Option B: Use Live Server (VS Code)
```bash
# Install Live Server extension, then right-click index.html
# and select "Open with Live Server"
```

Option C: Use Python (local server)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
# Then visit http://localhost:8000
```

**3. Access the app**
- Open your browser and navigate to the local URL shown
- Or visit the live demo: https://blitz-deutsch.vercel.app

---

## 💡 How to Use

### 📖 Learn Vocabulary
1. Go to **Learn Vocab** section
2. Filter by level (A1, A2, B1) or chapter
3. Browse and learn new German words

### 🃏 Practice with Flashcards
1. Click **Flashcards**
2. Select level and chapter
3. Click **Start Practice**
4. Flip cards to reveal translations
5. Review until you're comfortable

### 📝 Take a Test
1. Navigate to **Test**
2. Choose difficulty level and chapter
3. **⭐ Star ratings** show word difficulty
4. Type your answer (don't forget der/die/das!)
5. Submit and view instant feedback

### 🎮 Play Wort-Salat Game
1. Click **PLAY GAME** button (navbar)
2. Unscramble 10 German words
3. Earn instant streak bonuses
4. Complete to unlock achievements

### 🔍 Search Dictionary
1. Go to **Dictionary**
2. Search German or English words
3. View translations, example sentences, and pronunciation

### 📊 Track Progress
- View your **Dashboard** on home page
- Monitor: Streak, Words Reviewed, Tests Taken, Avg Score
- Progress saves automatically via localStorage

---

## 🎮 Features Breakdown

### Streak System 🔥
- Automatically tracks consecutive days of practice
- Resets if you miss a day
- Boosts motivation through the Seinfeld Method
- Extra bonuses from Wort-Salat game success

### Star Difficulty ⭐
- **⭐** = Common/Beginner words (der, die, das, Mann)
- **⭐⭐** = A1 vocabulary
- **⭐⭐⭐** = A2 vocabulary  
- **⭐⭐⭐⭐** = B1 vocabulary
- **⭐⭐⭐⭐⭐** = Advanced/rare words

Difficulty ratings help you gauge word complexity and challenge yourself progressively.

### Wort-Salat Game 🎮
- Unscramble 10 randomized German words
- Difficulty increases as you play
- Earn streak bonuses on completion
- Perfect for active recall practice
- Fun alternative to traditional studying

---

## 🔧 Customization

### Add More Vocabulary
Edit `data/vocab.json` with this structure:
```json
{
  "id": "word_1",
  "english": "English Word",
  "german": "German Word",
  "article": "der/die/das",
  "level": "A1",
  "chapter": "Chapter Name",
  "example": "Example sentence in German",
  "difficulty": 2
}
```

### Modify Styling
Edit `assets/css/styles.css` to customize:
- Colors (dark mode theme)
- Typography
- Spacing & layout
- Responsive breakpoints

### Adjust Game Settings
In `assets/js/game.js`, modify:
- Number of words per game
- Difficulty progression
- Streak bonus amounts

---

## 📱 Responsive Design

✅ **Desktop** - Full featured experience (1920px+)  
✅ **Tablet** - Optimized layout (768px - 1024px)  
✅ **Mobile** - Touch-friendly interface (< 768px)  

All features work seamlessly across devices.

---

## 🤝 Contributing

Contributions are welcome! Help make German learning better for everyone.

**Steps to contribute:**

1. Fork the repository
```bash
# Click "Fork" on GitHub
```

2. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

3. Make your changes
```bash
# Edit files as needed
```

4. Commit your changes
```bash
git commit -m "Add: Brief description of feature"
```

5. Push to your branch
```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request
```bash
# Go to GitHub and click "Compare & Pull Request"
```



## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You're free to use, modify, and distribute this project for personal and commercial purposes.

---

## 👨‍💻 Author

**Aryan Gadhwal**

- **GitHub:** https://github.com/gadhwal-10
- **Live Demo:** https://blitz-deutsch.vercel.app
- **Portfolio:** [Your portfolio link]

---



<p align="center">
  <strong>Made with ❤️ for German Language Learners</strong>
</p>

<p align="center">
  <em>Master German vocabulary with speed and precision.</em>
</p>
