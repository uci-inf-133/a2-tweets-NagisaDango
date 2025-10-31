function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map((tweet) => {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//Filter to just the written tweets
	writtenTweets = tweet_array.filter((tweet) => {
		return tweet.written;
	});
}

function addEventHandlerForSearch() {
	//Search the written tweets as text is entered into the search box, and add them to the table

	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const textFilter = document.getElementById('textFilter');
	const tweetTable = document.getElementById('tweetTable');
	
	//Set the case for start without input
	if (textFilter.value.toLowerCase() == "") {
		searchCount.innerText = '0';
		searchText.innerText = '';
	}

	//Update on every input change
	textFilter.addEventListener('input', () => {
		
		//Filter only the tweet with input text
		const searchInput = textFilter.value.toLowerCase();
		const tweetFiltered = writtenTweets.filter((tweet) => {
			return tweet.text.toLowerCase().includes(searchInput);
		});

		tweetTable.innerHTML = '';
		
		//Case for empty string input.
		if (searchInput == "") {
			searchCount.innerText = '0';
			searchText.innerText = '';
			return;
		}
		

		//Update the text description
		searchCount.innerText = tweetFiltered.length;
		searchText.innerText = searchInput;
		
		//Store all the table row element and update into html
		let HTMLTable = '';
		tweetFiltered.forEach((tweet, index) => {
			HTMLTable += tweet.getHTMLTableRow(index+1);
		});
		tweetTable.innerHTML = HTMLTable;
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});