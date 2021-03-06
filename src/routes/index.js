const { Router } = require('express');
const axios = require('axios').default;
const { Country, City, State } = require('../db.js');
const { Op } = require('sequelize');
const router = Router();

// This route allows us to get the cities by name
router.get('/cities', async (req, res, next) => {
    try {
        let { name, country } = req.query
        let cities = { data: '' }
        if (country) {
            country = await Country.findOne({ where: { code: country } })
            cities = await City.findAll({ attributes: ['nameLower', 'nameNormal', 'stateId', 'countryId'], where: { nameLower: { [Op.substring]: name.toLowerCase() }, countryId: country.id }, include: [{ model: Country, attributes: ['code', 'nameNormal'] }, { model: State, attributes: ['nameNormal', 'code'] }] })
        } else {
            cities = await City.findAll({ attributes: ['nameLower', 'nameNormal', 'stateId', 'countryId'], where: { nameLower: { [Op.substring]: name.toLowerCase() } }, include: [{ model: Country, attributes: ['code', 'nameNormal'] }, { model: State, attributes: ['nameNormal', 'code'] }] })
        }
        if (cities) {
            const filterCities = cities.filter(e => e.nameLower === name.toLowerCase()).length ? cities.filter(e => e.nameLower === name.toLowerCase()) : cities;
            res.send([...new Set(filterCities.map(e => JSON.stringify({ name: e.nameNormal, state: e.state ? { code: e.state.code, name: e.state.nameNormal } : null, country: { code: e.country.code, name: e.country.nameNormal } })))].map(e => JSON.parse(e)).slice(0, 10))
        } else { res(404).send(`There is no city called ${name}`); }
    } catch (e) {
        next();
    }
})

// This route allows us to get all the countries
router.get('/countries', async (req, res, next) => {
    try {
        const countries = await Country.findAll();
        res.send(countries.map(e => { return { name: e.nameNormal, code: e.code } }))
    } catch (e) {
        next()
    }
});

// This route allows us to get the names of state and country with their codes
router.get('/stateCountryName', async (req, res, next) => {
    const { countryCode, stateCode } = req.query;
    try {
        const country = await Country.findOne({ where: { code: countryCode } })
        if (stateCode) {
            const state = await State.findOne({ where: { code: stateCode, countryId: country.id } })
            res.send({ countryName: country.nameNormal, stateName: state.nameNormal })
        } else {
            res.send({ countryName: country.nameNormal, stateName: '' })
        }
    } catch (e) {
        next()
    }
})

// This route allows us to get the codes of state and country with their names
router.get('/stateCountryCode', async (req, res, next) => {
    const {stateName, countryName} = req.query
    try {
        const country = await Country.findOne({ where: { nameNormal: countryName } })
        if (stateName) {
            const state = await State.findOne({ where: { nameNormal: stateName, countryId: country.id } })
            res.send({ countryCode: country.code, stateCode: state.code })
        } else {
            res.send({ countryCode: country.code, stateCode: '' })
        }
    } catch (e) {
        next()
    }
})

// This route allows us to get the state code of a city if the latter has one
router.get('/cityHasState', async (req, res, next) => {
    const {city, stateName, countryCode} = req.query
    try {
        const country = await Country.findOne({ where: { code: countryCode } })
        const state = await State.findOne({ where: { nameLower: stateName.toLowerCase(), countryId: country.id } })
        if (state) {
            const cityInfo = await City.findOne({where: {nameNormal: city, stateId: state.id, countryId: country.id }})
            return res.send({ stateCode: cityInfo ? state.code : '', countryName: country.nameNormal})
        } else {
            return res.send({ stateCode: '', countryName: country.nameNormal})
        }
    } catch (e) {
        next()
    }
})

module.exports = router;