import { setGlobalDispatcher } from "undici";
import { describe, expect, it } from "vitest";
import { allocineClientMockAgent } from "./allocine-client-mock";
import { getCoCastMembers, retrieveCastingFromId, retrieveCastingFromId2, retrieveFilmographyFromId, retrieveFilmographyFromId2, retrieveNameFromActorUrl, retrieveNameFromActorUrl2 } from "./filmography";


describe("Filmography ", () => {
  setGlobalDispatcher(allocineClientMockAgent);
  it("should contain all movies", async () => {
    // given
    const id = "16349";
    // when
    const filmography = await retrieveFilmographyFromId(id);
    const filmography2 = await retrieveFilmographyFromId2(id);
    // then
    expect(filmography.length).toBeGreaterThan(20);
    expect(filmography).toEqual(expect.objectContaining(filmography2))
  });
  
});

describe("Casting", () => {
  setGlobalDispatcher(allocineClientMockAgent);
  it("should contain all actors", async () => {
    // given
    const movieId = "196208";
    // when
    const casting = await retrieveCastingFromId(movieId);
    const casting2 = await retrieveCastingFromId2(movieId);
    // then
    expect(casting.length).toBeGreaterThan(6);
    expect(casting).toEqual(expect.objectContaining(casting))
  });
});

describe("Actor page", () => {
  setGlobalDispatcher(allocineClientMockAgent);
  it("should contain actor information", async () => {
    // given
    const url =
      "https://www.allocine.fr/personne/fichepersonne_gen_cpersonne=3073.html";
    // when
    const actorDescription = await retrieveNameFromActorUrl(url);
    const actorDescription2 = await retrieveNameFromActorUrl2(url);
    // then
    expect(actorDescription.name).toBe("Harry Carey Jr.");
    expect(actorDescription.name).toBe(actorDescription2.name);
  });
});

describe("Get CoCast", () => {
  setGlobalDispatcher(allocineClientMockAgent);
  it("should find first co-cast of first movie", async () => {
    // given
    const alloId = "16349";
    
    // when
    const result = await getCoCastMembers(alloId);
    // then
    expect(result[0]).toBe("Alexandra Dean");
    // expect(result[result.length - 1]).toBe("Alexandra Dean");
  });
});


const expectedResults = [
  "Alexandra Dean",
  "G. David Schine",
  "James R. Silke",
  "Harry Keller",
  "Hedy Lamarr",
  "George Nader",
  "Irwin Allen",
  "Ronald Colman",
  "Groucho Marx",
  "Harpo Marx",
  "Chico Marx",
  "Virginia Mayo",
  "Agnes Moorehead",
  "Vincent Price",
  "Marc Allégret",
  "Edgar G. Ulmer",
  "Massimo Serato",
  "Cathy O'Donnell",
  "Robert Beatty",
  "Guido Celano",
  "Enrico Glori",
  "Gérard Oury",
  "Richard O'Sullivan",
  "Franco Coop",
  "Cesare Danova",
  "Mino Doro",
  "Norman Z. McLeod",
  "Bob Hope",
  "Francis L. Sullivan",
  "Frank Faylen",
  "Joseph H. Lewis",
  "John Farrow",
  "Ray Milland",
  "MacDonald Carey",
  "Mona Freeman",
  "Harry Carey Jr.",
  "Taylor Holmes",
  "Cecil B. DeMille",
  "George Sanders",
  "Victor Mature",
  "Angela Lansbury",
  "Henry Wilcoxon",
  "Olive Deering",
  "Fay Holden",
  "Julia Faye",
  "Robert Stevenson",
  "Louis Hayward",
  "Gene Lockhart",
  "Hillary Brooke",
  "Rhys Williams",
  "Moroni Olsen",
  "Richard Thorpe",
  "Robert Walker",
  "June Allyson",
  "Carl Esmond",
  "Ludwig Stossel",
  "George Cleveland",
  "Jacques Tourneur",
  "George Brent",
  "Paul Lukas",
  "Albert Dekker",
  "Jean Negulesco",
  "Peter Lorre",
  "Paul Henreid",
  "Victor Francen",
  "Sydney Greenstreet",
  "Eduardo Ciannelli",
  "Joseph Calleia",
  "Steven Geray",
  "Alexander Hall",
  "Vincente Minnelli",
  "William Powell",
  "James Craig",
  "Fay Bainter",
  "Henry O'Neill",
  "Spring Byington",
  "Victor Fleming",
  "Spencer Tracy",
  "John Garfield",
  "Frank Morgan",
  "Akim Tamiroff",
  "Sheldon Leonard",
  "John Qualen",
  "Donald Meek",
  "King Vidor",
  "Robert Young",
  "Ruth Hussey",
  "Charles Coburn",
  "Van Heflin",
  "Bonita Granville",
  "Douglas Wood",
  "Busby Berkeley",
  "Robert Z. Leonard",
  "Judy Garland",
  "Lana Turner",
  "Jackie Cooper",
  "Charles Winninger",
  "Clark Gable",
  "Felix Bressart",
  "Oscar Homolka",
  "Eve Arden",
  "Sig Ruman",
  "Jack Conway",
  "Claudette Colbert",
  "Lionel Atwill",
  "Chill Wills",
  "John Cromwell",
  "Charles Boyer",
  "Alan Hale",
  "Walter Kingsford",
  "Stanley Fields",
  "Charles D. Brown",
  "Robert Greig",
  "Gustav Machaty",
  "Pierre Nay",
  "Andre Nox",
];
