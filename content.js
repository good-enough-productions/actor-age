// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'modifyIMDb') {
        console.log("Content.js: Starting to modify the IMDb page.");
        modifyIMDbPage();
    }
});

async function modifyIMDbPage() {
    console.log("Content.js: Modifying the IMDb page...");

    // Add a new column header for 'Age at Release'
    const headerRow = document.querySelector('.cast_list tr');
    if (headerRow) {
        console.log(
            "Content.js: Header row found, adding 'Age at Release' column."
        );
        const ageHeader = document.createElement('th');
        ageHeader.innerText = 'Age at Release';
        headerRow.appendChild(ageHeader);
    } else {
        console.log('Content.js: Error - Header row not found!');
    }

    // Iterate over all cast rows
    const rows = document.querySelectorAll('.cast_list tr');
    if (rows.length > 0) {
        console.log(`Content.js: Found ${rows.length} cast rows.`);

        // Fetch movie release date once
        const movieReleaseDate = await getMovieReleaseDate();
        console.log('Content.js: Movie release date:', movieReleaseDate);

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const actorNameCell = row.querySelector('td:nth-child(2) a');
            const ageCell = document.createElement('td');
            row.appendChild(ageCell);

            if (actorNameCell) {
                const actorName = actorNameCell.innerText.trim();
                console.log(`Content.js: Processing actor: ${actorName}`);

                if (i <= 10) {
                    // Fetch and display age for top 10 actors
                    const ageAtRelease = await fetchActorAge(actorName, movieReleaseDate);
                    ageCell.innerText = ageAtRelease !== null ? ageAtRelease : 'N/A';
                    console.log(`Content.js: Added age for actor: ${actorName}`);
                } else {
                    // Add "Get Age" button for others
                    const getAgeButton = document.createElement('button');
                    getAgeButton.innerText = 'Get Age';
                    getAgeButton.style.padding = '5px';
                    getAgeButton.addEventListener('click', async () => {
                        getAgeButton.disabled = true;
                        ageCell.innerText = 'Loading...';
                        const ageAtRelease = await fetchActorAge(actorName, movieReleaseDate);
                        ageCell.innerText = ageAtRelease !== null ? ageAtRelease : 'N/A';
                        console.log(`Content.js: Added age for actor: ${actorName}`);
                    });
                    ageCell.appendChild(getAgeButton);
                }
            }
        }
    } else {
        console.log('Content.js: Error - No cast rows found.');
    }
}

// Fetch actor's age at the time of the movie's release
async function fetchActorAge(actorName, movieReleaseDate) {
    console.log('Content.js: fetchActorAge called for', actorName, 'with movieReleaseDate:', movieReleaseDate);
    try {
        const actorDOB = await getActorDOB(actorName);
        console.log('Content.js: actorDOB for', actorName, 'is', actorDOB);
        if (movieReleaseDate && actorDOB) {
            const age = calculateAge(actorDOB, movieReleaseDate);
            console.log('Content.js: Age at release for', actorName, 'is', age);
            return age;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching actor age:', error);
        return null;
    }
}

// Wrap chrome.runtime.sendMessage in a Promise
function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error in sendMessageAsync:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// Fetch movie release date by messaging the background script
async function getMovieReleaseDate() {
    const imdbID = window.location.pathname.split('/')[2]; // Extract movie ID from URL
    try {
        const response = await sendMessageAsync(
            { action: 'getMovieReleaseDate', imdbID: imdbID }
        );
        return response.releaseDate;
    } catch (error) {
        console.error('Error in getMovieReleaseDate:', error);
        throw error;
    }
}

// Fetch actor's DOB by messaging the background script
async function getActorDOB(actorName) {
    try {
        const response = await sendMessageAsync(
            { action: 'getActorDOB', actorName: actorName }
        );
        return response.actorDOB;
    } catch (error) {
        console.error('Error in getActorDOB:', error);
        throw error;
    }
}

// Calculate the actor's age at the time of the movie's release
function calculateAge(dob, releaseDate) {
    const birthDate = parseDate(dob);
    const movieRelease = parseDate(releaseDate);

    if (!birthDate || !movieRelease) {
        console.error('Invalid date(s) in calculateAge:', dob, releaseDate);
        return null;
    }

    let age = movieRelease.getFullYear() - birthDate.getFullYear();
    const monthDiff = movieRelease.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && movieRelease.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

// Parse date strings into Date objects
function parseDate(dateString) {
    if (!dateString) return null;

    // Handle different date formats
    let date;

    // Try ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString + 'T00:00:00'); // Add time to prevent timezone issues
    }
    // Try format from OMDb API (DD MMM YYYY)
    else if (/^\d{2} \w{3} \d{4}$/.test(dateString)) {
        date = new Date(dateString);
    }
    // Handle other known formats if necessary
    else {
        console.warn('Unknown date format:', dateString);
        return null;
    }

    return isNaN(date.getTime()) ? null : date;
}
