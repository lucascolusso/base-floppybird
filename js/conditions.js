//comparison scores
var median = 9;
var high = 21;
var max = 127;

var userCondition = function() {};
var leaderBarName = 'Target'
var leaderBarColor = '#f8704f';
var userBarColor = '#36d77a';
var conditions;
var graphScore;

//conditions logic
conditions = {
  nonSkewed: function() {
    $('#feedback-chart-panel').highcharts({
      title:{ text:'' },
      chart: { type: 'column' },
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
    $('#feedback-chart-modal').highcharts({
      title:{ text:'' },
      chart: { type: 'column' },
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
    if (score ==1) {
      graphScore = targetScore*Math.log(2)/Math.log(targetScore)/2;
    } else {
      graphScore = targetScore*Math.log(score)/Math.log(targetScore);
    };
    $('#feedback-chart-panel').highcharts({
      title:{ text:'' },
      chart: { type: 'column' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { categories: ['You', leaderBarName] },
      yAxis: { min: 0, title: { text: 'Score' }, gridLineWidth: 0, minorGridLineWidth: 0, labels: { enabled: false } },
      series: [{
        name: 'Score', colorByPoint: true,
        data: [
        {
          name: score.toString(), color: userBarColor, y: graphScore, // testing logarithm
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
    $('#feedback-chart-modal').highcharts({
      title:{ text:'' },
      chart: { type: 'column' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { categories: ['You', leaderBarName] },
      yAxis: { min: 0, title: { text: 'Score' }, gridLineWidth: 0, minorGridLineWidth: 0, labels: { enabled: false } },
      series: [{
        name: 'Score', colorByPoint: true,
        data: [
        {
          name: score.toString(), color: userBarColor, y: graphScore, // testing logarithm
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
  comparison: {
    leader: function() {
      targetScore = max;
    },
    high: function() {
      targetScore = high;
    },
    median: function() {
      targetScore = median;
    }
  },
  userLeader: function() {
    if(score > targetScore) {

      $("#upward-feedback").hide();
      $("#leader-feedback").transition({ opacity: 1 }, 100, 'ease');

      targetScore = score;
      leaderBarColor = userBarColor;
      leaderBarName = 'Your';
    }
  }
}
