const App = {
    init: async () => {
        await Data.init();
        
        // Init UI components
        UI.renderBrowserFilters();
        UI.renderDashboard();
        UI.renderWOTD();
        
        Flashcards.init();
        Test.init();
        if (window.Dictionary) Dictionary.init();
        
        App.setupNavigation();
        
        // Handle initial hash routing
        const hash = window.location.hash.replace('#', '') || 'home';
        App.navigateTo(hash, false, true); // Pass true for isInitialLoad
    },

    setupNavigation: () => {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                App.navigateTo(target);
            });
        });

        // Hamburger Menu Logic
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navLinksContainer = document.querySelector('.nav-links');
        if (mobileMenuBtn && navLinksContainer) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinksContainer.classList.toggle('nav-active');
            });
        }
        
        // Handle action cards on home view
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const link = card.getAttribute('data-link');
                App.navigateTo(link);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            if (hash === App.lastHash) return; // Ignore if already handled
            
            // Delegate to navigateTo so interception logic runs before state is lost
            App.navigateTo(hash, true);
        });
    },

    lastHash: window.location.hash.replace('#', '') || 'home',

    navigateTo: (viewId, isFromHashChange = false, isInitialLoad = false) => {
        const baseViewId = viewId.split('-')[0];

        // Intercept navigation away from active test FIRST (before auto-redirects)
        // Check both 'test-practice' (if reloaded) and 'test' (if started normally without URL change)
        if (!isInitialLoad && (App.lastHash === 'test-practice' || App.lastHash === 'test') && viewId !== 'test-practice') {
            const testContainer = document.getElementById('test-container');
            // Only ask if test is actively running (not hidden, not submitted)
            if (window.Test && testContainer && !testContainer.classList.contains('hidden')) {
                if (isFromHashChange) {
                    window.location.hash = App.lastHash;
                }

                // Show custom modal instead of native confirm to prevent browser blocking
                const modal = document.getElementById('custom-confirm');
                if (modal) {
                    if (modal.classList.contains('hidden')) {
                        modal.classList.remove('hidden');

                        // Setup modal buttons
                        const btnCancel = document.getElementById('custom-confirm-cancel');
                        const btnOk = document.getElementById('custom-confirm-ok');
                        
                        const cleanup = () => {
                            btnCancel.replaceWith(btnCancel.cloneNode(true));
                            btnOk.replaceWith(btnOk.cloneNode(true));
                        };

                        document.getElementById('custom-confirm-cancel').addEventListener('click', () => {
                            modal.classList.add('hidden');
                            cleanup();
                        }, { once: true });

                        document.getElementById('custom-confirm-ok').addEventListener('click', () => {
                            modal.classList.add('hidden');
                            cleanup();
                            window.Test.quitTest(false, true); // Quit cleanly
                            App.lastHash = 'test';
                            window.location.hash = 'test';
                            App.navigateTo('test');
                        }, { once: true });
                    }
                    return; // ALWAYS Halt navigation while test is active (modal handles resolution)
                }
            }
        }

        let finalViewId = viewId;

        // Auto-redirect to practice hash if a session is active
        if (baseViewId === 'flashcards' && viewId === 'flashcards' && Storage.getSessionState('flashcards')) {
            // Prevent trapping the user if they specifically hit the back button from practice mode
            if (!isFromHashChange || App.lastHash !== 'flashcards-practice') {
                finalViewId = 'flashcards-practice';
            }
        }
        if (baseViewId === 'test' && viewId === 'test' && Storage.getSessionState('test')) {
            finalViewId = 'test-practice';
        }

        // Reset section state if navigating to its root
        if (finalViewId === 'flashcards' && window.Flashcards) window.Flashcards.endPractice(false);
        if (finalViewId === 'test' && window.Test) window.Test.quitTest(false, true);

        App.lastHash = finalViewId;
        if (!isFromHashChange || finalViewId !== viewId) {
            window.location.hash = finalViewId;
        }
        
        // Update Nav Active State
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(btn.getAttribute('data-target') === baseViewId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        // Show target view
        const targetView = document.getElementById(`view-${baseViewId}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
        } else {
            // fallback to home
            document.getElementById('view-home').classList.remove('hidden');
            document.getElementById('view-home').classList.add('active');
        }
        
        // Special actions on nav
        if (baseViewId === 'home') {
            UI.renderDashboard();
        }

        if (baseViewId === 'browser' && window.UI) {
            window.UI.renderBrowserFilters();
            window.UI.renderVocabList();
        }

        if (baseViewId === 'dictionary') {
            const searchEl = document.getElementById('dict-search-input');
            if (searchEl) setTimeout(() => searchEl.focus(), 100);
        }

        // Auto-close mobile menu on navigation
        const navLinksContainer = document.querySelector('.nav-links');
        if (navLinksContainer) {
            navLinksContainer.classList.remove('nav-active');
        }
    }
};

document.addEventListener('DOMContentLoaded', App.init);
