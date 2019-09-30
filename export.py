#!/usr/bin/python
import pyexiv2

try:
  # Open the photo file.
  photo = './photo/IMG_20190803_142314.jpg'
  md = pyexiv2.ImageMetadata(photo)
  md.read()

  # Read the GPS info.
  latref = md['Exif.GPSInfo.GPSLatitudeRef'].value
  lat = md['Exif.GPSInfo.GPSLatitude'].value
  lonref = md['Exif.GPSInfo.GPSLongitudeRef'].value
  lon = md['Exif.GPSInfo.GPSLongitude'].value

except:
  print "No GPS info in file %s" % photo
  sys.exit()

# Convert the latitude and longitude to signed floating point values.
latitude = float(lat[0]) + float(lat[1])/60 + float(lat[2])/3600
longitude = float(lon[0]) + float(lon[1])/60 + float(lon[2])/3600
if latref == 'S': latitude = -latitude
if lonref == 'W': longitude = -longitude

print latitude
print longitude
