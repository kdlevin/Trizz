Trizz
=====
he game is called Trizz and consists of a competition between two players to see who finishes the puzzle before.
To play the game you can either create or join a session. In case you create a session you need to share the session ID with you opponent. Once your opponent joins, you can start moving with the arrow keys and picking squares with the space bar. These are the rules of the game:

    The board is divided in four zones, a home base and puzzle zone for each player.

    The creator of the session is the red player and plays on the left, the joined player is the blue player and plays on the right.

    The first player to fill the orange delimited zone of its puzzle zone with grey squares wins. There cannot be any grey square in the puzzle zone outside the orange delimited zone.

    For the puzzle to be considered finished the player must not be holding any square.

    The player can enter into the opponent puzzle zone but only if he is holding a square.

    The player can then leave the square and pick one of the squares in the opponent's puzzle zone, this square can only be dropped in the player zones.

    Squares taken from one player's field to the other change their color.

    The player can never enter the opponent's home base.

    New squares appear periodically on the broken line zone in the player's home base but only if the cell is empty


![Alt text](/screenshots/screenshot1.jpg "Playing Trizz")

The game is developed in javascript both on the client and the server side. The server is implemented with node.js and serves the webpage and using websockets manages the game sessions
