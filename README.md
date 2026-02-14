# Jellyfin User Ratings Plugin

A Jellyfin plugin that enables users to rate and review items, with support for tracking rating history and importing/exporting data.

## Features

-   **User Ratings**: Rate items on a 1-5 scale.
-   **Reviews**: Add text reviews/notes to your ratings.
-   **History Log**: Automatically tracks all rating events to a persistent CSV log (`ratings_history.csv`).
-   **Import/Export**:
    -   Export all ratings to JSON or CSV.
    -   Import ratings from JSON backup.
    -   Download full history log.

## Installation

1.  Add the repository URL to your Jellyfin instance:
    `https://github.com/luiscorbachoflores/pluginratingtest/raw/main/manifest.json`
2.  Install **User Ratings** from the catalog.
3.  Restart Jellyfin.

## Manual Installation

1.  Download the latest release ZIP.
2.  Extract the `UserRatings` folder to your Jellyfin `plugins` directory.
3.  Restart Jellyfin.

## Configuration

Go to **Dashboard > Plugins > User Ratings** to access the import/export and history download features.
