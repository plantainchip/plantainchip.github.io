---
layout: blog_design
title:  A dive into Itch.io's most popular games
categories:
- games
---

I was watching a youtube video about someone that scraped data from about 10,000 games from Steam and he used a neural network AI to study the patterns from the games that did well vs the ones that didn't and what patterns came from their screenshots. I participate in game jams on itch.io and I observe my own analytics on the site so i got the idea to do my own investigation about patterns in the popular tab but on a small scale.

## The Setup: 
With the help of Claude AI, I wrote a python script that I can run in my terminal that scraped the data from a site called itchdb. Specifically from the hot chart because I wanted information on what these popular games have in common. Here is the python script:<br>

```py
import requests
import time
import json

url = "https://itchdb[.]info/api/hot"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json",
    "Referer": "https://itchdb[.]info/hot?window=7d",
}

all_results = []

for page in range(1, 11):
    resp = requests.get(url, params={"window": "7d", "page": page}, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    all_results.append(data)
    print(f"Fetched page {page}")
    time.sleep(1)

with open("results.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, indent=2, ensure_ascii=False)

print("Saved to results.json")
```



Then I ran the script on my computer and it exported a json file filled with 250 games. Then from that json file I converted it to a sqlite database. The reason I choose python for this project is because sqlite3 is included in the python library. <br>
![screenshot](/assets/blog_itch_analysis/screenshot_term.png)

This next block of code is what I used to convert my json file into a database file so I can query it. <br>

```py
import json
import sqlite3

with open("results.json", "r", encoding="utf-8") as f:
    pages = json.load(f)

games = []
for page in pages:
    games.extend(page["games"])

print(f"Found {len(games)} games")

conn = sqlite3.connect("games.db")
cur = conn.cursor()

cur.executescript("""
CREATE TABLE IF NOT EXISTS games (
    id            INTEGER PRIMARY KEY,
    slug          TEXT,
    title         TEXT,
    author        TEXT,
    url           TEXT,
    cover         TEXT,
    priceCents    INTEGER,
    isFree        INTEGER,
    stars         REAL,
    ratings       INTEGER,
    comments      INTEGER,
    position      INTEGER,
    nsfw          INTEGER,
    author_url    TEXT,
    tier          TEXT,
    score         REAL,
    dRatings      INTEGER,
    dComments     INTEGER,
    dPosition     INTEGER,
    tagClimb      INTEGER,
    climbTag      TEXT,
    cohortZ       REAL,
    spark         TEXT,   -- JSON list of daily rating counts
    rankMove      INTEGER,
    devFollowers  INTEGER
);

CREATE TABLE IF NOT EXISTS tags (
    slug   TEXT PRIMARY KEY,
    label  TEXT
);

CREATE TABLE IF NOT EXISTS game_tags (
    game_id   INTEGER,
    tag_slug  TEXT,
    position  INTEGER,   -- game's rank within that tag, if known (from tagPositions)
    PRIMARY KEY (game_id, tag_slug),
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (tag_slug) REFERENCES tags(slug)
);
""")

for g in games:
    cur.execute("""
        INSERT OR REPLACE INTO games VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        g["id"], g["slug"], g["title"], g["author"], g["url"], g["cover"],
        g["priceCents"], int(g["isFree"]), float(g["stars"]) if g["stars"] else None,
        g["ratings"], g["comments"], g["position"],
        int(g["nsfw"]), g["author_url"], g["tier"],
        g["score"], g["dRatings"], g["dComments"], g["dPosition"],
        g["tagClimb"], g["climbTag"], g["cohortZ"],
        json.dumps(g["spark"]), g["rankMove"], g["devFollowers"]
    ))

    # positions per tag, where available
    positions = {tp["slug"]: tp["position"] for tp in g.get("tagPositions", [])}

    for tag in g["tags"]:
        cur.execute("INSERT OR REPLACE INTO tags VALUES (?, ?)",
                    (tag["slug"], tag["label"]))
        cur.execute("INSERT OR REPLACE INTO game_tags VALUES (?, ?, ?)",
                    (g["id"], tag["slug"], positions.get(tag["slug"])))

conn.commit()
conn.close()
print(f"Saved {len(games)} games to games.db")

```

