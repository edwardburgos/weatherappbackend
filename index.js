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

      // Insert states
      const states = JSON.parse(fs.readFileSync('./src/extras/countryStates.js', 'utf-8'))
      states.forEach(firstE => {
        try {
          const country = await Country.findOne({ where: { codeBig: firstE.iso3 } })
          if (country) {
            const countryId = country.id;
            firstE.states.forEach(e => {
              await State.create({ nameLower: e.name.toLowerCase(), nameNormal: e.name, code: e.state_code, countryId: countryId })
            })
          }
        } catch (e) {
          console.log('Sorry this error ocurred while loading the states', e)
        }
      });

      // Insert cities
      const cities = JSON.parse(fs.readFileSync('./src/extras/countryStateCities.js', 'utf-8'))
      cities.forEach(e => {
        try {
          const country = await Country.findOne({ where: { code: e.country } })
          let state = ''
          if (e.state) { state = await State.findOne({ where: { code: e.state, countryId: country.id } }) }
          await City.create({ nameLower: e.name.toLowerCase(), nameNormal: e.name, stateId: state ? state.id : null, countryId: country.id })
        } catch (e) {
          console.log('Sorry this error ocurred while loading the cities', e)
        }
      })

    } catch (e) {
      console.log('Sorry, this error ocurred', e)
    }
  }

  server.listen(3001, () => {
    console.log('Server listening at 3001');
  });
});
