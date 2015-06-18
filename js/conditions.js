var targetScore = -1;

//comparisonscores
var median = 9;
var high = 21;
var max = 127;

var userFeedback = '';
var userCondition = function() {};
var leaderBarName = 'test'
var leaderBarColor = '#D1D1D1';
var userBarColor = '#f8704f';
var showHistoryFeedback = true;
var conditions;

conditions = {
  nonSkewed: function() {
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
          { name: leaderBarName, color: leaderBarColor, y: targetScore }
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
      xAxis: { categories: ['You', leaderBarName] },
      yAxis: { min: 0, title: { text: 'Score' }, gridLineWidth: 0, minorGridLineWidth: 0, labels: { enabled: false } },
      series: [{
        name: 'Score', colorByPoint: true,
        data: [
        {
          name: score.toString(), color: userBarColor, y: ((targetScore/2) + (score*0.5)),
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
  trend: function() {
    if(showHistoryFeedback) {
      userFeedback = 'These are the scores of your last 5 rounds.';
    }
    last5 = userScores.getLast(5);
    chartBars = [];
    for (var i = last5.length-1; i >= 0; i--) {
      chartBars.push({ name: 'You', color: userBarColor, y: last5[i] });
    }
    chartBars.push({ name: leaderBarName, color: leaderBarColor, y: targetScore });
    $('#feedback-chart').highcharts({
      chart: { type: 'column' },
      title: { text: userFeedback },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { type: 'category' },
      yAxis: { min: 0, title: { text: 'Score' }, gridLineWidth: 0, minorGridLineWidth: 0, labels: { enabled: false } },
      series: [{
        name: 'Score',
        colorByPoint: true,
        data: chartBars,
        dataLabels: { enabled: true, style: { fontSize: '13px' } }
      }]
    });
  },
  comparison: {
    median: function() {
      leaderBarName = "Leader";
      targetScore = median;
    },
    high: function() {
      leaderBarName = "Leader";
      targetScore = high;
    },
    max: function() {
      leaderBarName = "Leader";
      targetScore = max;
    },
  },
  userLeader: function() {
    if(score > targetScore) {
      showHistoryFeedback = false;

      //$("#upward-feedback").transition({ opacity: 0 }, 0, 'ease');
      //$("#leader-feedback").transition({ opacity: 1 }, 100, 'ease');

      userFeedback = 'Congratulations! Now you are the best player!';
      targetScore = score;
      leaderBarColor = userBarColor;
      leaderBarName = 'Your<br />best';
    }
  }
}
