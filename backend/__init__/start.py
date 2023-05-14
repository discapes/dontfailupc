
import asyncio
import aiohttp
import asyncpg
import jwt 
from aiohttp import web
import yake
from database import *

host = "0.0.0.0"
port = "8080"


async def hello(request):
    return web.Response(text="MyLittlePony", status=400)

async def login(request):
    if request.method == "GET":
        pass
    
        

app = web.Application()
app.add_routes([
    web.get(r"/{topic:.*}", hello),
    ])


if __name__=="__main__":
    web.run_app(app,host=host,port=port)

