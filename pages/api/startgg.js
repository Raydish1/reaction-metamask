require('dotenv').config({ path: './.env.local' }); 

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const startggKey = process.env.STARTGG_KEY; 


export default async function handler(req, res) {
    try {
        if (req.query.type === 'event') { //testing implementation, not really using this
            const eventId = await getEventId('winter-championship-north-america-2025', 'brawlhalla-championship-2v2');
            if (eventId) {
                res.status(200).json({ eventId: eventId });
            } else {
                res.status(500).json({ error: "Failed to fetch event ID" });
            }
        } else if (req.query.type === 'schedule') { 
            
            const leagueSlug = req.query.leagueSlug; 
            const schedule = await getLeagueSchedule(leagueSlug);
            if (schedule) {
                res.status(200).json({ schedule: schedule });
            } else {
                res.status(500).json({ error: "Failed to fetch schedule" });
            }
        } else {
            // no or invalid type parameter is provided
            res.status(400).json({ error: "Invalid request type" });
        }

    } catch (error) {
        console.error("Error in API route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//functions for each type of query

async function getEventId(tournamentName, eventName) {
    const eventSlug = `tournament/${tournamentName}/event/${eventName}`;

    try {
        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: "query EventQuery($slug:String) {event(slug: $slug) {id name}}",
                variables: { slug: eventSlug }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Start.gg API Error:", response.status, errorData);
            throw new Error("Start.gg API request failed");
        }

        const data = await response.json();
        return data.data.event.id;
    } catch (error) {
        console.error("Error fetching event ID:", error);
        return null; 
    }
}

async function getLeagueSchedule(leagueSlug) {
    try {
        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: `
                    query LeagueSchedule {
                      league(slug: "${leagueSlug}") {
                        id
                        name
                        events(query: {
                          page: 1,
                          perPage: 10
                        }) {
                          pageInfo {
                            totalPages
                            total
                          }
                          nodes {
                            id
                            name
                            startAt
                            tournament {
                              id
                              name
                            }
                          }
                        }
                      }
                    }
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Start.gg API Error:", response.status, errorData);
            throw new Error("Start.gg API request failed");
        }

        const data = await response.json();
        return data.data.league.events; 
    } catch (error) {
        console.error("Error fetching league schedule:", error);
        return null; 
    }
}