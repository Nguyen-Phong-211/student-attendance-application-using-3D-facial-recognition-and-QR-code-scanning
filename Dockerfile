FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install django
RUN pip3 install flask
RUN pip3 install flask_cors
RUN pip3 install mysql-connector-python

COPY . /app
WORKDIR /app
EXPOSE 5000
CMD ["python3", "app.py"]
# End of Dockerfile