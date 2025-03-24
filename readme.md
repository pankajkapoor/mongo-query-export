# Mongo-query-export

Mongo-query-export is a NodeJS Package for giving the output of a query in csv format.

## Installation

```bash
npm install or npm i
```

## Usage

create an .env file and copy the content form .env.example to .env.

then add your DB string in the .env and update the port if needed.

example =>

```bash
DB_LIST = '{
    "DB_Name" :"mongodb://localhost:27017/test"
}'
```

then start using the command

```bash
npm run dev
```
