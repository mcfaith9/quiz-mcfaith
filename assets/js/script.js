const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
var selectedAnswer = [];
var arrayPoints = [];
var timeStamp = new Date();
var points = 0;

var dataTable = $('#leaderboard-table').DataTable({
  paging: true,
  info: false,
  searching: false,
  ordering: true,
  destroy: true,
  pageLength : 7,
  pagingType: "full",
  "bLengthChange": false,
  "order": [[2, 'desc']],
  columns :[
    {
      data: 'rank',
      render: function function_name(row, data, index) {
        if(row == 1) {
          return "<i class='fas fa-medal' style='color:gold!important;'></i> ";
        } else if(row == 2) {
          return "<i class='fas fa-medal' style='color:silver!important;'></i> ";
        } else if(row == 3) {
          return "<i class='fas fa-medal' style='color:#CD7F32!important;'></i> ";
        }
        return row;        
      }
    }, 
    {data: 'name'},
    {data: 'score'},
  ],  
  "oLanguage": {
    "sEmptyTable": "<br><i class='fas fa-circle-notch fa-spin'></i>"
  },
  columnDefs: [
    {
      targets: ['_all'],
      className: 'mdc-data-table__cell'
    }
  ]
});

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
    game.processData();
  },

  registerEventHandlers: function() {
    game.state.answers.on("click touch", function(e) {
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
          $("#start-button").attr('disabled', false).removeClass("disabled");
        } else {
          $("#game-rules").collapse("hide");
          $("#start-button").attr('disabled', true).addClass("disabled");
        }
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
      $(this).attr('disabled', true).addClass("disabled"); 
      game.leaderboard();    
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
      game.updateProgress(true);
      game.state.score = points += 100;
    } else {
      game.updateProgress(false);
      game.state.score = points -= 100;
    }
    game.giveAnswerFeedback(answer);
    game.state.questionsAnswered++;
    window.setTimeout(function() {
      game.drawGaugeValue();
      if (game.state.questionsAnswered === game.state.numberOfQuestions) {    
        game.endGame();        
      } else {        
        game.goToNextQuestion();        
      }
    }, 1000);
    var data = selectedAnswer.push(answer.data().i);
  },

  processData: function() {    
    let playersScore;
    let playersData;
    localStorage.removeItem("dataTablesData");
    $.ajax({
      url: "https://r4nkt.com/api/v1/games/XGQVPL3469/leaderboards/nexusleaderboard/rankings",
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
        xhr.setRequestHeader("Accept", "application/json");
      },
      success: function (data) {    
        playersScore = data;  
        $.ajax({
          url: "https://r4nkt.com/api/v1/games/XGQVPL3469/players",
          method: "GET",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
            xhr.setRequestHeader("Accept", "application/json");
          },
          success: function (data) {    
            playersData = data;    
            let result = playersData.data.map(item => {
              let result = playersScore.data.find(item2 => item2.custom_player_id === item.custom_id)
              return [item, result]
            });             
            var processData = [];  
            for (var i = 0, len = result.length; i < len; i++) {  
              processData.push({
                rank: Math.abs(result[i][1].rank)+1,
                name: result[i][0].custom_data.name,
                score: result[i][1].score
              });                               
            }   
            localStorage.setItem("dataTablesData", JSON.stringify(processData));
            dataTable.clear().draw();
            dataTable.rows.add(JSON.parse(localStorage.getItem('dataTablesData'))).draw();       
            dataTable.columns.adjust().draw(); 
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
    // Do something here? idk hahaha 
  },

  leaderboard: function(data) { 
    dataTable.clear().draw();
    dataTable.rows.add(JSON.parse(localStorage.getItem('dataTablesData'))).draw();       
    dataTable.columns.adjust().draw();   
    game.state.viewLeaderBoard.attr('disabled', false).removeClass("disabled");
  },

  drawGaugeValue: function() {
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
    var _id = md5(game.state.email.val()+"_"+timeStamp);
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
      // custom_id: _id,
      name: uppercaseWords(game.state.fullname.val()),        
      custom_data: JSON.stringify(customData)
    };

    let playersScore = {
      custom_leaderboard_id: "nexusleaderboard",
      custom_player_id: _id,
      score: finalScore
    };

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
        $.ajax({
          url: "https://r4nkt.com/api/v1/games/XGQVPL3469/players/"+_id,
          method: "PUT",
          data: JSON.stringify(playersData),
          contentType: "application/json",
          cache: false,
          tryCount : 0,
          retryLimit : 3,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer w2YjdIYWWwC82Ye9VDIke5xPx643wFQ5toWbMw89");
            xhr.setRequestHeader("Accept", "application/json");
          },
          success: function (data) {},
          error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus == 'timeout') {
              this.tryCount++;
              if (this.tryCount <= this.retryLimit) {
                $.ajax(this);
                return;
              }            
              return;
            }
            console.log(textStatus);
          }
        });        
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
