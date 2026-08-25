---
layout: blog_design
title:  How I upload kaplay games from github to itch.io using github actions
categories:
- games
---

<!-- # How I upload kaplay games from github to itch.io using github actions -->

I make games with kaplay.js and this is how I upload my games to itch.io. I do this so I don't have to constantly zip and reupload files on the page whenever I make an update. The deployment type is webgl. 

After you commit and push your game to github, you need to go to your itch.io account <br>
Go to your itch.io account -> settings -> API Keys <br>
Generate a new API key. If you already have one, just copy the one you already have. <br>
Do NOT share this key with anyone!!! This is as important as your account's password!!!

While you're still here over at itch.io <br>
Upload a new project. Create the name of the project and everything else. <br>
You're gonna need the url in a few mins. I recommend saving the page as a draft. Do not upload any game files here. Leave that blank.

Next go to your github account and to the repo where you have your game <br>
Go to settings -> secrets & variables -> actions <br>
Click new repository secret and name your key (in all caps. keep it short. example ITCH_KEY) and paste the itch.io api key.<br>

Then in your code editor when you're making your game, 

read [this guide](https://docs.github.com/en/actions/get-started/quickstart) for a quickstart to github actions<br>
make a folder .github<br>
then under .github make a new folder called workflows. <br>
then under .github/workflows create a file called game_release.yaml (or name it whatever you want)<br>
copy paste this in there<br>


```yaml
  name: Release


  on:
    push:
      branches:
        - main


  jobs:
    exports:
      name: Build, Release, and Upload
      runs-on: ubuntu-latest
      steps:
        - name: Check out repository
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20.x'

        - name: Install dependencies
          run: npm install

        - name: Build
          run: npm run build

        - name: Zip dist folder
          run: zip -r game.zip ./dist

        - uses: KikimoraGames/itch-publish@v0.0.3
          with:
            butlerApiKey: {% raw %} ${{secrets.BUTLER_API_KEY}} {% endraw %}
            gameData: ./game.zip
            itchUsername: 
            itchGameId: 
            buildChannel: webgl
```


- replace BUTLER_API_KEY with the name of your key from your github secrets.
- make itchUsername your itch.io username
- make itchGameId the last part of the url for your game's itch.io page. The id of the url is the stuff after the slash

Do not put any zip files in this repo or it won't work. <br>
Then commit and push everything to github. In a few mins your game should be published and working. Now everytime you make a change to the code, all you do is commit and push to github and it should update your itch.io page. 


Credits to KikimoraGames for providing the github action.
You can read more about it [here](https://github.com/marketplace/actions/itch-io-publish)


