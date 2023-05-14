
import asyncio
import aiohttp
import asyncpg
from aiohttp import web
import yake

async def create_connection() -> asyncpg.Connection:
    """
    :rtype: asyncpg.Connection
    """
    conn = await asyncpg.connect(user="postgres", password="projecteassiA", database="hackupc2023", host="xocolatina.es", port="5432")
    return conn


async def get_username(user_id:str) -> int:
    async with create_connection() as conn:
        values = await conn.fetch(
            """SELECT user_name FROM Users WHERE ids=%s""", (user_id,)
        )
    return values


async def get_user_id_from_topic_id(topic_id: int) -> int:
    async with create_connection() as conn:
        values = await conn.fetch(
            """SELECT user_id FROM Topic WHERE ids=%s""", (topic_id,)
        )
    return values

