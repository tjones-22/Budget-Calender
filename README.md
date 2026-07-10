


## database

# commands for initializing prisma with sqlite 

1.
npm install prisma -D
npx prisma init --datasource-provider sqlite
npm install @prisma/client
npm install @prisma/adapter-better-sqlite3 better-sqlite3
npx prisma generate

2.
To run a migration
npx prisma migrate dev --name init

NOTE: change the datasource.url to "file:/prisma/app.db"