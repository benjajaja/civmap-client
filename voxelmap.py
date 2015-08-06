import os
from subprocess import call
import pdb
import sys
import shutil

if os.path.exists("public/biomes"):
	shutil.rmtree("public/biomes")
os.makedirs("public/biomes")
if os.path.exists("public/height"):
	shutil.rmtree("public/height")
os.makedirs("public/height")

def update_progress(progress):
    barLength = 20 # Modify this to change the length of the progress bar
    block = int(round(barLength*progress))
    text = "\rComplete: [{0}] {1}%".format( "="*block + " "*(barLength-block), round(progress*100))
    sys.stdout.write(text)
    sys.stdout.flush()

def generate(out, inf):
	print "generate: %s" % out

	size = 129
	for y in range(size * -1, size):
		update_progress(float(y + size + 1) / (size * 2))
		for x in range(size * -1, size):

			rowSize = 128
			xdest = x + rowSize
			ydest = -y + rowSize - 1

			rowSize = 256

			if os.path.exists("%s/%d,%d.png" % (inf, x, y)):
				if not os.path.exists("%s/8/%d" % (out, xdest)):
					os.makedirs("%s/8/%d" % (out, xdest))

				shutil.copyfile("%s/%d,%d.png" % (inf, x, y),  "%s/%d/%d/%d.png" % (out, 8, xdest, ydest))


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

generate("public/height", "voxelmap/height")
generate("public/biomes", "voxelmap/biomes")
print "finished."