function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//convert to numerical time for comparison
	const times = tweet_array.map(t => t.time.getTime());

	//Find earliest and latest date
	const earliest = times.reduce((min, d) => (d < min ? d : min));
	const latest = times.reduce((max, d) => (d > max ? d : max));

	//Format date in（Monday, January 18, 2021）
	const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'  };
	let writtenCount = 0;


	//count the number of each activity type
	const counts = { completed_event: 0, live_event: 0, achievement: 0, miscellaneous: 0 };
	for (const t of tweet_array) {
		const type = t.source;
		if (counts.hasOwnProperty(type)) counts[type]++;
		else counts.miscellaneous++;

		if(counts.hasOwnProperty("completed_event") && t.written){
			writtenCount++;
		}
	}

	const total = tweet_array.length;
	const pctFormat = (n, total) => (100 * n / total).toFixed(2) + '%';
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = total;	
	document.getElementById('firstDate').innerText = new Date(earliest).toLocaleDateString("en-US", options);	
	document.getElementById('lastDate').innerText = new Date(latest).toLocaleDateString("en-US", options);	


	document.querySelectorAll('.completedEvents')
      .forEach(ce => ce.innerText = counts.completed_event);
	document.querySelector('.completedEventsPct').innerText = pctFormat(counts.completed_event, total);	

	document.querySelector('.liveEvents').innerText = counts.live_event;	
	document.querySelector('.liveEventsPct').innerText = pctFormat(counts.live_event, total);	

	document.querySelector('.achievements').innerText = counts.achievement;	
	document.querySelector('.achievementsPct').innerText = pctFormat(counts.achievement, total);	

	document.querySelector('.miscellaneous').innerText = counts.miscellaneous;	
	document.querySelector('.miscellaneousPct').innerText = pctFormat(counts.miscellaneous, total);	

	document.querySelector('.written').innerText = writtenCount;	
	document.querySelector('.writtenPct').innerText = pctFormat(writtenCount, counts.completed_event);	

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});