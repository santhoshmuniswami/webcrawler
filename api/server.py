import requests
import logging
from bs4 import BeautifulSoup
from requests.compat import urljoin
from requests.compat import urlparse
from flask import Flask, redirect, url_for, request
from flask import jsonify
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
#app.config['CORS_HEADERS'] = 'application/json'

#CORS(app)
app.config["DEBUG"] = True


# Here to Create a custom logger
logger = logging.getLogger(__name__)

# Creating handlers here
console_handler = logging.StreamHandler()
file_handler = logging.FileHandler('Debug.log','w')
console_handler.setLevel(logging.WARNING)
file_handler.setLevel(logging.ERROR)


# Here Creating formatter & adding it to the handlers
console_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_format)
file_handler.setFormatter(file_format)

# Here Adding handler to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)



#Function definition to crawl website
def crawlweb(page, WebUrl, domain):

    myjson={}
    myjson[WebUrl]={}

    #list of path is an array of paths crawler has return
    listofpaths=[]

    #different domain is an array of paths which comes under different domain than the requested domain
    different_domain_lists=[]

    if(page>0):

        #url has the webURL to crawl
        url = WebUrl

        try:
            #code receives the output of the requested URL
            code = requests.get(url)
        except:
            print("I couldn't fetch the URL ! Please check the URL")
            errorresponse=["I couldn't fetch this URL. Please check the url!"]
            logging.error("Unable to fetch URL!")
            return errorresponse

        # Converting it to plain text to parse
        plain = code.text
        # print(plain)

        #variable s stores the parsed HTML
        s = BeautifulSoup(plain, "html.parser")

        #Finding links in the requested URL using anchor tag
        for link in s.findAll('a'):
            tet_2 = link.get('href')

            extractedURLvalue=urlparse(tet_2)

            append_www="www."+domain
            if extractedURLvalue[1] == domain or extractedURLvalue[1] == '' or extractedURLvalue[1] == '/' or extractedURLvalue[1] == append_www:
                listofpaths.append(extractedURLvalue[2])
            else:
                different_domain_lists.append(extractedURLvalue[1]+extractedURLvalue[2])


        #Removing empty values
        while '' in listofpaths:
            listofpaths.remove('')

        consolidatedPaths=set(listofpaths)

        listOfConsolidatedPaths= list(consolidatedPaths)
        if(len(listOfConsolidatedPaths)==0 and len(different_domain_lists) > 0):
            listOfConsolidatedPaths=different_domain_lists

        return listOfConsolidatedPaths


#Receives POST request and crawls it

@app.route('/sitemap',methods = ['GET', 'POST'])
def login():
   if request.method == 'POST':
      print("Request received at "+str(datetime.now()))
      logging.info('Request received')

      url = request.get_json()
      if 'url' not in url:
          #raise ValueError("Please pass the URL in the payload")

          data = {"error":"Please pass the URL in the payload"}
          logging.error("User has not passed URL in payload")
          #js = json.dumps(data)

          #resp = Response(js, status=400, mimetype='application/json')
          return jsonify(data)

      #my URL get the URL user requested
      myurl = url['url']
      parsedURLValue = urlparse(myurl)

      domain_name = parsedURLValue[1]
      protocalType = parsedURLValue[0]
      domainname=parsedURLValue[1]
      if(parsedURLValue[0]==''):
          protocalType='http'
          domainname=parsedURLValue[2]
          domain_name=parsedURLValue[2]

      actualURL = protocalType + "://" + domainname


      #calling webcrawl function
      logging.info("Crawling starts...!")
      try:
        finalresponse=crawlweb(1, actualURL, domain_name)
      except:
          finalresponse=["Internal Server Error!"]
          logging.error("Crawler call failed")
          print(finalresponse)
          return jsonify(finalresponse)

      logging.info("Response sent")
      #returns list of paths that domain user requested
      return jsonify(finalresponse)

   else:

      #If the request is get method, notifying user!
      return "There is no GET method available!"

if __name__ == '__main__':
   app.run(port=5000)

