# rpg-minitool
Very simple, opinionated tool to help the virtual tabletop game master keep track of players's skirmishes and quest progresses. Based on Settore 4 RPG ruleset, can be customized with little effort to match almost any Role Playing Game System.
## Start
It is a normal html page with pure js and _yarn_ to handle packages. No databases
Just type 
```bash
yarn install
```
## Usage
- Serve turn.html with a web server of your liking (like XAMP) and you're good to go :)
- Once the page is loaded, you may want to import `example-heroes.json` and then `example-encounter.json` to see the thing in action
## Functions
The interface is divided into tabs and there is a share upper section.
### Shared upper section
Here you can import the characters of a skirmish from a .json file OR save them to a json file. 
This file can be man-made or saved by rpg-minitool.
Import is _incremental_. That means the tool will only import characters that don't have an already existing internalName. This feature can be used in smart ways (i.e. preserving some data for future use in the game, such as players' stats between combats/skirmishes). Moreover, you can make .json file including a single type of creature just to add it to the combat.
There is a turn tracker. The value associated to this circle is shown and will be saved together with the encounter .json information (this can be useful if your group plans to resume the combat in a future GM session).
The system also provides a basic battlefield, which is quite specific to Settore 4 Rpg system but it closely resembles a chess board. With some understanding of javscript, you can customize it by changing the number of tiles and the predefined tokens.
### Combat tab
Here you can keep a basic tracking of the fighting order and the characters' battle stats. For an extensive record of all a player's attributes, even those that are of no use in battle, at the moment I suggest to combine this tool with a google sheet.
You can drag and drop characters to order them to your liking, and highlight one of them. If you change the life points, the software updates the Health bar based on the Life / Maximum Life ratio. You can also remove a character from combat.
### Details tab
Here you can simply add some more information about the characters, in a very simple style. 
### Quest tab
Here you can add quests and subquests in a todo-list, mark them as done or remove them. The list will be saved separatedly in your browser with integrated localStorage and loaded automatically. 
## Roadmap
- Add dice rolls
- (done) Manipulate characters' conditions in a more useful way
- Import/export locally stored quests on several slots
- (done) make the battlefield
