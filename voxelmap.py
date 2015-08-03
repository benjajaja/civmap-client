import os
from subprocess import call
import pdb
import sys
import shutil

def generate(out, inf):
	print "generate: %s" % out;

	for y in range(-129, 129):
		pct = 258 / (y + 129) * 100;
		sys.stdout.write("\r%d%%" % pct);
    	sys.stdout.flush();
		for x in range(-129, 129):

			rowSize = 128
			xdest = x + rowSize
			ydest = -y + rowSize - 1

			rowSize = 256

			if os.path.exists("%s/%d,%d.png" % (inf, x, y)):
				if not os.path.exists("%s/8/%d" % (out, xdest)):
					os.makedirs("%s/8/%d" % (out, xdest));

				shutil.copyfile("%s/%d,%d.png" % (inf, x, y),  "%s/%d/%d/%d.png" % (out, 8, xdest, ydest));


			factor = 1
			tileSize = 256
			rowSize = 128
			for z in range(7, 1, -1):
				factor *= 2

				if x % factor == 0 and y % factor == 0:
					rowSize /= 2
					xdest = x / factor + rowSize
					ydest = -y / factor + rowSize - 1

					for xoffset in range(0, factor):
						for yoffset in range(0, factor):
							if not os.path.exists("%s/%d,%d.png" % (inf, x + xoffset, y + yoffset)):
								continue

							if not os.path.exists("%s/%d/%d" % (out, z, xdest)):
								os.makedirs("%s/%d/%d" % (out, z, xdest))

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


generate("public/height", "voxelmap/height");
generate("public/biomes", "voxelmap/biomes");