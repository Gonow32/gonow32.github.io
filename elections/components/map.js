export const electionMap = (parent, parameters) => {
    const {
        mapData,
        resultsData,
        partyScale
    } = parameters;

    const parentWidth = +parent.attr("width");
    const parentHeight = +parent.attr("height");

    const constBreakdown = d3.select("#constituency-breakdown");

    parent.selectAll("#map-group").data([null], d => d)
        .join(
            enter => enter.append("g")
                .attr("id", "map-group")
        );
    
    const projectionObj = d3.geoConicEqualArea().fitExtent(
        [[0, 0], [parentWidth, parentHeight]],
        mapData
    );
    
    const pathProjection = d3.geoPath(projectionObj);

    const mapGroup = d3.select("#map-group");

    const mapZoom = d3.zoom()
        .scaleExtent([1, 12])
        .translateExtent([[0, 0], [parentWidth, parentHeight]])
        .on("zoom", e => 
            mapGroup.attr("transform", `translate(${e.transform.x}, ${e.transform.y}) scale(${e.transform.k})`));

    mapGroup.call(mapZoom);

    mapGroup.selectAll("path")
        .data(mapData.features)
        .join("path")
            .attr("class", "constituency-path")
            .attr("id", feature => feature.properties.PCON24CD)
            .attr("d", pathProjection)
            .attr("style", feature => {
                let colour = null;
                resultsData.forEach(row => {
                    if(row.Identifier === feature.properties.PCON24CD && partyScale.domain().includes(row.PredictedWinner)){
                        colour = partyScale(row.PredictedWinner).bg_colour;
                    }
                });
                return `fill:${colour}`;
            })
            .on("mousemove", (event, feature) => {
                constBreakdown.style("left", event.pageX + 15);
                constBreakdown.style("top", event.pageY + 15);

                const elementHeight = constBreakdown.node().clientHeight;
                const scrollY = document.documentElement.scrollTop || document.body.scrollTop;

                if((elementHeight + (event.pageY - scrollY)) > document.body.clientHeight){
                    constBreakdown.style("top", event.pageY - (elementHeight + 15));
                }
            })
            .on("mouseover", (event, feature) => {
                constBreakdown.select("#constituency-name")
                    .text(feature.properties.PCON24NM);

                let currentRow = null;
                
                resultsData.forEach(row => {
                    if(row.Identifier === feature.properties.PCON24CD){
                        currentRow = row;
                    }
                });

                if(currentRow != null){
                    constBreakdown.select("#const-current-winner")
                        .style("fill", partyScale(currentRow.PredictedWinner).bg_colour);

                    constBreakdown.select("#const-past-winner")
                        .style("fill", partyScale(currentRow.PastWinner).bg_colour);

                    if(currentRow.PredictedWinner !== currentRow.PastWinner){
                        constBreakdown.select("#const-change").text(partyScale(currentRow.PredictedWinner).shortened_name
                            + " gain from " + partyScale(currentRow.PastWinner).shortened_name)
                            .style("fill", partyScale(currentRow.PredictedWinner).fg_colour);
                    } else {
                        constBreakdown.select("#const-change").text(partyScale(currentRow.PredictedWinner).shortened_name + " hold")
                            .style("fill", partyScale(currentRow.PredictedWinner).fg_colour);
                    }

                    let partyVotes = [];

                    partyScale.range().forEach(partyObj => {
                        partyVotes.push({
                            name: partyObj.internal_name,
                            vote: currentRow[partyObj.internal_name],
                            swing: currentRow[partyObj.internal_name + "Swing"]
                        });
                    });

                    partyVotes.sort((a, b) => b.vote - a.vote);

                    let i = 0;

                    partyVotes.forEach(party => {
                        let entry = constBreakdown.select("#result-container-" + i.toString());

                        if(party.vote === 0){
                            entry.style("display", "none");
                        } else {
                            entry.select("#result-tab-rect-" + i.toString())
                                .style("fill", partyScale(party.name).bg_colour);

                            entry.select("#result-text-" + i.toString())
                                .text(partyScale(party.name).shortened_name + ": " + party.vote.toFixed(1) + "% ("
                                    + ((party.swing >= 0) ? "+" : "") + party.swing.toFixed(1) + ")")
                                .style("font-weight", i === 0 ? "bold" : "regular");

                            entry.style("display", "flex")
                        }

                        i = i + 1;
                    })

                    constBreakdown.style("display", "flex");
                }
            })
            .on("mouseleave", (event, feature) => {
                constBreakdown.style("display", "none");
            });
}