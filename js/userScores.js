// Saves all the user scores's on the game.
// The first element is the first score and the last element is the most recent score.
var allScores = [];

// userScores data structure declaretion.
var userScores;
userScores = {
	// Returns the last elements based on 'quantity' parameter. The last element is the most recent score.
	getLast: function(quantity) {
		var last = [];
		if(typeof quantity === 'number' && quantity != undefined && quantity > 0 && allScores.length > 0) {
			for (var i = allScores.length - 1; i >= allScores.length - quantity ; i--) {
				last.push(allScores[i]);
			};
		}
		return last;
	},
	add: function(score) {
		allScores.push(score);
	}
} 