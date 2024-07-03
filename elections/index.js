import { electionMap } from "./components/map.js";
import { partyTally } from "./components/tally.js";

const mapContainer = d3.select("#map-container");
const tallyContainer = d3.select("#tally-container");

let partyScale = null;

let partyData = await d3.json("resources/partydata.json");
let mapData = await d3.json("resources/constituencies.geojson");
let previousResultsData = null;
let resultsData = null;

const update = () => {
    electionMap(mapContainer, {
        mapData,
        resultsData,
        partyScale
    });

    partyTally(tallyContainer, partyScale);
}

const init = () => {
    let domain = []; let range = [];

    partyData.parties.forEach(datum => {
        domain.push(datum.internal_name);
        range.push(datum);
    });

    partyScale = d3.scaleOrdinal()
        .domain(domain)
        .range(range);

    d3.csv("resources/results.csv")
        .then(data => {
            resultsData = data;

            d3.csv("resources/prevresults.csv")
                .then(previousData => {
                    data.forEach(row => {
                        const previousRow = previousData.find(prevRow => prevRow["ONS code"] === row.Identifier);
                        if(previousRow !== undefined){
                            partyScale.domain().forEach(partyName => {
                                row[partyName] = +row[partyName];
                                row[partyName + "Swing"] = row[partyName] - (Math.round(+previousRow[partyName] * 10) / 10);
                            });
                        } else {
                            partyScale.domain().forEach(partyName => {
                                row[partyName] = +row[partyName];
                                row[partyName + "Swing"] = "?";
                            });
                        }
                    })

                    update();
                });
        });
}

init();