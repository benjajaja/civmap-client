import sqlite3
import os
import glob
import sys
from pprint import pprint

if len(sys.argv) == 1 or sys.argv[1] in ['-h', '--help', 'help', '/?']:
    print "Usage: python create_mbtiles.py mbtiles_output_db"
    quit()

db_name = sys.argv[1]
# probably all mbtiles DBs use 256x256 tile size
tile_size = 256

# remove old mbtiles db if it exists
if os.path.isfile(db_name):
    os.remove(db_name)

conn = sqlite3.connect(db_name)

c = conn.cursor()

# create database schema
c.execute('CREATE TABLE metadata (name text, value text)')
c.execute('CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob)')
# indicies aren't necessary but for large databases with many zoom levels may increase performance
c.execute('CREATE UNIQUE INDEX tile_index ON tiles (zoom_level, tile_column, tile_row)')
c.execute('CREATE UNIQUE INDEX name ON metadata (name)')

# fill metadata table with some basic info
c.execute("INSERT INTO metadata VALUES ('name', 'civcraft')")
c.execute("INSERT INTO metadata VALUES ('type', 'baselayer')")
c.execute("INSERT INTO metadata VALUES ('version', '3.0')")
c.execute("INSERT INTO metadata VALUES ('description', '')")
c.execute("INSERT INTO metadata VALUES ('format', 'png')")
# c.execute("INSERT INTO metadata VALUES ('bounds', '-15000,-15000,15000,15000')")



# which tile sizes we want to use

tilesPerRow = 64
for zoom in [6, 5, 4, 3, 2]:
    tilesPerRow = tilesPerRow / 2
    print "Zoom level %d, tiles per row %d" % (zoom, tilesPerRow)
    
    # tilesPerRow ^ 2 is number of tileXXX.jpg we will process for this zoom level
    for i in range(0, pow(tilesPerRow, 2)):
        y = i / tilesPerRow
        x = i % tilesPerRow
        image = 'levels/%d/tile_%03d.png' % (zoom, (y * tilesPerRow + x))
        # load image and add it to the database
        with open(image, 'rb') as f:
            ablob = f.read()
            # that "tilesPerRow - y - 1" expression is to get y position from bottom, not top
            c.execute("INSERT INTO tiles VALUES (?, ?, ?, ?)", [ zoom, x + (tilesPerRow / 2), tilesPerRow - y - 1 + (tilesPerRow / 2), buffer(ablob)])


# tilesPerRow = 240
# for zoom in [6, 5, 4, 3, 2]:
#     tilesPerRow = tilesPerRow / 2
#     print "Zoom level %d, tiles per row %d" % (zoom, tilesPerRow)
    
#     # tilesPerRow ^ 2 is number of tileXXX.jpg we will process for this zoom level
#     for i in range(0, pow(tilesPerRow, 2)):
#         y = i / tilesPerRow
#         x = i % tilesPerRow

#         dirname = 'public/tiles/%d/%d' % (zoom, x + (tilesPerRow / 2))
#         if not os.path.isdir(dirname):
#             os.makedirs(dirname)

#         source = 'levels/%d/tile_%03d.png' % (zoom, (y * tilesPerRow + x))
#         dest = 'public/tiles/%d/%d/%d.png' % (zoom, x + (tilesPerRow / 2), tilesPerRow - y - 1 + (tilesPerRow / 2))
#         os.rename(source, dest)


conn.commit()
conn.close()

