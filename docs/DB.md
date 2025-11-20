## Database Setup Instructions

### 1. Create the PSQL Database

```sql
 -- Run in psql:
 DROP DATABASE IF EXISTS example_database;
 CREATE DATABASE example_database;

 -- Connect to the database
 \c example_database;
```

### 2. Run the SQL File

Execute the SQL script to set up tables and data:
in psql:

```sql
\i example_database_code/examples.sql
```

Or outside of psql:

```bash
psql example_database -f example_database_code/examples.sql
```
