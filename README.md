# IMDb Age At Release Extension

A Chrome extension that adds actors' ages at the time of the movie's release to IMDb's Full Cast and Crew pages.

## Features

- Automatically displays the ages of the top 10 cast members.
- Adds a "Get Age" button for other cast members to fetch their ages on demand.
- Fetches data from TheMovieDB API.

## Installation

1. **Clone or Download the Repository:**

   ```bash
   git clone https://github.com/yourusername/imdb-age-at-release-extension.git

2. Navigate to the Project Folder:
cd imdb-age-at-release-extension

3. Install Dependencies:

No external dependencies are required.
Set Up API Keys:

4. Obtain API keys from TheMovieDB:

Sign up at TheMovieDB and navigate to API Settings.
Request an API key (API v3 auth).
Create a config.js file in the project root:

// config.js

const CONFIG = {
    TMDB_API_KEY: 'your_tmdb_api_key_here'
};

Replace 'your_tmdb_api_key_here' with your actual API key.

5. Load the Extension in Chrome:

Open Chrome and navigate to chrome://extensions/.
Enable Developer mode (toggle switch in the top right corner).
Click on "Load unpacked".
Select the project folder (imdb-age-at-release-extension).

Usage
Navigate to any IMDb movie's Full Cast and Crew page.
Example: https://www.imdb.com/title/tt0111161/fullcredits
The extension will automatically display the ages of the top 10 cast members.
For other cast members, click the "Get Age" button next to their names to fetch their ages.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a new branch:

bash
Copy code
git checkout -b feature/your-feature-name
Commit your changes:

bash
Copy code
git commit -am 'Add new feature'
Push to the branch:

bash
Copy code
git push origin feature/your-feature-name
Open a pull request.

License
This project is licensed under the MIT License.

Disclaimer
This extension is for educational purposes.
Please respect the terms of service of IMDb and TheMovieDB.
Use your own API keys and do not share them publicly.