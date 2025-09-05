
// src/book/study-aids.js

/**
 * Initializes all flashcard functionality.
 * This function should be called after content is loaded.
 */
export function initializeFlashcards(contentArea) {
    const flashcards = contentArea.querySelectorAll('.flashcard');
    // Initialize flashcards

    flashcards.forEach((flashcard) => {
        const inner = flashcard.querySelector('.flashcard-inner');
        if (inner) {
            // Remove onclick attribute to prevent conflicts
            inner.removeAttribute('onclick');

            // Add JavaScript event listener for flipping
            inner.addEventListener('click', function(e) {
                if (e.target.closest('.flashcard-expand-btn')) {
                    return; // Don't flip if clicking the expand button
                }
                e.preventDefault();
                e.stopPropagation();
                this.parentElement.classList.toggle('flipped');
            });
        }

        const expandBtn = flashcard.querySelector('.flashcard-expand-btn');
        if (expandBtn) {
            expandBtn.removeAttribute('onclick');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFlashcardModal(expandBtn);
            });
        }
    });
}

/**
 * Opens the universal modal with flashcard content.
 * @param {HTMLElement} button - The button that was clicked.
 */
function openFlashcardModal(button) {
    const flashcard = button.closest('.flashcard');
    if (!flashcard) return;

    const question = flashcard.querySelector('.flashcard-front p')?.textContent;
    const answer = flashcard.querySelector('.flashcard-back p')?.innerHTML;

    if (question && answer) {
        // Use the global app instance to open universal modal
        if (window.navigationManager) {
            window.navigationManager.openFlashcardModal(question, answer);
        }
    }
}

/**
 * Sets up the universal modal connection.
 * This should be called once when the application initializes.
 */
export function setupGlobalFlashcardModal() {
    // Universal modal is now handled by NavigationManager
    // This function is kept for backward compatibility
    console.log('⚡️ Flashcard modal integration with universal modal complete.');
}
