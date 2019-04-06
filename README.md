## Crawl my website !

In the project directory, you can run:

### `npm install`

To install all the node modules required to run this project. 

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:9000](http://localhost:9000) to view it in the browser.

### Backend services

Backend code is written in python flask. To run, you have to open another cli and run following command in the same directory.

### `python server.py`

To fetch the data from backend services using rest client, use address as http://localhost:5000/sitemap also you have to use header as application/json, payload in json format with the key of `url`. 
Eg.  
{
 "url":"http://redhat.com"
}
