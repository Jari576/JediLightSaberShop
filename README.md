# Setup

## install dependencies
run `npm ci`

## run app
run `npm run up`

## add lightsabers to db
```
curl --request POST \
  --url http://localhost:3000/jedisabershop/saber \
  --header 'Content-Type: application/xml' \
  --header 'User-Agent: insomnia/2023.5.8' \
  --data '<sabers>
	<saber>
		<id>4456</id>
		<name>Sith Saber</name>
		<available>27</available>
		<crystal>
			<name>Kadril saber</name>
			<color>blue</color>
		</crystal>
	</saber>
	<saber>
        ...
	</saber>
</sabers>
```
