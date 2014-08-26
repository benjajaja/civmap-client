Civcraft Map
============

This is the repo of the civcraft map currently located at http://txapu.com.

The map is the combination of an older compilation of low-res tiles from http://civcraft.slimecraft.eu/map.php?z=4&y=-11145&x=-820 and a newer compilation of hi-res journeymap tiles.

The map tileset is at `public/tiles/` and can be used with any XYZ tile (slippy) map such as OpenLayers. It does not contain tiles at all zoom levels or places, but it is getting more complete as more players map out the civcraft world and submit their data.

The journeymap "master" tileset is at data/master. These tiles are in journeymap format (size and naming scheme), to add a player's journeymap tiles to it it has to be merged. When that is done, you can generate the map tilesets for all zoom levels with `journeymap.py`.

### JourneyMap master tiles

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
