import flask
from flask import jsonify
from ai_yake import *


app = flask.Flask(__name__)

@app.route("/get_score", methods=["POST"])
def get_score():
    if flask.request.method == "POST":
        data = flask.request.get_json()
        source = data.get("source")
        note = data.get("note")
        score = compare_texts(str(source),str(note))
        dictt = {"score":score}
        return dictt
    else:
        return flask.response(200)


if __name__== "__main__":
    app.run()
