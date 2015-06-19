var targetScore = 999;

//comparison scores
var median = 9;
var high = 21;
var max = 127;

var userCondition = function() {};
var leaderBarName = 'Target'
var leaderBarColor = '#f8704f';
var userBarColor = '#36d77a';
var conditions;

conditions = {
  nonSkewed: function() {
    $('.feedback-chart').highcharts({
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
    $('.feedback-chart').highcharts({
      chart: { type: 'column' },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: { categories: ['You', leaderBarName] },
      yAxis: { min: 0, title: { text: 'Score' }, gridLineWidth: 0, minorGridLineWidth: 0, labels: { enabled: false } },
      series: [{
        name: 'Score', colorByPoint: true,
        data: [
        {
          name: score.toString(), color: userBarColor, y: (Math.log(score)) / (Math.log(targetScore)),
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
    median: function() {
      targetScore = median;
    },
    high: function() {
      targetScore = high;
    },
    max: function() {
      targetScore = max;
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
