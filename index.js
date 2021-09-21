const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const { City, Country, State } = require('./src/db.js');
const fs = require('fs')

conn.sync({ force: false }).then(async () => { 
  if (!(await Country.findAll()).length && !(await State.findAll()).length && !(await City.findAll()).length) { 
    try {

      // Insert countries
      const countries = fs.readFileSync('./src/extras/countries.js', 'utf8')
      await Country.bulkCreate(JSON.parse(countries).map(e => { return { nameLower: e.name.toLowerCase(), nameNormal: e.name, code: e.code, codeBig: e.code3 } }));

      console.log('Countries created')
      
      // Insert states
      const states = JSON.parse(fs.readFileSync('./src/extras/countryStates.js', 'utf-8'))
      for (const firstE of states) {
        try {
          const country = await Country.findOne({ where: { codeBig: firstE.iso3 } })
          if (country) {
            const countryId = country.id;
            for (const e of firstE.states) {
              await State.create({ nameLower: e.name.toLowerCase(), nameNormal: e.name, code: e.state_code, countryId: countryId })
            }     
          }
        } catch (e) {
          console.log(e)
        }
      }

      console.log('States created')

      // Insert cities
      const cities = JSON.parse(fs.readFileSync('./src/extras/countryStateCities.js', 'utf-8'))
      for (const e of cities) {
        try {
          const country = await Country.findOne({ where: { code: e.country } })
          let state = ''
          if (e.state) { state = await State.findOne({ where: { code: e.state, countryId: country.id } }) }
          await City.create({ nameLower: e.name.toLowerCase(), nameNormal: e.name, stateId: state ? state.id : null, countryId: country.id })
        } catch (err) {
          console.log(err)
        }
      }
      
      console.log('Cities created')

    } catch (e) {
      console.log('Se produjo este error al cargar la base de datos', e)
    }
  }

  console.log('Database created')

  server.listen(3001, () => {
    console.log('Server listening at 3001');
  });
});
