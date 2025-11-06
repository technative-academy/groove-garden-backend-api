INSERT INTO songs (title, discovered_at)
VALUES ('Jupiter', '1610-01-07'),
       ('Saturn',  '1610-03-25'),
       ('Mars',     NULL);

       
       SELECT
	ARTISTS.NAME AS ARTIST_NAME
FROM
	ARTISTS
WHERE
	ARTISTS.ID = $1