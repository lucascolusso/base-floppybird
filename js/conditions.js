var targetscore = -1;

//comparisonscores
var xp1 = 1;
var xp2 = 19;
var xp3 = 127;
var xp4 = 51;
var xp5 = 49;
var leader = xp3;
var userFeedback = '';
var userCondition = function() {};
var leaderBarColor = '#D1D1D1';
var userBarColor = '#7cb5ec';
var showHistoryFeedback = true;

var conditions;
conditions = {
  notSkewed: function() {
    $('#feedback-chart').highcharts({
      chart: { type: 'column' },
      title: { text: userFeedback },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { type: 'category' },
      yAxis: {
        title: { text: 'Score' },
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        labels: { enabled: false }
      },
      series: [{ 
        name: 'Score',
        colorByPoint: true,
        data: [
          { name: 'You', color: userBarColor, y: score }, 
          { name: 'Leader', color: leaderBarColor, y: targetScore }
        ],
        dataLabels: { enabled: true, style: { fontSize: '13px' } }
      }]
    });
  },
  skewed: function() {
    $('#feedback-chart').highcharts({
      chart: { type: 'column' },
      title: { text: userFeedback },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { categories: ['You', 'Leader'] },
      yAxis: { min: 0, title: { text: 'Score' }, labels: { overflow: 'justify' } },
      series: [{ 
        name: 'Score', colorByPoint: true,
        data: [
        {
          name: score.toString(), color: userBarColor, y: (targetScore/2) + score, 
          dataLabels: {
            enabled: true, style: { fontSize: '13px' },
            formatter: function() { return score; }
          }
        }, 
        {
          name: targetScore, color: leaderBarColor, y: targetScore,
          dataLabels: {
            enabled: true, style: { fontSize: '13px' },
            formatter: function() { return targetScore; }
          }
        }],
        tooltip: { headerFormat: '{series.name}: <b>{point.key}</b>', pointFormat: '' }
      }]
    });
  },
  history: function() {
    if(showHistoryFeedback) {
      userFeedback = 'These are the scores of your last 5 rounds!';
    }
    last5 = userScores.getLast(5);
    chartBars = [];
    for (var i = last5.length-1; i >= 0; i--) {
      chartBars.push({ name: 'You', color: userBarColor, y: last5[i] });
    }
    chartBars.push({ name: 'Leader', color: leaderBarColor, y: targetScore });
    $('#feedback-chart').highcharts({
      chart: { type: 'column' },
      title: { text: userFeedback },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { type: 'category' },
      yAxis: { min: 0, title: { text: 'Score' }, labels: { overflow: 'justify' } },
      series: [{ 
        name: 'Score',
        colorByPoint: true,
        data: chartBars,
        dataLabels: { enabled: true, style: { fontSize: '13px' } }
      }]
    });
  },
  comparison: {
    similar: function() {
      if(experience == 1) {
        targetScore = xp1;
      } else if(experience == 2) {
        targetScore = xp2;
      } else if(experience == 3) {
        targetScore = xp3;
      } else if(experience == 4) {
        targetScore = xp4;
      } else if(experience == 5) {
        targetScore = xp5;
      }
    },
    leader: function() {
      targetScore = leader;
    }
  },
  userLeader: function() {
    if(score > targetScore) {
      showHistoryFeedback = false;
      userFeedback = 'Congratulations! Now you are the Leader!';
      targetScore = score;
      leaderBarColor = userBarColor;
    }
  }
}
