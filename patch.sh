#!/bin/bash

for y in `seq -30 30`; do
	for x in `seq -30 30`; do
		if [ -f "/home/benja/.minecraft/journeyMap/data/mp/mc.civcraft.vg_0/DIM0/day/$x,$y.png" ]
		then
			echo "convert mapHD.png -repage +$x+$y /home/benja/.minecraft/journeyMap/data/mp/mc.civcraft.vg_0/DIM0/day/$x,$y.png mapHD.png"
			convert mapHD.png -repage +$x+$y /home/benja/.minecraft/journeyMap/data/mp/mc.civcraft.vg_0/DIM0/day/$x,$y.png mapHD.png
			exit
		fi
	done
done