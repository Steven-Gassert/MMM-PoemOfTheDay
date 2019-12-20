# MMM-PoemOfTheDay

Magic Mirror Module for displaying a poem of the day using [poemist API](https://www.poemist.com/). Optionally utilize [detect language API](https://detectlanguage.com/) to filter poems by language

# Screenshot
![MMM-PoemOfTheDay screenshot](./docs/images/MMM-screenshot.png)

# Usage
1. Install [Magic Mirror](https://github.com/MichMich/MagicMirror)
2. Change into the `modules` directory and clone `MMM-PoemOfTheDay`
```
cd modules
git clone https://github.com/Steven-Gassert/MMM-PoemOfTheDay.git
```
3. Add this to the MagicMirror modules array in `config/config.js`

ex.
```
modules: [
  {
    module: "MMM-PoemOfTheDay",
    position: "lower_third",
    config: {
      textLimit: 1000,
      lineLimit: 10,
      detectLanguageApiKey: "{API_KEY}",
      languageSet: ["en", "es"],
      updateInterval: 120000
    }
  }
]
```
4. *optional*: to enable langague filtering, you must include a `detectLanguageApiKey` as well as `languageSet`. See Configuration options below to find out where to retrieve these values

# Configuration options

| Name        | description           | default  |
| ------------- |:-------------:| -----:|
| textLimit    | the max number of characters allowed in a poem | 1000 |
| lineLimit     | the max number of lines allowed in a poem (determined by number of new lines /n) | 10 |
| detectLanguageApiKey | api key used to make detect language calls, see `Get API key` at https://detectlanguage.com/ | `undefined` |
| languageSet     | an array of language options that the poem should be written in, for a complete list of language options see https://ws.detectlanguage.com/0.2/languages | `["en", "es"]` |
| updateInterval | interval at which the poems will update in milliseconds, minmum 120000 | 300000 |
