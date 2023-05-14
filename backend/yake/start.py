
import asyncio
import aiohttp
from aiohttp import web
import cryptography
import asyncpg
import jwt
import base64
import json
from aiohttp_jwt import *
from ai_yake import *
import jwt 
from database import *

host = "0.0.0.0"
port = "8080"


async def hello(request):
    token = request.cookies.get("id_token")
    if not await  verify_token(token):
        return web.Response(text="MyLittlePony", status=400)
    else:
        return web.Response(text="It works!", status=200)


async def verify_token(token):
    try:
        decoded = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
        return True
    except:
        return False


async def get_elements_topic(request):
    chocolate_cooky = request.cookies("id_token")
    if await verify_token(chocolate_cooky):
        elements = await get_elements_from_topic_id(request.path)
        return elements
    else:
        return web.Response(text="Not found",status=404)


async def do_compare_texts(request):
    data = request.json()
    score = await compare_texts(data["source"],data["note"])
    return web.json_response({"score":score})










#async def verify_token(request):
#    return web.json_response({"id_token": request["payload"]})




    
        

app = web.Application(
middlewares=[JWTMiddleware("oZYDw0t10huKjpWrMXq5GRuaeEG_sSDUfhh0dFvnkRdixstLg7WPkbCrWc09K00w"),])

app.add_routes([
    web.get(r"/{topic:.*}", hello),
    web.post("/get_score", do_compare_texts),
    ])


if __name__=="__main__":
    web.run_app(app,host=host,port=port)

