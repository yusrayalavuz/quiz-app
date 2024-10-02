const apiUrl = 'https://jsonplaceholder.typicode.com/posts';
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let timerInterval;

async function fetchQuestions() {
    const response = await fetch(apiUrl);
    const data = await response.json();


    const randomQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 10);


    questions = randomQuestions.map((item) => {
        const { correctAnswer, options } = getOptions(item);
        return {
            question: item.title,
            correctAnswer: correctAnswer,
            options: options
        };
    });

    console.log(questions);
}

function getOptions(item) {
    const bodyParts = item.body.split('\n');
    const correctAnswer = bodyParts[0];


    const options = [...bodyParts];


    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
        correctAnswer: correctAnswer,
        options: shuffledOptions
    };
}

function showQuizGuide() {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('quiz-guide').style.display = 'block';
}

function startQuiz() {
    document.getElementById('quiz-guide').style.display = 'none';
    fetchQuestions().then(() => {
        document.getElementById('quiz-container').style.display = 'block';
        showQuestion();
    });
}

function selectAnswer(selectedOption) {
    selectedAnswers[currentQuestionIndex] = selectedOption;
    clearInterval(timerInterval);
    disableOptions();

    const currentQuestion = questions[currentQuestionIndex];
    const options = document.getElementById('options');
    const buttons = options.getElementsByTagName('button');


    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (button.innerText === currentQuestion.correctAnswer) {
            button.classList.add('correct');
        } else if (button.innerText === selectedOption) {
            button.classList.add('incorrect');
        } else {
            button.classList.remove('correct', 'incorrect');
        }
    }


    const nextButton = document.getElementById('next');
    nextButton.disabled = false;
}


function exitQuiz() {

    document.getElementById('quiz-guide').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';


    document.getElementById('start-container').style.display = 'block';
}


function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const timerElement = document.getElementById('time');
    const nextButton = document.getElementById('next');
    const questionCountElement = document.getElementById('question-count');


    questionCountElement.innerText = `Soru ${currentQuestionIndex + 1} / ${questions.length}`;


    questionElement.innerText = currentQuestion.question;
    optionsElement.innerHTML = '';

    currentQuestion.options.forEach((option) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.onclick = () => selectAnswer(option);
        button.classList.add('btn-primary');
        button.disabled = true;
        optionsElement.appendChild(button);
    });

    nextButton.disabled = true;

    let timeLeft = 30;
    timerElement.innerText = `${timeLeft}`;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerText = `${timeLeft}`;

        if (timeLeft === 20) {

            enableOptions();
        }

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            selectAnswer(null);
            nextButton.disabled = false;
            disableOptions();

            setTimeout(() => {
                nextQuestion();
            }, 1000);
        }
    }, 1000);
}

function enableOptions() {
    const options = document.getElementById('options');
    const buttons = options.getElementsByTagName('button');
    for (const button of buttons) {
        button.disabled = false;
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    const nextButton = document.getElementById('next');

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        nextButton.innerText = "Bitir";
        nextButton.onclick = showResult;
        nextButton.disabled = false;
    }
}


function disableOptions() {
    const options = document.getElementById('options');
    const buttons = options.getElementsByTagName('button');
    for (const button of buttons) {
        button.disabled = true;
    }
}


function showResult() {
    clearInterval(timerInterval);
    document.getElementById('quiz-container').style.display = 'none';
    const resultContainer = document.getElementById('result');
    resultContainer.style.display = 'block';

    const resultTable = document.createElement('table');
    resultTable.innerHTML = '<tr><th>Soru</th><th>Seçim</th><th>Sonuç</th></tr>';

    let correctCount = 0;

    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        const userAnswer = selectedAnswers[index];


        if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
            row.classList.add('empty-answer');
            row.innerHTML = `<td>${q.question}</td><td>Cevap verilmedi</td><td>Boş</td>`;
        } else {
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) {
                correctCount++;
                row.classList.add('correct-answer');
                row.innerHTML = `<td>${q.question}</td><td>${userAnswer}</td><td>Doğru</td>`;
            } else {
                row.classList.add('wrong-answer');
                row.innerHTML = `<td>${q.question}</td><td>${userAnswer}</td><td>Yanlış</td>`;
            }
        }

        resultTable.appendChild(row);
    });

    const totalScore = document.createElement('div');
    totalScore.innerText = `Toplam Doğru: ${correctCount} / ${questions.length}`;
    totalScore.classList.add('total-score');
    resultContainer.appendChild(totalScore);
    resultContainer.appendChild(resultTable);


    const message = document.createElement('div');
    if (correctCount > 7) {
        message.innerText = "Tebrikler! Harika bir iş çıkardınız!";
        message.classList.add('result-message', 'green');
    } else if (correctCount >= 4) {
        message.innerText = "İyi bir sonuç! Daha fazla pratik yapabilirsiniz.";
        message.classList.add('result-message', 'orange');
    } else {
        message.innerText = "Üzgünüm, daha fazla çalışmalısınız.";
        message.classList.add('result-message', 'red');
    }
    resultContainer.appendChild(message);
}
