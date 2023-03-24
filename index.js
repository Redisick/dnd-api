const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;
const URL = "https://dnd.su";

function search(html) {
    const $ = cheerio.load(html);
    const spells = []; 
    $('.card-wrapper', html).each(function () {

        const spellAttributes = [];     
        const paramsArr = [];  
        const title = $(this).find('.card-title').text();
        if (title !== 'По вашему запросу ничего не найдено...'){
            $(this).find('.card-body').find('.params').find('li').each(function () {
                paramsArr.push($(this).text());
            });

            if (title) {
                const level = paramsArr[0].substring(0, paramsArr[0].indexOf(','));
                const school = paramsArr[0].substring(paramsArr[0].indexOf(',')+2);
                const castingTime = paramsArr[1].substring(paramsArr[1].indexOf(':')+2);
                const range = paramsArr[2].substring(paramsArr[2].indexOf(':')+2);
                const components = paramsArr[3].substring(paramsArr[3].indexOf(':')+2);
                const duration = paramsArr[4].substring(paramsArr[4].indexOf(':')+2);
                const classes = paramsArr[5].substring(paramsArr[5].indexOf(':')+2).split(', ');
                let archetypes = [];
                let n = 5;
                if (paramsArr.length > 8){
                    n = 6;
                    archetypes = paramsArr[n].substring(paramsArr[6].indexOf(':')+2).split(', ');
                }                  
                const source = paramsArr[n+1].substring(paramsArr[7].indexOf(':')+2);
                const desc = paramsArr[n+2];
                const link = URL + $(this).find('a').attr('href');
                
                spellAttributes.push({
                    title,
                    level,
                    school,
                    castingTime,
                    range,
                    components,
                    duration,
                    classes,
                    archetypes,
                    source,
                    desc,
                    link
                });

                spells.push(...spellAttributes);
            }
        }                              
    })
    return spells;
}

app.get('/', async (req, res) => {
    res.send('Welcome to DnD.su scraper API <3 try https://dnd-api.cyclic.app/spells/class12/1');
});

// get all spells
app.get('/spells', (req, res) => {
    axios(URL + '/spells')
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const spells = [];

            $('.list-item-wrapper', html).each(function () { 
                const title = $(this).find('.list-item-title').text();
                const level = $(this).find('.list-mark__level').attr('title');
                const school = $(this).find('.list-svg__school').attr('title');
                const path = $(this).attr('href');
                const url = URL + $(this).attr('href');

                spells.push({
                    title,
                    level,
                    school,
                    url,
                    path
                });
            })
            res.json(spells);
        }).catch(err => console.log(err));
})

// get spells by class
app.get('/spells/class:classId/:page', (req, res) => {

    const { classId } = req.params;
    const { page } = req.params;

    axios(URL + `/spells/?search=&class=${classId}&page=${page}`)
        .then(response => {
            const html = response.data;
            const spells = search(html);

            res.json(spells);
        }).catch(err => console.log(err));
})

// get spells by class and level
app.get('/spells/class:classId/level:level/:page', (req, res) => {

    const { classId } = req.params;
    const { level } = req.params;
    const { page } = req.params;

    axios(URL + `/spells/?search=&level=${level}&class=${classId}&page=${page}`)
        .then(response => {
            const html = response.data;
            const spells = search(html);

            res.json(spells);
        }).catch(err => console.log(err));
})

// get spells by archetype and level
app.get('/spells/archetype:archetypeId/level:level/:page', (req, res) => {

    const { archetypeId } = req.params;
    const { level } = req.params;
    const { page } = req.params;

    axios(URL + `/spells/?search=&level=${level}&archetype=${archetypeId}&page=${page}`)
        .then(response => {
            const html = response.data;
            const spells = search(html);
            
            res.json(spells);
        }).catch(err => console.log(err));
})

// get spells by archetype, class and level
app.get('/spells/class:classId/archetype:archetypeId/level:level/:page', (req, res) => {

    const { classId } = req.params;
    const { archetypeId } = req.params;
    const { level } = req.params;
    const { page } = req.params;

    axios(URL + `/spells/?search=&level=${level}&class=${classId}&archetype=${archetypeId}&page=${page}`)
        .then(response => {
            const html = response.data;
            const spells = search(html);

            res.json(spells);
        }).catch(err => console.log(err));
})

// get specific spell by id
app.get('/spells/:spellId', (req, res) => {
    
    const { spellId } = req.params;

    axios(URL + `/spells/${spellId}`)
        .then(response => {
            const html = response.data;
            
            const $ = cheerio.load(html);
            
            const spellAttributes = [];
            const paramsArr = [];       
            
            const title = $('.card-wrapper', html).find('.card-title').text();
            $('.card-wrapper', html).find('.card-body').find('.params').find('li').each(function () {
                paramsArr.push($(this).text());
            });

            const level = paramsArr[0].substring(0, paramsArr[0].indexOf(','));
            const school = paramsArr[0].substring(paramsArr[0].indexOf(',')+2);
            const castingTime = paramsArr[1].substring(paramsArr[1].indexOf(':')+2);
            const range = paramsArr[2].substring(paramsArr[2].indexOf(':')+2);
            const components = paramsArr[3].substring(paramsArr[3].indexOf(':')+2);
            const duration = paramsArr[4].substring(paramsArr[4].indexOf(':')+2);
            const classes = paramsArr[5].substring(paramsArr[5].indexOf(':')+2).split(', ');
            const archetypes = paramsArr[6].substring(paramsArr[6].indexOf(':')+2).split(', ')
            const source = paramsArr[7].substring(paramsArr[7].indexOf(':')+2);
            const desc = paramsArr[8];
            const link = URL + `/spells/${spellId}`;

            spellAttributes.push({
                title,
                level,
                school,
                castingTime,
                range,
                components,
                duration,
                classes,
                archetypes,
                source,
                desc,
                link
            });
           
            res.json(...spellAttributes);
        }).catch(err => console.log(err));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

