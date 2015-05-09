Civcraft Map
============

![](http://txapu.com/img/logo.png)

This is the repo of the civcraft map currently located at http://txapu.com.

The map is the combination of an older compilation of low-res tiles from civcraft.slimecraft.eu and a newer compilation of hi-res journeymap tiles.

The map tileset is at `public/tiles/` and can be used with any XYZ tile (slippy) map such as OpenLayers. It does not contain tiles for 100% of the map, but it is getting more complete as more players map out the civcraft world and submit their data.

The journeymap "master" tileset is at data/master. These tiles are in journeymap format (size and naming scheme), to add a player's journeymap tiles to it it has to be merged. When that is done, you can generate the map tilesets for all zoom levels with `journeymap.py`.

## How to contribute imagery

You can add what you have mapped with journeymap. Go to your journeymap folder, usually  `.minecraft/journeyMap/data/mp/<civcraft>` where `<civcraft>` is a placeholder for whatever journeymap created, it seems that in latest versions it is whatever you named the server in the server list in-game. From there, enter `DIM0` and create an archive of `day`. An example of a full path would be `.minecraft/journeyMap/data/mp/civcraft_0/DIM0/day`. That folder *only* contains your tiles and not your waypoints or other irrelevant but potentially sensitive data.

You should then post an issue in this repo stating that you have imagery in the issue title, and a download link (google drive, dropbox, mediafire...) to the archive.

## How to contribute overlay data

### Points (cities, towns, POI)

Also to be submitted as issues (one issue per entry) in this repo.  
For points, you must include:

* Type (city, town...)
* Name
* Coordinates in this format: `x,y` e.g. `-1000,3400`
* Flag image link, preferrably "imgur" about 200x100 pixels

Additionally you can optionally include the following info: 

* Subreddit
* Market link if any (only if your city has an actual market site that is used)
* Nether portal with specific coordinates, and optional description if coordinates are not sufficient
* Desired two-letter code
* If place is abandoned

### Rails

Create an issue with an image with the rails drawn over the map. Rails MUST follow exact underground path. A rail addition may take longer if it is considered necessary to be verified in person (in game).

### How long will it take?

I will try to update *at least* once a month. The merger process is complicated and uses file modification times to decide how to add images, and since git does not track file mtimes, each time an archive must be created previous merge in case there is bad data.


## Land claims

**tl;dr** to add a land claim you have to do all the work yourself, and do it perfectly

First off, adding land claims is not for the faint of heart. You will have to read through this guide carefully. You will have to draw your claims on the existing svg following extremely strict both technical and aesthetical guidelines. You will have to use git to clone and add your modifications, and use github to create a pull request, which will then be reviewed, and then accepted *only* if there are absolutely no technical or visual faults, and no disputes.

If you are not familiar with git, you will most likely need the aid of somebody that is. Understanding of the markup structure of SVG files is also required.

### Land claims: prerequisites

* A github account
* Local git installation
* Relevant nation, state, country or entity must have a city already on map (if not, first request city to be added)

### Land claims: git contribution guideline

The `.svg` files are located in `public/img/`, **the format must be "plain svg". Any other format WILL generate garbage and your pull request will then NOT BE ACCEPTED.**

* Fork this repo
* Clone your fork on your machine with git.
* Edit `claims_bg.svg` to your likings (see below for how). That file contains a somewhat recent background image of the map so you can draw over real terrain.
* When ready, save `claims_bg.svg`
* Delete background image, then save copy as `claims.svg` (but do not save `claims_bg.svg` with the background removed). The two files must not differ *in markup* except for the background image. Tip: in inkscape, the process is save, delete background image, save copy as `claims.svg`, undo. This way you can preview you claims on txpau.com if you want (see below).
* Preview you changes (teh diff) with your favourite git-diff-tool: **the ONLY changes MUST be new `<path/>` tags. If anything else shows up, fix it or don't even bother continuing**.
* Add your changes to git. Git's diff doesn't lie - if you don't understand why there are additional changes, you may want to copy your new claim's path, reset the file and reinsert it, or get someone familiar with git and svg files to do it.
* Commit with relevant message, e.g. "Add Hoogabooga land claims".
* Push to your fork.
* Create pull request from your fork with github.
* Check back for comments on your pull request regarding any technical problems, style problems, and land claim disputes.
* **Be prepared to go back to editing and doing the demanded changes**, and also be ready to use git to clean your git history.

### Land claims: svg technical guideles

I strongly recommend to use [inkscape](https://inkscape.org/) - it is free to use and download. In any case **you MUST save as plain .svg.** and **you MUST NOT create irrelevant svg elements like groupings**.

* The ONLY change that must appear in the `.svg` files are one or more new paths for your land claims.
* The paths must ONLY have "d", "id" and "style" attributes.
* The "style" attribute must ONLY have fill and stroke related properties.
* You may have to clean up the svg's markup manually! Again git won't let anything slip through.

### Land claims: svg aesthetical guidelines

* The land claim must have a solid color, distinct of all bordering claims
* The land claim must not claim water masses, except inner lakes and rivers
* The path must NOT have an excess of edges/detail (do not draw borders in freehand mode "by hand" by dragging a pen tool - instead draw as a polygon)
* The level of detail MUST match the existing land claims, e.g. Orion

*Haven is an exception, no other land claims in that style will be accepted*

### Land claims: how to preview your svg (or, technically, any svg overlay)

Open `http://txapu.com/?svg=file:///your/local/path/to/claims.svg` in your browser.

### Land claims: disputing claims

To dispute another claim, the best moment is during the window of time when the pull request is open. Simply comment on the pull request. If you click the "watch" button on top, you will get notified when new pull request come in.

To dispute merged claims (already on txapu.com), you must can either create a pull request fixing it where you have to notify the author of the claims (with @username), or create an issue in this repo with the details.


---

## Building the client for local development and code contribution

### JourneyMap master tiles

**See https://github.com/gipsy-king/civmap-journeymap submodule for further info if you want to contribute**, read along if you want to build tiles yourself.

To add a player's data, put the journeymap tiles at `data/<name>` and run `python merge.py <name>` (from inside `data/`, `cd data`). This will merge the player's tiles into the master tileset. New tiles will be copied, and if alreadyexisting, tiles will be placed above or below depending on timestamp (newer on top). This prevents newer master tiles being overwritten by an older tileset.

You can also force a tileset to be below no matter what timestamp with `python merge.py <name> under`, in case the texture colors vary slightly and you do not want to overwrite existing "good" pixels. The same applies for `over`.

When done, the master tileset is ready to be used to generate the map tileset, and could also be copied back to journeymap so that you can use them in-game.

To commit changes, you must commit them *to the submodule* from `data/`.

### Map tilesets

Run `python journeymap.py` from the repo root, and go plant some potatoes because it will take a while: the journeymap master tiles from `data/master` will be inserted on top of all existing map tiles inside `public/tiles/x/y/z.png`.

Under normal circumstances it should not be necessary to commit changes to this repo, you may use `journeymap.py` to preview your previously merged tileset.

### Add other data

Edit `cities.geojson` or `rails.geojson`. The structure of the "JSON objects" are in GeoJSON format.

There is a tool built into the web client to place cities and rails, simply insert the result into the corresponding `.geojson` file.

### How to clone this repo

This repo contains only the static client files except the tiles, and the scripts for generating tiles and building the JS. However, the map tiles and the journeymap master tileset are added as submodules at `data` and `public/tiles` respectively.

Clone the repo as usually and then

    git submodule init
    git submodule update --remote

You must have git version above 1.8.2 (for the `--remote` flag to work), and always use the `--remote` flag or yoou will have to deal with submodules being in a "detached HEAD" state, which makes working on them a nuisance.
