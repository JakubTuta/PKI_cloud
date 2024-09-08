import asyncio
import random

import websockets

clients_per_room = {}


async def echo(websocket):
    # ip_address = websocket.remote_address[0]
    ip_address = random.randint(0, 1000)

    try:
        message = await websocket.recv()
        room_id = message

        if room_id not in clients_per_room:
            clients_per_room[room_id] = [(ip_address, websocket)]
        else:
            clients_per_room[room_id].append((ip_address, websocket))

        # # message format "sets_team_1:sets_team_2:points_team_1:points_team_2"
        async for message in websocket:
            for client, socket in clients_per_room[room_id]:
                if client != ip_address:
                    await socket.send(message)
    finally:
        print("Client disconnected")


async def main():
    start_server = await websockets.serve(echo, host="0.0.0.0", port=8888)
    await start_server.wait_closed()


asyncio.run(main())
