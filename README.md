# zhdiary-app

A fully-offline flashcard app for recording "中文 diary"

## Get the pre-built app

See <https://github.com/patarapolw/zhdiary-app/releases>

## Run from source code / run in the browser

- Clone the git from GitHub
- `yarn install`, `yarn run build` and `yarn start`. The web browser will be automatically opened.
- `yarn run dev` to run in development mode (i.e. you can edit the code, live).

## Search bar ("query language") reference

- `is:new` to get new flashcards
- `is:pool` to get non-autocreated flashcards
- `is:leech` to get `srsLevel=0` flashcards
- `is:due` to get `due=NOW` flashcards
- `is:marked` to get `tag:marked` flashcards
- Use `OR` to join inclusive OR clauses
- Parentheses (`()`) are also supported
- For more, see [/src/backend/db/MongoQParser.ts](/src/backend/db/MongoQParser.ts)

## Resources

- Chinese-English dictionary from <https://www.mdbg.net/>
- Example sentences from <https://tatoeba.org/>
- Categorical vocabularies entered manually from local bookstores

## Screenshots

![](/screenshots/quiz0.png)

![](/screenshots/quiz1.png)

![](/screenshots/editor1.png)

## Related projects

- <https://github.com/patarapolw/rep2recall>
