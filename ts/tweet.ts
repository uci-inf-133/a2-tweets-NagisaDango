class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {

        //identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const t = this.text.toLowerCase();
        if(t.startsWith("just completed") || t.startsWith("just posted")){
            return "completed_event";
        }
        if(t.includes("live")){
            return "live_event";
        }
        if(t.startsWith("achieved")){
            return "achievement";
        }
        
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //identify whether the tweet is written
        return this.text.includes(" - ");
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //parse the written text from the tweet )
        let writtenText = this.text.split(' - ')[1];
        let index = writtenText.indexOf("http");

        //from index of "-" to the index of "http"
        if (index !== -1) writtenText = writtenText.substring(0, index);
        return writtenText.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //parse the activity type from the text of the tweet
        
        const t = this.text.toLowerCase().split(" - ")[0].split("@runkeeper")[0];
        
        if(t.includes(" in ")){
            return t.substring(t.indexOf("a")+2, t.indexOf(" in")).trim();
        }
        else if(t.includes(" with ")){
            return t.substring( Math.max(t.indexOf("mi"), t.indexOf("km"))+3, t.indexOf(" with")).trim();
        }
        else{
            return t.substring( Math.max(t.indexOf("mi"), t.indexOf("km"))+3).trim();             
        }

    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //prase the distance from the text of the tweet
        const str = this.text.split(" ");
        let distance = parseFloat(str[3]); //find the number before km or mi
        if(isNaN(distance)) return -1;
        distance = str[4] == "km"? distance/1.609 : distance;
        return distance;
    }

    getHTMLTableRow(rowNumber:number):string {
        //return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        
        //replace http link with hyperlink
        const tweetUrl = /(https:\/\/[^\s]+)/g;
        const linkedText = this.text.replace(tweetUrl, '<a href="$1">$1</a>');

        //organize the table row element
        let row = '<tr>';
        row += `<td>${rowNumber}</td>`;
        row += `<td>${this.activityType}</td>`;
        row += `<td>${linkedText}</td>`;
        row += '</tr>';

        return row;
    }
}