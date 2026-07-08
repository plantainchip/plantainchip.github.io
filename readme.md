# Jekyll Boilerplate

## Prereq

- `https://rvm.io/`
- `sudo apt install gnupg2 openssl`
- `rvm install ruby-3.4.5`

- you dont need to do these next steps up until local development unless you're staring from scratch
- `cd projects`
- `git clone https://github.com/fizal619/jekyll_boilerplate.git`
- `mv jekyll_boilerplate <your_folder_name>`
- `cd <your_folder_name>`
- `rm -rf .git`
- `git init`
- `git add .`
- `git commit -m "initial commit"`

## Local Development
- `gem install bundler`
- `bundle install`
- `bundle exec jekyll serve --incremental --livereload`

## Deploy
- `git remote add origin <your empty repo clone url>`
- `git push origin main/master`
- Turn on github pages
- Profit 🤑💰





To do:
- what do numbers mean
- Move contents of body tag gallery code. 
- keep 1 drawing A tag for for loop
- Delete list of drawings and replace with for loop
