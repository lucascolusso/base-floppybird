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
    user_id: user_id
  }

  alert("variables: " + JSON.stringify(variables));
}

// social comparison feedback routing
function assignment () {
  //showVariables();
  switch(condition) {
    case 0:
      conditions.comparison.leader();
      userCondition = conditions.nonSkewed;
      break;
    case 1:
      conditions.comparison.leader();
      userCondition = conditions.skewed;
      break;
    case 2:
      conditions.comparison.similar();
      userCondition = conditions.nonSkewed;
      break;
    case 3:
      conditions.comparison.leader();
      userCondition = conditions.nonSkewed;
      document.getElementById("target-txt").textContent = "It took the leader XX rounds to score this.";
      break;
    case 4:
      conditions.comparison.similar();
      userCondition = conditions.nonSkewed;
      document.getElementById("target-txt").textContent = "It took this similar player XX rounds to score this.";
      break;
  }
}
