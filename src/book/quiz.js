// src/book/quiz.js

/**
 * Initializes all quiz and exam containers found in the content area.
 * This function should be called after content is loaded.
 * @param {HTMLElement} contentArea - The main content area element.
 */
export function initializeQuizzes(contentArea) {
    const quizContainers = contentArea.querySelectorAll('.quiz-container');
    // Initialize quiz containers
    
    quizContainers.forEach(container => {
        setupQuizContainer(container);
    });
}

/**
 * Sets up a single quiz or exam container.
 * @param {HTMLElement} container - The quiz container element.
 */
function setupQuizContainer(container) {
    const cards = container.querySelectorAll('.quiz-card');
    
    if (cards.length === 0) {
        console.warn('No quiz cards found in container');
        return;
    }

    // Randomize question order
    const cardArray = Array.from(cards);
    randomizeQuizQuestions(cardArray, container);

    // Quiz state
    const quizState = {
        currentQuestion: 0,
        totalQuestions: cards.length,
        answers: {},
        isExam: container.closest('.exam-content') !== null,
        originalOrder: cardArray.map(card => parseInt(card.dataset.question, 10))
    };

    // Store state on container for access
    container.quizState = quizState;

    // Initialize UI
    updateQuizUI(container, quizState);
    setupQuizNavigation(container, quizState);
    setupQuizInteractions(container, quizState);

    // Initialized quiz/exam
    // Questions randomized
}

/**
 * Randomizes the order of quiz questions using Fisher-Yates shuffle.
 * @param {Array<HTMLElement>} cardArray - An array of quiz card elements.
 * @param {HTMLElement} container - The quiz container element.
 */
function randomizeQuizQuestions(cardArray, container) {
    for (let i = cardArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]];
    }

    cardArray.forEach((card, index) => {
        const questionText = card.querySelector('.question p');
        if (questionText) {
            const text = questionText.textContent;
            questionText.textContent = text.replace(/^\d+\./, `${index + 1}.`);
        }
        container.insertBefore(card, container.querySelector('.quiz-navigation'));
    });
}

/**
 * Updates the UI of the quiz based on the current state.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 */
function updateQuizUI(container, state) {
    const cards = container.querySelectorAll('.quiz-card');
    const navigation = container.querySelector('.quiz-navigation');

    cards.forEach(card => card.classList.remove('active-card'));
    
    if (cards[state.currentQuestion]) {
        cards[state.currentQuestion].classList.add('active-card');
    }

    const prevBtn = navigation?.querySelector('#prev-question, [data-action="prev"]');
    const nextBtn = navigation?.querySelector('#next-question, [data-action="next"]');
    const submitBtn = navigation?.querySelector('#submit-quiz, [data-action="submit"]');

    if (prevBtn) {
        prevBtn.style.display = state.currentQuestion > 0 ? 'inline-block' : 'none';
    }

    if (nextBtn) {
        nextBtn.style.display = state.currentQuestion < state.totalQuestions - 1 ? 'inline-block' : 'none';
    }

    if (submitBtn) {
        submitBtn.style.display = state.currentQuestion === state.totalQuestions - 1 ? 'inline-block' : 'none';
    }

    const progressElement = navigation?.querySelector('.quiz-progress');
    if (progressElement) {
        progressElement.textContent = `Question ${state.currentQuestion + 1} of ${state.totalQuestions}`;
    } else if (navigation) {
        const progress = document.createElement('div');
        progress.className = 'quiz-progress';
        progress.textContent = `Question ${state.currentQuestion + 1} of ${state.totalQuestions}`;
        navigation.appendChild(progress);
    }
}

/**
 * Sets up navigation event listeners for the quiz.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 */
function setupQuizNavigation(container, state) {
    const navigation = container.querySelector('.quiz-navigation');
    if (!navigation) return;

    const newNavigation = navigation.cloneNode(true);
    navigation.parentNode.replaceChild(newNavigation, navigation);

    newNavigation.addEventListener('click', (e) => {
        const action = e.target.id || e.target.getAttribute('data-action');
        
        switch (action) {
            case 'prev-question':
            case 'prev':
                if (state.currentQuestion > 0) {
                    state.currentQuestion--;
                    updateQuizUI(container, state);
                }
                break;
            
            case 'next-question':
            case 'next':
                if (state.currentQuestion < state.totalQuestions - 1) {
                    state.currentQuestion++;
                    updateQuizUI(container, state);
                }
                break;
            
            case 'submit-quiz':
            case 'submit':
                submitQuiz(container, state);
                break;

            case 'try-again':
            case 'restart':
                restartQuiz(container, state);
                break;
        }
    });
}

/**
 * Sets up interaction event listeners for quiz options.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 */
function setupQuizInteractions(container, state) {
    const cards = container.querySelectorAll('.quiz-card');
    
    cards.forEach((card, questionIndex) => {
        const questionNumber = questionIndex + 1;
        const options = card.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        
        options.forEach(option => {
            option.addEventListener('change', () => {
                handleAnswerSelection(container, state, questionNumber, option);
            });

            const li = option.closest('li');
            if (li) {
                li.addEventListener('click', () => {
                    if (!option.checked) {
                        option.checked = true;
                        option.dispatchEvent(new Event('change'));
                    }
                });
            }
        });
    });
}

