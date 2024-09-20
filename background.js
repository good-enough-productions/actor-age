// background.js

importScripts('config.js');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === 'complete' &&
        tab.url &&
        tab.url.includes('fullcredits')
    ) {
        console.log("Background.js: Detected 'Full Cast and Crew' page.");
        chrome.tabs.sendMessage(tabId, { action: 'modifyIMDb' });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getMovieReleaseDate') {
        getMovieReleaseDate(request.imdbID)
            .then((releaseDate) => {
                sendResponse({ releaseDate: releaseDate });
            })
            .catch((error) => {
                console.error(error);
                sendResponse({ releaseDate: null });
            });
        return true; // Keep the message channel open for asynchronous response
    } else if (request.action === 'getActorDOB') {
        getActorDOB(request.actorName)
            .then((actorDOB) => {
                sendResponse({ actorDOB: actorDOB });
            })
            .catch((error) => {
                console.error(error);
                sendResponse({ actorDOB: null });
            });
        return true; // Keep the message channel open for asynchronous response
    }
});

// Fetch movie release date from TheMovieDB API
async function getMovieReleaseDate(imdbID) {
    const apiKey = CONFIG.TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/find/${imdbID}?api_key=${apiKey}&language=en-US&external_source=imdb_id`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Background.js: Movie data from TMDb:", data);

        if (data.movie_results && data.movie_results.length > 0) {
            const releaseDate = data.movie_results[0].release_date;
            console.log("Background.js: Movie release date is", releaseDate);
            return releaseDate;
        } else {
            console.error('Background.js: No movie results found for IMDb ID:', imdbID);
            return null;
        }
    } catch (error) {
        console.error("Error fetching movie release date:", error);
        return null;
    }
}


// Fetch actor's DOB from TheMovieDB API
async function getActorDOB(actorName) {
    const apiKey = CONFIG.TMDB_API_KEY;
    const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
        actorName
    )}`;

    try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        console.log(`Background.js: Search data for ${actorName}:`, searchData);

        if (searchData.results && searchData.results.length > 0) {
            const actorId = searchData.results[0].id;
            const detailsUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            console.log(`Background.js: Details data for ${actorName}:`, detailsData);

            if (detailsData.birthday && detailsData.birthday !== '') {
                return detailsData.birthday; // Actor's date of birth
            } else {
                console.error(`Background.js: No DOB found for actor: ${actorName}`);
                return null;
            }
        } else {
            console.error(`Background.js: No results found for actor: ${actorName}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching actor DOB:", error);
        return null;
    }
}
