'use strict';
/* global $ */
$(document).ready(function(){
  fetchCategory();
  fetchSessionToken();
  render();
  //retrieveAPIData()
  handleStartQuiz();
  handleEvaluateAnswer();
  continueFromResult ();
  retakeQuiz();
});

//API generating URLs
const baseURL = 'https://opentdb.com';
const questionPath = '/api.php';
const tokenRequest = '/api_token.php?command=request';
  
// In-memory database of questions
const QUESTIONS = [
  {question: 'What is the character\'s name in Metroid?',
    answers: ['Justin Bailey', 'Samus Aran', 'Langden Olger', 'Mother Brain'],
    correctAnswer: 'Samus Aran'
  },
  {question: 'Which Triforce did Zelda posess?',
    answers: ['Wisdom', 'Power', 'Speed', 'Heart'],
    correctAnswer: 'Wisdom'
  },
  {question: 'Who do you fight before Mike Tyson in Mike Tyson\'s Punch Out?',
    answers: ['Sand Man', 'Soda Popinski', 'King Hippo', 'Super Macho Man'],
    correctAnswer: 'Super Macho Man'
  },
  {question: 'What year did Dr. Light create Mega Man?',
    answers: ['200Y', '200X', '200Z', '200M'],
    correctAnswer: '200X'
  },
  {question: 'What level do you reach after level 99 in Duck Hunt?',
    answers: [98, 0, 1, 100],
    correctAnswer: 0
  }
];

//store state at 1st question
let STORE = {       
  questions: QUESTIONS,
  currentIndex: null,
  answers: [],
  totalCorrect: 0
};

let CATEGORY = [];

function render(){
  //shows start page
  if (STORE.currentIndex === null){
    $('.start').removeClass('hidden');
    $('.choose-options').removeClass('hidden');
    $('.question-page').addClass('hidden');
    $('.question-result-page').addClass('hidden');
    $('.final-result-page').addClass('hidden');
  //shows question pages
  } else if (STORE.currentIndex < 5 && (STORE.answers.length-1) !== STORE.currentIndex) {
    $('.start').addClass('hidden');
    $('.question-page').removeClass('hidden');
    $('.question-result-page').addClass('hidden');
    $('.final-result-page').addClass('hidden');
  }
  else if (STORE.currentIndex < 5 && (STORE.answers.length-1) === STORE.currentIndex) {
    $('.start').addClass('hidden');
    $('.question-page').addClass('hidden');
    $('.question-result-page').removeClass('hidden');
    $('.final-result-page').addClass('hidden');
  //shows final result page
  } else {
    $('.start').addClass('hidden');
    $('.question-page').addClass('hidden');
    $('.question-result-page').addClass('hidden');
    $('.final-result-page').removeClass('hidden');
  }
}

// Template generators
// displays question for current page 
function template() { 
  
  const possibleAnswers = QUESTIONS[STORE.currentIndex].answers.map(function(val, index){
    return `
      <div><input type='radio' name='answer' value='${val}' data-index-attr='${index}' required />
        <span class='possible-answers'>
         ${val}
        </span>
      </div>
    `;
  }).join('');
  return `
      <div class="question-container">
        <h1 class="question-title">${QUESTIONS[STORE.currentIndex].question}</h1>
        <form id="answer-options">
          ${possibleAnswers}
          <div><input type="submit" value="Next"></div>
          
          <div>
          <p>Current Score:${STORE.totalCorrect} / ${QUESTIONS.length}</p>
          <p>Question:${STORE.currentIndex+1} / ${QUESTIONS.length}</p> 
      </div>
      </form>
    </div>`; 
}

//generates html template for results page
function resultTemplate(){
  if (STORE.answers[STORE.answers.length-1] === QUESTIONS[STORE.currentIndex].correctAnswer) {
    return `
      <div>
        <h1>Congratulations!</h1>
        <div class="message">
           You got it right!
         <div>
         <button type="submit" class="next continue">Continue</button>
      </div>
  `;
  }
  else {
    return `
      <div>
        <h1>Sorry, that's incorrect!</h1>
        <div class="message">
        The correct answer was ${QUESTIONS[STORE.currentIndex].correctAnswer}
        <div>
        <button type="submit" class="next continue">Continue</button>
      </div>
    `;
  }
} 

//displays final result page with score 
function finalResultTempalte(){
  return `
    <h1>You scored ${STORE.totalCorrect} / ${QUESTIONS.length}</h1>
    <div class="image">
      <img src="" alt="alt image text  DONT FORGET to update">
    </div>
    <div>
      <button type="submit" class="next retake-quiz" >Retake Quiz</button>
    </div>`;
}

//resets STORE so restart quiz button works
function resetStore(){
  Object.assign(STORE,({currentIndex:null, answers:[], totalCorrect: 0} ));
}

//restarts quizk and calls resetStore to clear previous answers
function retakeQuiz (){
  $('.final-result-page').on('click', '.retake-quiz', function(e){
    e.preventDefault();
    resetStore();
    render();
  });
}

//function to proceed after viewing correct/incorrect result
function continueFromResult (){
  $('.question-result-page').on('click', '.continue', function(){
    nextQuestion();
    ///if at end, call finalresult tempalte
    if (STORE.currentIndex < 5){
      generateNextQuestion();
      render();
    } else {
      generateFinalResult();
      render();
    }
  });
}

//runs render at null state index (start page)
function handleStartQuiz() {
  $('#start-button').on('click', function(){
    //e.preventDefault();
    STORE.currentIndex=STORE.currentIndex++;
    render();
    generateNextQuestion();
  });
}

//generates html template for question
function generateNextQuestion(){ 
  $('.question-page').html(template());
}

//increments and goes to next question index
function nextQuestion(){
  currentScore();
  STORE.currentIndex++;
}

//checks if answer is correct and saves it to STORE
function handleEvaluateAnswer() {
  $('.question-page').on('submit', '#answer-options', function(event){
    event.preventDefault();
    STORE.answers.push($('input[name="answer"]:checked').val());
    generateResult();
    render();
  });
}

//displays correct/incorrect answer and shows correct answer
function generateResult(){
  $('.question-result-page').html(resultTemplate());
}

function currentScore(){
  if (STORE.answers[STORE.answers.length-1] === QUESTIONS[STORE.currentIndex].correctAnswer) {
    STORE.totalCorrect++;
  }
}

//generates html on results page with total score
function generateFinalResult(){ 
  $('.final-result-page').html(finalResultTempalte());
}

 
//retreives categori array from API
function fetchCategory() {
  $.getJSON('https://opentdb.com/api_category.php', function(data) {
    CATEGORY.push(fetchCategory().trivia_categories);
  //console.log(data);  
  });
}
//fetch new session token
function fetchSessionToken (){
  $.getJSON(baseURL+tokenRequest, function(data) {
  });
}


//function to break URL down for easier calling

    