/**
 * Handles the selection of an answer option.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 * @param {number} questionNumber - The number of the question being answered.
 * @param {HTMLElement} selectedOption - The selected input element.
 */
function handleAnswerSelection(container, state, questionNumber, selectedOption) {
    const isMultipleChoice = selectedOption.type === 'checkbox';

    if (isMultipleChoice) {
        if (!state.answers[questionNumber]) {
            state.answers[questionNumber] = [];
        }
        
        if (selectedOption.checked) {
            if (!state.answers[questionNumber].includes(selectedOption.value)) {
                state.answers[questionNumber].push(selectedOption.value);
            }
        } else {
            state.answers[questionNumber] = state.answers[questionNumber].filter(
                answer => answer !== selectedOption.value
            );
        }
    } else {
        state.answers[questionNumber] = selectedOption.value;
    }

    const card = container.querySelectorAll('.quiz-card')[questionNumber - 1];
    const allOptions = card.querySelectorAll('.options li');
    allOptions.forEach(li => li.classList.remove('selected'));
    
    const selectedLi = selectedOption.closest('li');
    if (selectedLi && selectedOption.checked) {
        selectedLi.classList.add('selected');
    }

    // Question answered
}

/**
 * Submits the quiz and displays results.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 */
function submitQuiz(container, state) {
    const results = calculateQuizResults(container, state);
    displayQuizResults(container, state, results);
}

/**
 * Calculates the quiz results.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 * @returns {object} The quiz results.
 */
function calculateQuizResults(container, state) {
    const cards = container.querySelectorAll('.quiz-card');
    const results = {
        totalQuestions: state.totalQuestions,
        answeredQuestions: Object.keys(state.answers).length,
        correctAnswers: 0,
        percentage: 0,
        passed: false,
        details: []
    };

    cards.forEach((card, index) => {
        const questionNumber = index + 1;
        const answerElement = card.querySelector('.answer');
        const correctAnswer = answerElement?.getAttribute('data-correct');
        const userAnswer = state.answers[questionNumber];

        if (!correctAnswer) {
            console.warn(`No correct answer found for question ${questionNumber}`);
            return;
        }

        let isCorrect = false;
        
        if (correctAnswer.includes(',')) {
            const correctAnswers = correctAnswer.split(',').map(a => a.trim()).sort();
            const userAnswers = (Array.isArray(userAnswer) ? userAnswer : []).sort();
            isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
        } else {
            isCorrect = correctAnswer === userAnswer;
        }

        if (isCorrect) {
            results.correctAnswers++;
        }

        results.details.push({
            question: questionNumber,
            correct: correctAnswer,
            user: userAnswer,
            isCorrect
        });
    });

    results.percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
    
    const passThreshold = state.isExam ? 70 : 80;
    results.passed = results.percentage >= passThreshold;
    results.passThreshold = passThreshold;

    return results;
}

/**
 * Displays the quiz results in the UI.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 * @param {object} results - The quiz results to display.
 */
function displayQuizResults(container, state, results) {
    const resultsContainer = container.querySelector('.quiz-results-container');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    const cards = container.querySelectorAll('.quiz-card');
    const navigation = container.querySelector('.quiz-navigation');
    
    cards.forEach(card => card.style.display = 'none');
    if (navigation) navigation.style.display = 'none';

    resultsContainer.innerHTML = `
        <div class="quiz-score ${results.passed ? 'pass' : 'fail'}">
            ${results.percentage}%
        </div>
        <div class="quiz-feedback">
            <h3>${results.passed ? '🎉 Congratulations!' : '📚 Keep Studying!'}</h3>
            <p>You answered ${results.correctAnswers} out of ${results.totalQuestions} questions correctly.</p>
            <p>${results.passed ? 
                `Great job! You've passed with ${results.percentage}% (required: ${results.passThreshold}%).` :
                `You need ${results.passThreshold}% to pass. Review the material and try again.`
            }</p>
        </div>
        <div class="quiz-actions">
            <button class="btn btn-outline-primary" data-action="try-again">Try Again</button>
            <button class="btn btn-primary" onclick="app.navigate(1)">Continue Learning</button>
        </div>
    `;

    resultsContainer.classList.add('show');

    const tryAgainBtn = resultsContainer.querySelector('[data-action="try-again"]');
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            restartQuiz(container, state);
        });
    }

    // Quiz/Exam completed
}

/**
 * Restarts the quiz, resetting its state and UI.
 * @param {HTMLElement} container - The quiz container element.
 * @param {object} state - The current quiz state.
 */
function restartQuiz(container, state) {
    state.currentQuestion = 0;
    state.answers = {};

    const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    inputs.forEach(input => {
        input.checked = false;
    });

    const selectedOptions = container.querySelectorAll('.options li.selected');
    selectedOptions.forEach(option => option.classList.remove('selected'));

    const cards = container.querySelectorAll('.quiz-card');
    const navigation = container.querySelector('.quiz-navigation');
    const resultsContainer = container.querySelector('.quiz-results-container');

    cards.forEach(card => {
        card.style.display = '';
    });
    
    if (navigation) {
        navigation.style.display = '';
    }
    
    resultsContainer.classList.remove('show');

    updateQuizUI(container, state);

    // Quiz/Exam restarted
}
