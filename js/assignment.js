var targetScore = -1;
var leader = -1;
var score = -1;

function showVariables() {
  variables = {
    condition: condition,
    score: score,
    targetScore: targetScore,
    userScores: allScores,
    leader: leader,
    highscore: highscore,
    lastScore: lastScore,
    round: round,
    user_id: user_id
  }

  alert("variables: " + JSON.stringify(variables));
}

// feedback routing
function assignment () {
  showVariables();

  switch(condition) {

  // max - leader
    case 0:
      conditions.comparison.leader();
      userCondition = conditions.nonSkewed;
      break;
    case 1:
      //conditions.fix();
      conditions.comparison.leader();
      userCondition = conditions.skewed;
      break;
    case 2:
      conditions.comparison.leader();
      userCondition = conditions.nonSkewed;
      leaderBarName = 'Similar player';
      document.getElementById("target-txt").textContent = "Highest score among similar players:";
      break;
    // case 3:
    //   conditions.comparison.leader();
    //   userCondition = conditions.nonSkewed;
    //   document.getElementById("target-txt").textContent = "It took the leader 2 rounds to accomplish this score.";
    //   break;

    // highs
    case 3:
      conditions.comparison.high();
      userCondition = conditions.nonSkewed;
      break;
    case 4:
      conditions.comparison.high();
      userCondition = conditions.skewed;
      break;
    case 5:
      conditions.comparison.high();
      userCondition = conditions.nonSkewed;
      leaderBarName = 'Similar player';
      document.getElementById("target-txt").textContent = "Highest score among similar players:";
      break;
    // case 7:
    //   conditions.comparison.high();
    //   userCondition = conditions.nonSkewed;
    //   document.getElementById("target-txt").textContent = "It took the leader 6 rounds to accomplish this score.";
    //   break;

    // median
    case 6:
      conditions.comparison.median();
      userCondition = conditions.nonSkewed;
      break;
    case 7:
      conditions.comparison.median();
      userCondition = conditions.skewed;
      break;
    case 8:
      conditions.comparison.median();
      userCondition = conditions.nonSkewed;
      leaderBarName = 'Similar player';
      document.getElementById("target-txt").textContent = "Highest score among similar players";
      break;
    // case 11:
    //   conditions.comparison.median();
    //   userCondition = conditions.nonSkewed;
    //   document.getElementById("target-txt").textContent = "It took the leader 10 rounds to accomplish this score.";
    //   break;
  }
}