This is an example of one of my python scripts that uses sqlite3 to query the database and produce a csv file which I then import into Google Sheets to create graphs. <br>
```py
import sqlite3
import pandas as pd

conn = sqlite3.connect("games.db")


pd.read_sql_query("""
    SELECT t.label AS tag, COUNT(*) AS frequency
    FROM (
        SELECT id FROM games ORDER BY score DESC LIMIT 100
    ) top100
    JOIN game_tags gt ON gt.game_id = top100.id
    JOIN tags t ON t.slug = gt.tag_slug
    GROUP BY t.slug
    ORDER BY frequency DESC
""", conn).to_csv("top100_tag_frequency.csv", index=False)

conn.close()
print("Exported: top100_tag_frequency.csv")

```

Next to answer my next questions, again with the help of Claude, I wrote some scripts that would query the database and then return a CSV file which I can load into Google Sheets for easy data visualization. <br>

## Questions:
From the top 100 trending games on itch.io, what's the most popular tag? <br>
![trending_tags](/assets/blog_itch_analysis/trending_tags.png)

Aside from the No-AI tag, the top most popular tags were Romance, Horror, and Dating-Simulator. I would consider Dating-Simulator to be a subgenre under Romance so basically the most popular genre of games on itch.io would be Romance and Horror. In addition to the Romance genre, the most combined subgenres would all be romance related or that hint towards visual novel games. Interactive fiction and multiple endings are commonly associated with visual novels which are narrative based. <br>

Does the number of followers have anything to do with the popularity of the game? <br>
![followers_ratings](/assets/blog_itch_analysis/followers_ratings.png)

Secondly, it looks like the number of followers a developer has on the site may not have anything to do with it's ratings. The blue dots that represent the number of followers are scattered all over the place. This one was inconclusive. <br>

What kinds of tags are combined with the Romance genre in the top 30 games? <br>
![romance_chart](/assets/blog_itch_analysis/romance_chart.png)

What kinds of tags are combined with the horror genre in the top 30 games? <br>
![horror_chart](/assets/blog_itch_analysis/horror_chart.png)

What kinds of tags are combined with the Dating Sim genre in the top 30 games? <br>
![dating_sim_chart](/assets/blog_itch_analysis/dating_sim_chart.png)

Next, the horror genre is interesting because of the subgenres it is combined with. Going through the list we see tags like dating sim, or cute, or interactive fiction. This tells me that horror juxtaposed with something lighter like romance or something adorable makes it interesting to players. Perhaps hiding the horror behind something cute makes it scarier. The thing that stood out to me is dating sim and interactive fiction being so high up. I think since horror and romance at a glance feels like complete opposites, mixing the two genres together makes for interesting story telling. Or it could be relatable since I know for a fact that a lot of people have their own dating horror story in real life and maybe this is a reflection of that.
Now for the dating sim section, based on the combined tags, this genre is more of a mechanic for players to play. <br>


## What does it mean?
In conclusion, I have a hypothesis that if I  wanted to make a game that did moderately well on itch.io, I would have to create a visual novel game that has horror and romance elements. The graphics would have to be cute, 2D and made without AI. Having a dating simulation section would help boost it as well along with character customization. Making it light hearted with horror elements would create an interesting dynamic since they are two opposing genres in stories. But it is important to remember that is is just a hypothesis and is small slice of all of the hard work that goes into making a sucessful game. There's so much that happens behind the scenes and this project has not taken marketing, gameplay, design, passion, etc into account. This project was done out of curiosity and this should only shed light on a small piece of the puzzle of what might make a game interesting to an players. <br>

