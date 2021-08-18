var selectedAnswer = [];
var arrayPoints = [];
var timeStamp = new Date();
const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
var points = 0;
var game = {
  state: {
    startButton: $("#start-button"),
    credentialsButton: $("#start-quiz"),
    viewLeaderBoard: $("#leaderboard"),
    viewAnswer: $("#viewanswer"),
    gameContainer: $("#game"),
    previewContainer: $(".preview-wrapper"),
    remainingQuestions: $(".remaining-questions"),
    playAgain: $(".play-again"),
    scoreNumber: $(".score-number"),
    questionsView: $(".questions"),
    gameEndView: $("#game-end"),
    gameEndViewTimesUp: $("#game-end-times-up"),
    gameEndText: $("#game-end-text"),
    gameFinishedTime: $("#yourTime"),
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
    ranking: 0,
    peoplePlayed: 0,
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

      function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
        return re.test(email);
      }

      $(".form-control").keyup(function(){
        if($("#fullname").val().length != 0 && validateEmail($("#emailaddress").val()) == true){
          $("#game-rules").collapse("show");
          // $("#user-info-wrapper").collapse("hide");
          $("#start-button").attr('disabled', false).removeClass("disabled");
        } else {
          $("#game-rules").collapse("hide");
          $("#start-button").attr('disabled', true).addClass("disabled");
        }
        // if($("#fullname").val().length != 0 && $("#emailaddress").val().length != 0){
        //   $("#start-button").attr('disabled', false).removeClass("disabled");
        // } else {
        //   $("#start-button").attr('disabled', true).addClass("disabled");
        // }
      });
    });
    game.state.credentialsButton.on("click touch", function(e) {
      e.preventDefault();      
      $(".text-1").css('display', 'none');
    });
    game.state.startButton.on("click touch", function(e) {
      e.preventDefault();      
      $(this).attr('disabled', true).addClass("disabled");
      $("#user-info-wrapper").collapse("hide");
      game.start();
    });
    game.state.viewAnswer.on("click touch", function(e) {
      e.preventDefault();      
      game.viewSelectedAnswer(selectedAnswer);
    });
    game.state.viewLeaderBoard.on("click touch", function(e) {
      e.preventDefault();
      game.processData();
      $('#leaderboardModal').modal('show');
      // game.leaderboard(JSON.parse(localStorage.getItem("data")));      
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
      game.startTimer(),
      setTimeout(function(){ $("#welcome-div").css("display","none"); }, 1000)      
    );
    
    game.state.remainingQuestions.text("0/"+game.state.numberOfQuestions);
    game.state.startButton.unbind("click touch");
  },

  startTimer: function() {
    var zeroFill = function(units) {
      return units < 10 ? "0" + units + "" : units;
    };
    var count = 0;

    var interval = window.setInterval(function() {
      var mins15 = 90000;
      var mins5 = 30000;
      var centisecondsRemaining = 30000 - count;
      var min = Math.floor(centisecondsRemaining / 100 / 60);
      var sec = zeroFill(Math.floor(centisecondsRemaining / 100 % 60));
      var cs = zeroFill(centisecondsRemaining % 100);
      game.state.timer.text(min + ":" + sec + ":" + cs);      
      count++;
      if (centisecondsRemaining === 0) {
        clearInterval(interval);
        game.timesUp();
      }
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {
        clearInterval(interval);
      }
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {
        clearInterval(interval);
      }      
      game.state.timePoints = min * 60 + sec;
    }, 10);    
  },

  checkAnswer: function(answer) {
    if (answer.data("correct")) {
      game.state.correctAnswers++;
      // game.drawGaugeValue();
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
      game.drawGaugeValue();
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {        
        game.processData();
        game.endGame();        
      } else {        
        game.goToNextQuestion();        
      }
    }, 1000);

    var data = selectedAnswer.push(answer.data().i);
  },

  processData: function(){    
    // if("data" in localStorage){
    //   var playerRanking = JSON.parse(localStorage.getItem("data"));
    //   playerRanking.sort(function(a,b){ return b.score - a.score; });
    //   playerRanking.forEach(function(player, i, arr) {
    //     player.rank = i === 0 || player.score != arr[i-1].score
    //                 ? i + 1
    //                 : arr[i-1].rank;
    //   });
    //   localStorage.removeItem("rankingData");
    //   localStorage.setItem("rankingData", JSON.stringify(playerRanking));
    //   game.leaderboard(JSON.parse(localStorage.getItem("rankingData")));
    // } 
    let playersScore;
    let playersData;
    $.ajax({
      url: "https://r4nkt.com/api/v1/games/XGQVPL3469/leaderboards/nexusleaderboard/rankings",
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
        xhr.setRequestHeader("Accept", "application/json");
      },
      success: function (data) {    
        playersScore = data;  
        check1stRequest = 1;
        $.ajax({
          url: "https://r4nkt.com/api/v1/games/XGQVPL3469/players",
          method: "GET",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
            xhr.setRequestHeader("Accept", "application/json");
          },
          success: function (data) {    
            playersData = data;    
            check2ndRequest = 1;

            let result = playersData.data.map(item => {
              let result = playersScore.data.find(item2 => item2.custom_player_id === item.custom_id)
              return [item, result]
            });
            game.leaderboard(result);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
          }
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });      
  },

  leaderboard: function(data){    
    console.log("this data", data);
    function tbody(ranking, name, points){
      var tbodyData = '<tr>'+
                      '<th scope="row">'+ranking+'</th>'+
                      '<td>'+name+'</td>'+
                      '<td>'+points+'</td>'+
                      '</tr>';
      return tbodyData;
    }     

    // $(".leaderboard-tbody").html("");
    var dataTable = $('#leaderboard-table').DataTable();
    for (var i = 0, len = data.length; i < len; i++) {
      dataTable.row.add([Math.abs(data[i][1].rank)+1, data[i][0].custom_data.name, data[i][1].score]);
      // var dataTable = tbody(Math.abs(data[i][1].rank)+1, data[i][0].custom_data.name, data[i][1].score);
      // $(".leaderboard-tbody").append(appendData);
    } 
    dataTable.draw();    
  },

  drawGaugeValue: function() {
    // var currentValue =
    //   100 /
    //   (game.state.numberOfQuestions / (game.state.correctAnswers - 1)) /
    //   100;
    var currentValue =
      100 /
      (game.state.numberOfQuestions / (game.state.questionsAnswered - 1)) /
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
            game.state.scoreNumber.text(Math.ceil(now * 100) +"%");
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
    $(".preview-wrapper").html('');
    $(".question").clone().appendTo(".preview-wrapper").removeAttr('style').css({"display":"block"});
    $(".answers").css({"display":"inline-flex"});
    $('#viewanswerModal').modal('show');
  },

  goToNextQuestion: function() {
    var lastQuestionIndex = game.state.questionsAnswered - 1;
    var nextQuestionIndex = game.state.questionsAnswered;
    var i = 1;
    var d = i += 1;
    game.state.remainingQuestions.text(game.state.questionsAnswered+"/"+game.state.numberOfQuestions);
    $(game.state.questions[lastQuestionIndex]).fadeOut(400, function() {
      $(game.state.questions[nextQuestionIndex]).fadeIn(200);
    });
  },

  timesUp: function() {
    var endText =
      "Looks like you’ve run out of time.";
    game.state.questionsView.fadeOut(400, function() {
      game.state.timeOutText[0].innerHTML = endText;
      game.state.gameEndViewTimesUp.fadeIn(200);
    });
  },

  endGame: function() {  
    var id = md5(game.state.email.val());
    var mData = [];
    var sData = [];
    var calculateTimeScore = game.state.timePoints * 10;
    var finalScore = game.state.score + calculateTimeScore; 
    var finishedTime = 'Your Time '+ game.state.timer.text();
    var endText =
      uppercaseWords(game.state.fullname.val())+', you answered <span class="score">'+game.state.correctAnswers+' of '+game.state.numberOfQuestions+"</span> questions correctly."+
      "<br> You have earned <span class='score'>"+finalScore+"</span> points.";

      game.state.questionsView.fadeOut(400, function() {
      game.state.gameEndText[0].innerHTML = endText;  
      game.state.gameFinishedTime[0].innerHTML = finishedTime;
      game.state.gameEndView.fadeIn(200);
      game.state.remainingQuestions.text(game.state.questionsAnswered+"/"+game.state.numberOfQuestions);

      $(".time-group").fadeOut(1000).remove();
    });
    
    let $data =
    [
      {
        id: md5(game.state.email.val()),
        timeStamp: timeStamp.toUTCString(),
        name: uppercaseWords(game.state.fullname.val()),
        email: game.state.email.val(),
        totalCorrectAnswer: game.state.correctAnswers,
        totalQuestion: game.state.numberOfQuestions,
        score: finalScore,
        timeFinish: game.state.timer.text()
      }
    ];

    let customData = {
        name: uppercaseWords(game.state.fullname.val()),
        email: game.state.email.val(),
        totalCorrectAnswer: game.state.correctAnswers,
        totalQuestion: game.state.numberOfQuestions,
        score: finalScore,
        timeFinish: game.state.timer.text(),
        timeStamp: timeStamp.toUTCString()
    };

    let playersData = {
      custom_id: md5(game.state.email.val()),
      name: uppercaseWords(game.state.fullname.val()),        
      custom_data: JSON.stringify(customData)
    };

    let playersScore = {
      custom_leaderboard_id: "nexusleaderboard",
      custom_player_id: md5(game.state.email.val()),
      score: finalScore
    };

    var jsonData;
    if("data" in localStorage){
      let currentData = JSON.parse(localStorage.getItem("data"));
      mData = currentData.concat($data);
      jsonData = localStorage.setItem("data", JSON.stringify(mData));
    } else {
      jsonData = localStorage.setItem("data", JSON.stringify($data));
    }  

    $.ajax({
      url: "https://r4nkt.com/api/v1/games/XGQVPL3469/players",
      method: "POST",
      data: JSON.stringify(playersData),
      contentType: "application/json",
      cache: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
        xhr.setRequestHeader("Accept", "application/json");
      },
      success: function (data) {
        console.log(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {}
    }); 

    $.ajax({
      url: "https://r4nkt.com/api/v1/games/XGQVPL3469/scores",
      method: "POST",
      data: JSON.stringify(playersScore),
      contentType: "application/json",
      cache: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
        xhr.setRequestHeader("Accept", "application/json");
      },
      success: function (data) {
        console.log(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
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
