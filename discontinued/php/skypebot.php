<?php
	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: pass, request_type, author, text, time, url, errorMessage, stackTrace, convoName");
	$SERVER_PASS = "AWmga7KhSnzs4qke";
	$DATABASE_HOST = "";
	$DATABASE_USER = "";
	$DATABASE_PASSWORD = "";
	$DATABASE_SCHEMA = "";
	
	function getPageContents($url) {
		$pageContents = "";
		$curlHandle = curl_init();
		$timeout = 5;
		curl_setopt($curlHandle, CURLOPT_URL, $url);
  		curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, 1);
  		curl_setopt($curlHandle, CURLOPT_CONNECTTIMEOUT, $timeout);
  		$pageContents = curl_exec($curlHandle);
  		curl_close($curlHandle);
  		return $pageContents;
	}

	if ( $_SERVER["REQUEST_METHOD"] == "POST" ) {
		if(isset($_POST["request_type"])) {
			if ( ( isset($_POST["pass"] ) ) && $_POST["pass"] == $SERVER_PASS ) {
				$requestType = $_POST["request_type"];
				$conn = new mysqli($DATABASE_HOST, $DATABASE_USER, $DATABASE_PASSWORD, $DATABASE_SCHEMA );
				if ( $requestType == "addmessage" ) {
					$author = $conn->real_escape_string($_POST["author"]);
					$text = $conn->real_escape_string($_POST["text"]);
					$convoName = $conn->real_escape_string($_POST["convoName"]);
					$time = time();
					$conn->query("INSERT INTO skype_messages ( author, text, time, convoName ) VALUES( '$author', '$text', $time, '$convoName' );");
					echo (mysqli_error($conn));
				}
				else if ( $requestType == "getrandommessage" ) {
					$author = $conn->real_escape_string($_POST["author"]);
					$convoName = $conn->real_escape_string($_POST["convoName"]);
					$results = $conn->query("SELECT * FROM(SELECT * FROM skype_messages WHERE author = '$author' AND convoName = '$convoName' ORDER BY time ) AS T ORDER BY RAND() LIMIT 1;");
					if ( $results && $results->num_rows > 0 ) {
						$resultArray = mysqli_fetch_array($results);
						$theAuthor = $resultArray["author"];
						$theText = $resultArray["text"];
						$theTime = intval($resultArray["time"]);
						date_default_timezone_set('America/Los_Angeles');
						echo "[" . date("m/d/y", $theTime ) . "] " . $theAuthor . ": " . $theText;
					}
					else {
						echo "No results";
					}
				}
				else if ( $requestType == "getpagetitle" ) {
					$url = $_POST["url"];
					preg_match("/(http(?:s?):\/\/|)/", $url, $matches);
					if ( $matches[0] == "" )
  						$url = "https://" . $url;
  					$theTitle = "Unknown";
  					// Probably not a good method for this.
  					// Credit: http://stackoverflow.com/questions/4348912/get-title-of-website-via-link
  					$str = file_get_contents($url);
					if(strlen($str)>0){
						$str = trim(preg_replace('/\s+/', ' ', $str)); // supports line breaks inside <title>
						preg_match("/\<title\>(.*)\<\/title\>/i", $str, $titleMatches); // ignore case
						$theTitle = $titleMatches[1];
					}
					echo $theTitle;
				}
				else if ( $requestType == "getpagecontents" ) {
					$url = $_POST["url"];
					$pageContents = getPageContents($url);
  					echo $pageContents;
				}
				else if ( $requestType == "getfacepunchpostcontents" ) {
					$url = $_POST["url"];
					preg_match("/post[0-9]*/", $url, $matches);
					preg_match("/(https:\/\/|)/", $url, $urlMatches);
					if ( $urlMatches[0] == "" ) {
						$url = preg_replace("/http:\/\//", "", $url);
						$url = "https://" . $url;
					}

					if ( $matches[0] == "" ) {
						echo "No results";
					} else {
						$postID = $matches[0];
						$postID = preg_replace("/post/", "", $postID);
						$str = getPageContents($url);
						$str = trim(preg_replace('/\s+/', ' ', $str));
						preg_match('/<li class="postbitlegacy postbitim postcontainer (postbitold|postbitnew)" id="post_' . $postID . '">(.*)<\/li>/s', $str, $postMatches);
						$theContents = $postMatches[0];
						preg_match('/<span class="rating_results" id="rating_' . $postID . '">(.*?)<\/a> <\/span>/s', $theContents, $ratingResultMatches);
						$ratingString = "";
						if ($ratingResultMatches[0] != "" ) {
							preg_match('/<img.*? \/>(.*)<\/strong>/s', $ratingResultMatches[0], $ratingMatches);
							$ratingString = $ratingMatches[0];
							$ratingString = preg_replace('/<img.*? \/>|<strong>|<\/strong>|<\/span>|<span>/s', "", $ratingString);
							$ratingString = "\n" . $ratingString;
						}
						preg_match('/<div class="username_container">(.*?)<\/div>/s', $theContents, $userContainerMatches);
						$userName = $userContainerMatches[0];
						$userName = preg_replace('/<div.*?>|<\/div>/s', "", $userName);
						$userName = preg_replace('/<a.*?>|<\/a>/s', "", $userName);
						$userName = preg_replace('/<strong>|<\/strong>/s', "", $userName );
						$userName = preg_replace('/<font color.*?>|<\/font>/s', "", $userName );
						preg_match('/<div id="post_message_' . $postID . '">(.*)<\/div>/s', $theContents, $contentMatches);
						preg_match('/<blockquote class="postcontent restore ">(.*?)<\/blockquote>/s', $contentMatches[0], $blockMatches);
						$postContent = preg_replace('/<div class="quote">(.*?)<\/div> <\/div>/s', "", $blockMatches[0] );
						$postContent = preg_replace('/<blockquote class="postcontent restore ">|<\/blockquote>/s', "", $postContent);
						$postContent = preg_replace('/<br \/>/s', "\n", $postContent );
						$postContent = preg_replace('/<div class="(bbcode_container|bbcode_description)">|<\/div>|<pre class=.*?>|<\/pre>|Code:|Use Ctrl\+F to find/s', "", $postContent);
						$postContent = preg_replace('/<a.*?>|<\/a>|<img.*\/>/s', "", $postContent);
						$postContent = preg_replace('/<video.*?>(.*?)<\/video>/s', "", $postContent);
						$postContent = preg_replace('/<div class="center"><div class="video">(.*?)<\/iframe>/s', "", $postContent);
						$postContent = preg_replace('/<b>|<\/b>/s', "", $postContent );
						$postContent = preg_replace('/<i>|<\/i>/s', "", $postContent );
						$postContent = preg_replace('/<font.*?>|<\/font>/s', "", $postContent );
						$postContent = preg_replace('/&quot;/s', '"', $postContent);
						$postContent = preg_replace('/&#39;/s', "'", $postContent);
						echo $userName . ": " . $postContent . $ratingString;
					}

				}
				else if ( $requestType == "gettweetcontents" ) {
					$url = $_POST["url"];
					preg_match("/(https:\/\/|)/", $url, $urlMatches);
					if ( $urlMatches[0] == "" ) {
						$url = preg_replace("/http:\/\//", "", $url);
						$url = "https://" . $url;
					}
					$str = getPageContents($url);
					$str = trim(preg_replace('/\s+/', ' ', $str));
					preg_match('/<div class="tweet permalink-tweet.*?">(.*)<\/div>/s', $str, $containerMatches);
					if ( $containerMatches[0] !=  "" ) {
						preg_match('/<p class="TweetTextSize TweetTextSize--28px js-tweet-text tweet-text" lang="en" data-aria-label-part="0">(.*?)<\/p>/s', $containerMatches[0], $tweetMatches);
						preg_match('/<strong.*?>(.*?)<\/strong>/s', $containerMatches[0], $authorMatches);
						$author = "Unknown";
						if ( $authorMatches[0] != "" ) {
							$cleanedAuthor = $authorMatches[0];
							$cleanedAuthor = preg_replace('/(<strong.*?>|<\/strong>)/s', "", $cleanedAuthor);
							$cleanedAuthor = preg_replace('/<span.*?>(.*)<\/span>/s', "", $cleanedAuthor);
							$author = $cleanedAuthor;
						}
						if ( $tweetMatches[0] != "" ) {
							$cleanedText = $tweetMatches[0];
							$cleanedText = preg_replace('/(<p class="TweetTextSize TweetTextSize--28px js-tweet-text tweet-text" lang="en" data-aria-label-part="0">|<\/p>)/s', "", $cleanedText );
							$cleanedText = preg_replace('/&#10;/s', "\n", $cleanedText);
							$cleanedText = preg_replace('/(<a.*?>|<\/a>)/s', "", $cleanedText);
							$cleanedText = preg_replace('/<img*.+>/s', "", $cleanedText);
							$cleanedText = preg_replace('/(<s>|<\/s>|<b>|<\/b>)/s', "", $cleanedText);
							$cleanedText = preg_replace('/pic.twitter.com/s', "\nhttps://pic.twitter.com", $cleanedText );
							$cleanedText = preg_replace('/&quot;/s', '"', $cleanedText);
							$cleanedText = preg_replace('/<span.*?>(.*)<\/span>/s', "", $cleanedText);
							$cleanedText = preg_replace('/&#39;/s', "'", $cleanedText);
							echo $author  . ": " . $cleanedText;
						}
					}
				}
				else if ( $requestType == "log_node_error" ) {
					$errorMessage = $conn->real_escape_string( $_POST["errorMessage"] );
					$stackTrace = $conn->real_escape_string( $_POST["stackTrace"] );
					$time = time();
					$conn->query("INSERT INTO node_errors VALUES( null, '$errorMessage', '$stackTrace', $time);");
					echo "complete";
				}
				$conn->close();
			} else {
				echo "incorrect password";
			}
		}
	}
?>