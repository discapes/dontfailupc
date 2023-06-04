FROM python 
RUN pip install yake flask waitress
EXPOSE 5000
COPY . .
CMD waitress-serve --port 5000 flask_app:app