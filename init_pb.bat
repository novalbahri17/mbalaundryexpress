@echo off
pocketbase.exe superuser create admin@mba-laundry.com Admin12345!
pocketbase.exe serve --http="127.0.0.1:8090" --dir="./pocketbase/pb_data"
