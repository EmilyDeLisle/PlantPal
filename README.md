# PlantPal

Plants are most often killed not by neglect, but but overwatering, which causes root rot. Sometimes it's difficult to remember exactly the last time a plant was watered.

This app allows users to add their houseplants to a database and keep track of the days they've watered them. They can open the app on a day they are watering a plant, tap the plant's water icon, then view all the different days all their plants have been watered in the calendar view.

This app uses Firebase Realtime Database for data management and is served up using Node.js with Express and Firebase Cloud Functions. The calendar runs on the FullCalendar library. Other frameworks used include Bootstrap, jQuery, and jQuery UI.

Update Apr 22, 2019, Version 2.0:

New:

- Plant info popup modal now appears when plant name is clicked. Contains information on past watering events and has edit/delete functions for individual plants
- Average plant watering interval calculation
- Edit plant name function
- Delete plant function

Future features planned:
- Add/delete past watering events
- Undelete plant feature
- Adjust time period for calculating watering interval

Login page background photo by Annie Spratt on Unsplash

Home page background photo by Bart Zimny on Unsplash