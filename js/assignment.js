function showVariables() {
  variables = {
    condition: condition,
    score: score,
    targetscore: targetscore,
    userScores: allScores,
    leader: leader,
    highscore: highscore,
    lastScore: lastScore,
    round: round,
    user_id: user_id,
    experience: experience
  }

  alert("variables: " + JSON.stringify(variables));
}

// social comparison feedback routing
function assignment () {
  //showVariables();
  switch(condition) {
    case 0:
      conditions.comparison.similar();
      userCondition = conditions.notSkewed;
      break;
    case 1:
      conditions.comparison.leader();
      userCondition = conditions.notSkewed;
      break;
    case 2:
      conditions.comparison.similar();
      userCondition = conditions.skewed;
      break;
    case 3:
      conditions.comparison.leader();
      userCondition = conditions.skewed;
      break;
    case 4:
      conditions.comparison.similar();
      userCondition = conditions.history;
      break;
    case 5:
      conditions.comparison.leader();
      userCondition = conditions.history;
      break;
  }
}
