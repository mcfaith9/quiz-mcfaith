var selectedAnswer = [];
var arrayPoints = [];
var points = 0;
var game = {
  // state and jquery selectors
  state: {
    startButton: $("#start-button"),
    credentialsButton: $("#start-quiz"),
    viewLeaderBoard: $("#leaderboard"),
    viewAnswer: $("#viewanswer"),
    gameContainer: $("#game"),
    previewContainer: $(".preview-wrapper"),
    playAgain: $(".play-again"),
    scoreNumber: $(".score-number"),
    questionsView: $(".questions"),
    gameEndView: $("#game-end"),
    gameEndViewTimesUp: $("#game-end-times-up"),
    gameEndText: $("#game-end-text"),
    timeOutText: $("#time-out-text"),
    gauge: $("#gauge"),
    questions: $(".question"),
    answers: $(".answer"),
    timer: $("#timer"),
    indicators: $(".indicator"),
    numberOfQuestions: $(".question").length,
    fullname: $("#fullname"),
    email: $("#emailaddress"),
    APIToken: "w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89",
    gameID: "XGQVPL3469",
    APIEndpoint: "https://api.r4nkt.com/v1/",
    questionsAnswered: 0,
    correctAnswers: 0,
    correctPoints: 100,
    timePoints: 0,
    score: 0,
  },

  init: function() {
    game.registerEventHandlers();
  },

  registerEventHandlers: function() {
    game.state.answers.on("click touch", function(e) {
      //e.preventDefault();
      game.checkAnswer($(this));
    });
    game.state.credentialsButton.on("click touch", function(e) {
      e.preventDefault();
      $("#start-quiz").remove();
      $("#start-button").show();
      
      $(".form-control").keyup(function(){
        if($("#fullname").val().length != 0 && $("#emailaddress").val().length != 0){
          $("#start-button").attr('disabled', false).removeClass("disabled");
        } else {
          $("#start-button").attr('disabled', true).addClass("disabled");
        }
      });
    });
    game.state.startButton.on("click touch", function(e) {
      e.preventDefault();      
      $(this).attr('disabled', true).addClass("disabled");
      $("#user-info-wrapper").collapse("hide");
      game.start();
    });
    game.state.viewAnswer.on("click touch", function(e) {
      e.preventDefault();
      $(".preview-wrapper").html('');
      $(".question").clone().appendTo(".preview-wrapper").removeAttr('style').css({"display": "block"});;
      game.viewSelectedAnswer(selectedAnswer);
    });
    game.state.viewLeaderBoard.on("click touch", function(e) {
      e.preventDefault();
      game.leaderboard(JSON.parse(localStorage.getItem("data")));
    });
    game.state.playAgain.on("click touch", function(e) {
      e.preventDefault();
      window.location.reload(true);
    });
  },

  start: function() {
    game.state.gameContainer.addClass("show");
    $("html, body").animate(
      {
        scrollTop: game.state.gameContainer.offset().top - 10
      },
      400,
      game.startTimer()
    );
    game.state.startButton.unbind("click touch");
  },

  startTimer: function() {
    var zeroFill = function(units) {
      return units < 10 ? "0" + units + "" : units;
    };
    var count = 0;

    var interval = window.setInterval(function() {
      var centisecondsRemaining = 90000 - count;
      var min = Math.floor(centisecondsRemaining / 100 / 60);
      var sec = zeroFill(Math.floor(centisecondsRemaining / 100 % 60));
      var cs = zeroFill(centisecondsRemaining % 100);
      game.state.timer.text(min + ":" + sec + ":" + cs);
      game.state.timePoints = centisecondsRemaining;
      count++;
      if (centisecondsRemaining === 0) {
        clearInterval(interval);
        //game.endGame();
        game.timesUp();
      }
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {
        clearInterval(interval);
      }
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {
        clearInterval(interval);
      }      
    }, 10);
  },

  checkAnswer: function(answer) {
    if (answer.data("correct")) {
      game.state.correctAnswers++;
      game.drawGaugeValue();
      game.updateProgress(true);
      game.state.score = points += 100;
      // game.giveAnswerFeedback(answer);
    } else {
      game.updateProgress(false);
      game.state.score = points -= 100;
      // game.giveAnswerFeedback(answer);
    }
    game.giveAnswerFeedback(answer);
    game.state.questionsAnswered++;
    // wait a second
    window.setTimeout(function() {
      //end game else go to next question
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {
        game.endGame();
      } else {
        game.goToNextQuestion();
      }
    }, 1000);

    var data = selectedAnswer.push(answer.data().i);     
    game.viewSelectedAnswer(selectedAnswer);

    game.score(game.state.score);
  },

  score: function(points){
  },

  leaderboard: function(data){

    function tbody(ranking, name, points){
      var tbodyData = '<tr>'+
                      '<th scope="row">'+ranking+'</th>'+
                      '<td>'+name+'</td>'+
                      '<td>'+points+'</td>'+
                      '</tr>';
      return tbodyData;
    } 

    var playerRanking = data;
    playerRanking.sort(function(a,b){ return b.score - a.score; });
    playerRanking.forEach(function(player, i, arr) {
      player.rank = i === 0 || player.score != arr[i-1].score
                  ? i + 1
                  : arr[i-1].rank;
    });

    $(".leaderboard-tbody").html("");
    for (var i = 0, len = playerRanking.length; i < len; i++) {
      var appendData = tbody(Math.abs(playerRanking[i].rank), playerRanking[i].name, playerRanking[i].score);
      $(".leaderboard-tbody").append(appendData);
    }

    $('#leaderboardModal').modal('show'); 
        
    console.log(playerRanking);
  },

  drawGaugeValue: function() {
    var currentValue =
      100 /
      (game.state.numberOfQuestions / (game.state.correctAnswers - 1)) /
      100;
    var nextValue = currentValue + 100 / game.state.numberOfQuestions / 100;

    var draw = function(currentValue, nextValue) {
      var bg = game.state.gauge[0];
      var ctx = (ctx = bg.getContext("2d"));
      var imd = null;

      var startRad = 0.75;
      var totalRads = 1.5;

      var sAngle = Math.PI * startRad;

      ctx.beginPath();
      ctx.strokeStyle = "#47338f";
      ctx.lineCap = "round";
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 10.0;

      imd = ctx.getImageData(0, 0, 240, 240);

      $({ n: currentValue }).animate(
        { n: nextValue },
        {
          duration: 1000 * nextValue,
          step: function(now, fx) {
            game.state.scoreNumber.text(Math.ceil(now * 100));
            ctx.putImageData(imd, 0, 0);
            ctx.beginPath();
            ctx.arc(
              120,
              120,
              100,
              sAngle,
              (totalRads * now + startRad) * Math.PI,
              false
            );
            ctx.stroke();
          }
        }
      );
    };
    draw(currentValue, nextValue);
  },

  updateProgress: function(correct) {
    $(game.state.indicators[game.state.questionsAnswered]).addClass(
      correct ? "correct" : "incorrect"
    );
    $(game.state.indicators).removeClass("current");
    $(game.state.indicators[game.state.questionsAnswered + 1]).addClass(
      "current"
    );
  },

  giveAnswerFeedback: function(answer) {
    var answerGroup = answer.parent().parent().find(".answer");
    for (var i = 0; i < answerGroup.length; i++) {
      // disable extra clicks
      answerGroup[i].disabled = true;
      if ($(answerGroup[i]).data("correct")) {
        $(answerGroup[i]).parent().addClass("correct");
      } else {
        $(answerGroup[i]).parent().addClass("incorrect");
      }
    }   
  },

  viewSelectedAnswer: function(data){    
  },

  goToNextQuestion: function() {
    var lastQuestionIndex = game.state.questionsAnswered - 1;
    var nextQuestionIndex = game.state.questionsAnswered;
    $(game.state.questions[lastQuestionIndex]).fadeOut(400, function() {
      $(game.state.questions[nextQuestionIndex]).fadeIn(200);
    });
  },

  timesUp: function() {
    var endText =
      "Looks like you’ve run out of time.<br />No worries. You can play up to 5 times a day.";
    game.state.questionsView.fadeOut(400, function() {
      game.state.timeOutText[0].innerHTML = endText;
      game.state.gameEndViewTimesUp.fadeIn(200);
    });
  },

  endGame: function() {
    const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
    var endText =
      'You got<br><span class="score">' +
      game.state.correctAnswers +
      " out of " +
      game.state.numberOfQuestions +
      "</span><br> correct answer"+
      "<br>"+uppercaseWords(game.state.fullname.val())+" you earn <span class='score'>"+game.state.score+"</span> points.";

      game.state.questionsView.fadeOut(400, function() {
      game.state.gameEndText[0].innerHTML = endText;  
      game.state.gameEndView.fadeIn(200);
    });

    var timeStamp = new Date();
    var mData = [];
    var sData = [];
    let $data =
    {
      id: md5(game.state.email.val()),
      timeStamp: timeStamp.toUTCString(),
      name: uppercaseWords(game.state.fullname.val()),
      email: game.state.email.val(),
      totalCorrectAnswer: game.state.correctAnswers,
      totalQuestion: game.state.numberOfQuestions,
      score: game.state.score,
      timeFinish: game.state.timer.text(),
    };

    let currentData = JSON.parse(localStorage.getItem("data"));
    mData = currentData.concat($data);
    localStorage.setItem("data", JSON.stringify(mData));
  }
};

game.init();

var drawGaugeBackground = function() {
  var bg = $("#gauge")[0];
  var ctx = bg.getContext("2d");
  var imd = null;
  var sAngle = Math.PI * 0.75;
  var eAngle = Math.PI * 0.25;

  ctx.beginPath();
  ctx.strokeStyle = "#f4f4f4";
  ctx.lineCap = "round";
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 30.0;

  imd = ctx.getImageData(0, 0, 240, 240);

  ctx.putImageData(imd, 0, 0);
  ctx.beginPath();
  ctx.arc(120, 120, 100, sAngle, eAngle, false);
  ctx.stroke();
};

drawGaugeBackground();
