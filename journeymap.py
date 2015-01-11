import os
from subprocess import call
import pdb
import sys
import shutil

night = False
out = "public/tiles"
inf = "data/master"
replace = ""
if len(sys.argv) == 2 and sys.argv[1] == "night":
	night = True
	out = "public/night"
	inf = "data/master-night"
	replace = "-fill black -opaque '#080b41'"

def crop(z, x, y, xoffset, yoffset, xdest, ydest):
	if not os.path.exists("%s/8/%d" % (out, xdest)):
		os.makedirs("%s/8/%d" % (out, xdest))

	#if not os.path.exists("%s/%d/%d/%d.png" % (out, z, xdest, ydest)):
	call("convert %s/%d,%d.png \
		%s \
		-gravity NorthWest -crop 256x256+%d+%d \
		%s/%d/%d/%d.png" % (inf, x, y, replace, xoffset, yoffset, out, z, xdest, ydest),
		shell=True)
	# else:
	# 	call("convert %s/%d,%d.png \
	# 		%s \
	# 		-gravity NorthWest -crop 256x256+%d+%d \
	# 		%s/%d/%d/temp_%d.png" % (inf, x, y, replace, xoffset, yoffset, out, z, xdest, ydest),
	# 		shell=True)
	# 	call("composite \
	# 		%s/%d/%d/temp_%d.png \
	# 		%s/%d/%d/%d.png \
	# 		%s/%d/%d/%d.png" % (out, z, xdest, ydest, out, z, xdest, ydest, out, z, xdest, ydest),
	# 		shell=True)
	# 	# remove temp file:
	# 	os.remove("%s/%d/%d/temp_%d.png" % (out, z, xdest, ydest))


for y in range(-129, 129):
	print "Level y %d" % y
	for x in range(-129, 129):

		rowSize = 64
		xdest = x + rowSize
		ydest = -y + rowSize - 1

		if not os.path.exists("%s/7/%d" % (out, xdest)):
			os.makedirs("%s/7/%d" % (out, xdest))

		rowSize = 128

		if os.path.exists("%s/%d,%d.png" % (inf, x, y)):

			#if not os.path.exists("%s/7/%d/%d.png" % (out, xdest, ydest)):
			call("convert %s/%d,%d.png %s -resize 256x256 %s/7/%d/%d.png" % (inf, x, y, replace, out, xdest, ydest), shell=True)
			# else:
			# 	call("composite %s/%d,%d.png -resize 256x256 %s/7/%d/%d.png %s/7/%d/%d.png" % (inf, x, y, out, xdest, ydest, out, xdest, ydest), shell=True)

			crop(8, x, y, 0, 0, x * 2 + rowSize, -y * 2 + rowSize - 1)
			crop(8, x, y, 256, 0, x * 2 + rowSize + 1, -y * 2 + rowSize - 1)
			crop(8, x, y, 0, 256, x * 2 + rowSize, -y * 2 + rowSize - 1 - 1)
			crop(8, x, y, 256, 256, x * 2 + rowSize + 1, -y * 2 + rowSize - 1 - 1)

		factor = 1
		tileSize = 256
		rowSize = 64
		for z in range(6, 1, -1):
			factor *= 2

			if x % factor == 0 and y % factor == 0:
				rowSize /= 2
				xdest = x / factor + rowSize
				ydest = -y / factor + rowSize - 1

				if not os.path.exists("%s/%d/%d" % (out, z, xdest)):
					os.makedirs("%s/%d/%d" % (out, z, xdest))

				for xoffset in range(0, factor):
					for yoffset in range(0, factor):
						if not os.path.exists("%s/%d,%d.png" % (inf, x + xoffset, y + yoffset)):
							continue

						if os.path.exists("%s/%d/%d/%d.png" % (out, z, xdest, ydest)):
							command = "composite -gravity NorthWest \
								%s/%d,%d.png \
								-geometry %dx%d+%d+%d \
								%s/%d/%d/%d.png \
								%s/%d/%d/%d.png" % (
								inf, 
								x + xoffset, y + yoffset,
								tileSize / factor, tileSize / factor, xoffset * tileSize / factor, yoffset * tileSize / factor,
								out, z, xdest, ydest,
								out, z, xdest, ydest,
								)
						else:
							command = "composite -gravity NorthWest \
								%s/%d,%d.png \
								-geometry %dx%d+%d+%d \
								blank256.png \
								%s/%d/%d/%d.png" % (
								inf, 
								x + xoffset, y + yoffset,
								tileSize / factor, tileSize / factor, xoffset * tileSize / factor, yoffset * tileSize / factor,
								out, z, xdest, ydest,
								)

						

						call(command, shell=True)
						if night:
							call("convert %s %s/%d/%d/%d.png tmp.png" % (replace, out, z, xdest, ydest), shell=True)
							shutil.copyfile("tmp.png",  "%s/%d/%d/%d.png" % (out, z, xdest, ydest))
							os.remove("tmp.png")
