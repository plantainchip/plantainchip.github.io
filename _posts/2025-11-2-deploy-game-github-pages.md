---
layout: blog_design
title:  How I put my game on github pages
categories:
- games
---

I use KAPLAY to make web games and here is how I put those games on github pages.


Step 0: Save all your work in your Github. 

Part 1 (in your code editor): <br>
make a folder called .github then make another folder called workflows <br>
then under .github/workflows make a file called deploy.yaml (or whatever you want) <br>
copy paste this in there, then commit & push to github <br>

```yaml

name: Build and Deploy

on:
  push:
    branches:
      - main

jobs: 
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'

    - name: Install dependencies
      run: npm install

    - name: Build
      run: npm run build

    - name: Deploy
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: {% raw %} ${{ secrets.GITHUB_TOKEN }} {% endraw %}
        publish_dir: ./dist

```


Part 2 (in github):
in your repo where you saved your game, go to settings -> pages <br>
Under Build and deployment, make sure Source is "Deploy from a branch" <br>
and then under branch ( still under Build and deployment) change the dropdown that has None to "gh-pages" and the dropdown next to it should say "/root". <br>
save your settings and then wait a few seconds. then refresh your page. <br>



You should then be able to see a link with your game. And that's it!
<br>
<br>
<br>