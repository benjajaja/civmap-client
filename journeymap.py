import os
from subprocess import call
import pdb

def crop(z, x, y, xoffset, yoffset, xdest, ydest):
	if not os.path.exists("public/tiles/8/%d" % (xdest)):
		os.makedirs("public/tiles/8/%d" % (xdest))

	if not os.path.exists("public/tiles/%d/%d/%d.png" % (z, xdest, ydest)):
		call("convert data/master/%d,%d.png \
			-gravity NorthWest -crop 256x256+%d+%d \
			public/tiles/%d/%d/%d.png" % (x, y, xoffset, yoffset, z, xdest, ydest),
			shell=True)
	else:
		call("convert data/master/%d,%d.png \
			-gravity NorthWest -crop 256x256+%d+%d \
			public/tiles/%d/%d/temp_%d.png" % (x, y, xoffset, yoffset, z, xdest, ydest),
			shell=True)
		call("composite \
			public/tiles/%d/%d/temp_%d.png \
			public/tiles/%d/%d/%d.png \
			public/tiles/%d/%d/%d.png" % (z, xdest, ydest, z, xdest, ydest, z, xdest, ydest),
			shell=True)
		# remove temp file:
		os.remove("public/tiles/%d/%d/temp_%d.png" % (z, xdest, ydest))


for y in range(-129, 129):
	print "Level y %d" % y
	for x in range(-129, 129):

		rowSize = 64
		xdest = x + rowSize
		ydest = -y + rowSize - 1

		if not os.path.exists("public/tiles/7/%d" % xdest):
			os.makedirs("public/tiles/7/%d" % xdest)

		rowSize = 128

		if os.path.exists("data/master/%d,%d.png" % (x, y)):

			if not os.path.exists("public/tiles/7/%d/%d.png" % (xdest, ydest)):
				call("convert data/master/%d,%d.png -resize 256x256 public/tiles/7/%d/%d.png" % (x, y, xdest, ydest), shell=True)
			else:
				call("composite data/master/%d,%d.png -resize 256x256 public/tiles/7/%d/%d.png public/tiles/7/%d/%d.png" % (x, y, xdest, ydest, xdest, ydest), shell=True)

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

				if not os.path.exists("public/tiles/%d/%d" % (z, xdest)):
					os.makedirs("public/tiles/%d/%d" % (z, xdest))

				for xoffset in range(0, factor):
					for yoffset in range(0, factor):
						if not os.path.exists("data/master/%d,%d.png" % (x + xoffset, y + yoffset)):
							continue

						command = "composite -gravity NorthWest \
							data/master/%d,%d.png \
							-geometry %dx%d+%d+%d \
							public/tiles/%d/%d/%d.png \
							public/tiles/%d/%d/%d.png" % (
							x + xoffset, y + yoffset,
							tileSize / factor, tileSize / factor, xoffset * tileSize / factor, yoffset * tileSize / factor,
							z, xdest, ydest,
							z, xdest, ydest,
							)
						

						call(command, shell=True)

		
