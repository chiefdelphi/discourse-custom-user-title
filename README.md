# Discourse Custom User Title Plugin

A complete plugin that adds custom user titles from user field 4 to topic posts with zero AJAX requests.

## Installation

1. Clone this repository to your Discourse plugins directory:
   ```bash
   cd /var/discourse
   git clone https://github.com/yourusername/discourse-custom-user-title-unified.git plugins/discourse-custom-user-title
   ```

2. Rebuild your Discourse container:
   ```bash
   ./launcher rebuild app
   ```

## Configuration

1. In your Discourse admin panel, go to **Users > User Fields**
2. Ensure user field 4 is configured as your custom title field
3. The plugin will automatically display custom titles next to usernames in topic posts

## How it works

- **Server-side**: Extends PostSerializer to include custom title data in the initial page load
- **Client-side**: Reads preloaded data and displays titles with custom styling
- **Performance**: Zero AJAX requests - all data is included in the initial JSON payload

## Styling

The custom titles use the CSS class `.custom-user-title` and can be customized by editing `assets/stylesheets/common.scss`.