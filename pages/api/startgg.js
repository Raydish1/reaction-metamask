/*Code to handle startgg api and get tournament data*/

require('dotenv').config({ path: './.env.local' });

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const startggKey = process.env.STARTGG_KEY;

export default async function handler(req, res) {
  try {
    if (req.query.type === 'schedule') {
      const leagueSlug = req.query.leagueSlug;
      const schedule = await getLeagueScheduleWithWinners(leagueSlug); 
      if (schedule) {
        res.status(200).json({ schedule: schedule });
      } else {
        res.status(500).json({ error: "Failed to fetch schedule" });
      }
    } else {
      res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getLeagueScheduleWithWinners(leagueSlug) {
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Accept': 'application/json',
          Authorization: 'Bearer ' + startggKey,
        },
        body: JSON.stringify({
          query: `
            query LeagueSchedule {
              league(slug: "${leagueSlug}") {
                id
                name
                events(query: {
                  page: 1,
                  perPage: 100
                }) {
                  pageInfo {
                    totalPages
                    total
                  }
                  nodes {
                    id
                    name
                    startAt
                    slug  # Add slug here
                    tournament {
                      id
                      name
                    }
                    standings(query: {
                      perPage: 1,
                      page: 1
                    }){
                      nodes {
                        placement
                        entrant {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Start.gg API Error:", response.status, errorData);
      throw new Error("Start.gg API request failed");
    }

    const data = await response.json();
    const events = data.data.league.events;

    // get first place from standings
    events.nodes.forEach((event) => {
      const firstPlace = event.standings.nodes[0]?.entrant?.name;
      event.firstPlace = firstPlace || "No winner found";
      delete event.standings; //removes standings data to reduce response size
    });

    return events;
  } catch (error) {
    console.error("Error fetching league schedule:", error);
    return null;
  }
}