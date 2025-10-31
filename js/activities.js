function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map((tweet) => {
		return new Tweet(tweet.text, tweet.created_at);
	});


	let weekendDistance = 0, weekendCount = 0;
	let weekdayDistance = 0, weekdayCount = 0;

	let activityDict = {};

	//Put tweets into dict with key of activity type and value of {count, total distance}
	tweet_array.forEach((tweet) => {
		let activity = tweet.activityType;
		if(activity != "unknown" && activity != "activity"){
			//Only if have valid distance
			if(tweet.distance != -1 ){
				let data = activityDict[activity] || { count: 0, totalDis: 0 };
				data.count++;
				data.totalDis+= tweet.distance;
				activityDict[activity] = data;
				
				//Count for weekend and weekday distance
				let day = tweet.time.getDay();
				if(day == 0|| day == 6){
					weekendDistance+= tweet.distance;
					weekendCount++;
				}
				else{
					weekdayDistance+= tweet.distance;
					weekdayCount++;
				}
			}
		}

		
	});



	//Sort the dict based on activity count from hign to low 
	let sortedActivity = Object.entries(activityDict).sort(([, a], [, b]) => b.count - a.count);
	document.getElementById('numberActivities').innerText = sortedActivity.length;
	document.getElementById('firstMost').innerText = sortedActivity[0][0]; 
	document.getElementById('secondMost').innerText = sortedActivity[1][0]; 
	document.getElementById('thirdMost').innerText = sortedActivity[2][0]; 

	//Get only the top 3 activities
	let sortedActivitySliced = sortedActivity.slice(0, 3);
	let activityAvg = {};
	//Calculate average distance for each activity.
	sortedActivitySliced.forEach(([activityName, data]) => {
		activityAvg[activityName] = data.totalDis / data.count;
	});	

	//Sort the dict based on average distance from hign to low 
	sortedAvg = Object.entries(activityAvg).sort(([, a], [, b]) => b - a);
	document.getElementById('longestActivityType').innerText = sortedAvg[0][0];
	document.getElementById('shortestActivityType').innerText = sortedAvg[2][0];
	

	const weekendAvg = weekendDistance / weekendCount;
	const weekdayAvg = weekdayDistance / weekdayCount;

	document.getElementById('weekdayOrWeekendLonger').innerText = weekendAvg > weekdayAvg? 'weekends': 'weekdays';

	
	
	//create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const activityData = Object.entries(activityDict).map(([key, value]) => {
		return {
			activity: key,
			count: value.count
		};
	});
	
	activity_vis_spec = {
	  	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"data": {
			"values": activityData
		},
		//TODO: Add mark and encoding\
		"width": 600,
		"height": 400,
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity Type",
				"sort": "-y"
			},
			"y": {
				"field": "count",
				"type": "quantitative",
				"title": "Count"
			}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const types = [sortedActivitySliced[0][0], sortedActivitySliced[1][0], sortedActivitySliced[2][0]];

	//Exclude tweet with type other than those in types and without valid distance.
	//Map the activity type, distance and day in distanceData.
	const distanceData = tweet_array
		.filter((tweet) => types.includes(tweet.activityType) && tweet.distance > 0)
		.map((tweet) => ({
			activity: tweet.activityType,
			distance: tweet.distance,
			day: tweet.time.toLocaleString('en-US', { weekday: 'short' })
		}));


	
		
	
	distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances by day of the week for top 3 activities.",
		"data": { "values": distanceData },
		"width": 600,
		"height": 400,
		"mark": "point",
		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"sort": dayOrder,
				"title": "time (day)"
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "distance"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity type"
			}
		}
	};
	
	distance_aggregate_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Mean distances by day of the week for top 3 activities.",
		"data": { "values": distanceData },
		"width": 600,
		"height": 400,
		"mark": "point",
		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"sort": dayOrder, 
				"title": "time (day)"
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"aggregate": "mean",
				"title": "Mean of distance"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "ActActivity typeivity"
			}
		}
	};

	vegaEmbed('#distanceVis', distance_vis_spec, { actions: false });
	vegaEmbed('#distanceVisAggregated', distance_aggregate_vis_spec, { actions: false });

	//set distanceVis to block for visible, and distanceVisAggregated none for non-visible.
	const distanceVis = document.getElementById('distanceVis');
	const distanceVisAggregated = document.getElementById('distanceVisAggregated');
	distanceVis.style.display = 'block';
	distanceVisAggregated.style.display = 'none';

	//reverse the visible graph after click button
	const aggregateBtn = document.getElementById('aggregate');
	aggregateBtn.addEventListener('click', () => {
		if (distanceVis.style.display === 'block') {
			distanceVis.style.display = 'none';
			distanceVisAggregated.style.display = 'block';
			aggregateBtn.innerText = 'Show all activities';
		} else {
			distanceVis.style.display = 'block';
			distanceVisAggregated.style.display = 'none';
			aggregateBtn.innerText = 'Show means';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});