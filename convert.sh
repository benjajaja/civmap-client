#!/bin/bash


COUNT=6

echo "convert map.png to 32x256"
convert map.png -bordercolor "#ffffff" -border 204 map_$COUNT.png


# echo "Copy first map"
# cp mapHD.png map_$COUNT.png
#echo "Copy first map"
#cp map.png map_$COUNT.png

LEVELS=$COUNT
LEVEL=1
NEXT=2
while [ $COUNT -gt 1 ];
do
	let LEVEL=LEVELS-COUNT+1
	let NEXT=COUNT-1

	echo "levels/$COUNT/"
	rm -rf levels/$COUNT
	mkdir levels/$COUNT/

	echo "convert map_$COUNT.png -crop 51x51 +repage +adjoin -resize 256x256 levels/$COUNT/tile_%03d.png"
	convert map_$COUNT.png -crop 204x204 +repage +adjoin -resize 256x256 levels/$COUNT/tile_%03d.png

	echo "convert map_$COUNT.png -resize 50% map_$NEXT.png"
	convert map_$COUNT.png -resize 50% map_$NEXT.png

	echo "delete map"
	rm map_$COUNT.png

	let COUNT=COUNT-1
done

python tile.py civcraft2.mbtiles || exit

rm -rf out

mb-util civcraft2.mbtiles out || exit

rm -rf public/tiles/slimecraft

sleep 1

mv out/3.0/civcraft/ public/tiles/slimecraft

