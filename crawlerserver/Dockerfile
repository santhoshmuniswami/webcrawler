FROM python:stretch

WORKDIR /home

COPY webcrawler/api/ ./

RUN pip install -r requirement.txt

EXPOSE 5000

CMD [ "python", "server.py" ]

