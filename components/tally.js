export const partyTally = (parent, partyScale) => {
    let data = partyScale.range();

    data = data.filter(datum => datum.vote !== "n/a");

    const boxJoin = parent.selectAll(".tally-box")
        .data(data)
        .join("div")
            .attr("class", "tally-box")
            .style("background-color", party => party.bg_colour)
            .style("color", party => party.fg_colour);

    boxJoin
        .append("div")
            .text(party => party.shortened_name)
            .style("font", "bold 24px \"PlexSansRegular\"");

    boxJoin
        .append("div")
            .text(party => (`${party.seats} seat` + (party.seats !== 1 ? "s" : "")))
    
    boxJoin
        .append("div")
            .text(party => `${party.vote.toFixed(1)}%`)
}