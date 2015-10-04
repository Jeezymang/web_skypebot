<?php
	header("Access-Control-Allow-Origin: *");
	set_include_path(get_include_path() . PATH_SEPARATOR . "/usr/share/php/google-api-php-client-master/src");
	//You will need to get these.
	require_once 'Google/autoload.php';
  	require_once 'Google/Client.php';
  	require_once 'Google/Service/YouTube.php';
	$API_KEY = "";
	$SERVER_PASS = "ak9Wg5YLvWVwbY";
	//Simple helper function
	function postParamSet($name)
	{
		return (isset($_POST[$name]));
	}

	//Made this into a function since it will also be used in the random video request.
	//Not sure why I have to pass the API_KEY even though it's defined above.
	function getVideoRating($videoID, $key)
	{
		$url = "https://www.googleapis.com/youtube/v3/videos?fields=items(id,snippet(title),statistics)&part=snippet,statistics&id=";
		$url .= $videoID . "&key=" . $key;
		$curl = curl_init();
		// Set some options - we are passing in a useragent too here
		curl_setopt_array($curl, array(
			CURLOPT_TIMEOUT => 30,
			CURLOPT_CUSTOMREQUEST => 'GET',
		    CURLOPT_RETURNTRANSFER => 1,
		    CURLOPT_URL => $url,
		));
		// Send the request & save response to $resp
		$resp = curl_exec($curl);
		// Close request to clear up some resources
		curl_close($curl);
		$jsonArray = json_decode($resp);
		$returnArray = array(
			"title" => $jsonArray->items[0]->snippet->title,
			"viewCount" => $jsonArray->items[0]->statistics->viewCount,
			"likeCount" => $jsonArray->items[0]->statistics->likeCount,
			"dislikeCount" => $jsonArray->items[0]->statistics->dislikeCount,
			"favoriteCount" => $jsonArray->items[0]->statistics->favoriteCount,
			"commentCount" => $jsonArray->items[0]->statistics->commentCount
		);
		return $returnArray;
	}

	function newYoutubeService($key)
	{
		$client = new Google_Client();
		$client->setDeveloperKey($key);

		$service = new Google_Service_YouTube($client);
		return $service;
	}

	function videoKeywordSearch($service, $keyword, $maxResults)
	{
		try 
		{
		    $searchResponse = $service->search->listSearch('id,snippet', array(
		      'q' => $keyword,
		      'maxResults' => $maxResults,
		    ));

		    $videos = array();

		    foreach ($searchResponse['items'] as $searchResult) 
		    {
		    	if($searchResult['id']['kind'] == "youtube#video")
		    		$videos[$searchResult['snippet']['title']] = $searchResult['id']['videoId'];
		    }

		    return $videos;
	  	} 
	  	catch (Google_Service_Exception $e) 
	  	{
	    	echo sprintf('<p>A service error occurred: <code>%s</code></p>', htmlspecialchars($e->getMessage()));
	  	} 
	  	catch (Google_Exception $e) 
	  	{
	    	echo sprintf('<p>An client error occurred: <code>%s</code></p>',htmlspecialchars($e->getMessage()));
	  	}
	}

	if ( $_SERVER["REQUEST_METHOD"] == "POST" )
	{
		if (!postParamSet("pass") || $_POST["pass"] != $SERVER_PASS)
			die("Incorrect or no password specified.");

		if (!postParamSet("request_type"))
			die("No request type has been specified.");

		$request_type = $_POST["request_type"];
		switch($request_type)
		{
			case "random_video":
				if(!postParamSet("query"))
					die("No search query specified.");
				$service = newYoutubeService($API_KEY);
				$searchQuery = $_POST["query"];
				$results = videoKeywordSearch($service, $searchQuery, 10);
				$randIndex = array_rand($results);
				$infoArray = getVideoRating($results[$randIndex], $API_KEY);
				$returnJSON = json_encode(array(
					"title" =>$randIndex, 
					"id" => $results[$randIndex],
					"likeCount" => $infoArray["likeCount"],
					"dislikeCount" => $infoArray["dislikeCount"],
					"viewCount" => $infoArray["viewCount"]
				));
				echo $returnJSON;
			break;
			case "video_rating":
				if(!postParamSet("videoID"))
					die("No video id specified.");
				$videoID = $_POST["videoID"];
				$infoArray = getVideoRating($videoID, $API_KEY);
				$returnJSON = json_encode($infoArray);
				echo $returnJSON;
			break;
			default:
				die("Invalid request type specified.");
		}
	}
?>