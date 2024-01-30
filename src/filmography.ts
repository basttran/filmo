import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { fetch } from "undici";
import { mockedCastings, mockedFilmography } from "./mock-data";
import { flow, pipe } from "fp-ts/lib/function";
import { either as E, taskEither as TE, taskOption as TO } from 'fp-ts';
import * as O from 'fp-ts/lib/Option';
import { val } from "cheerio/lib/api/attributes";
import { Either } from "fp-ts/lib/Either";

type Movie = {
  title: string;
  url: string;
};

export const retrieveFilmographyFromId = async (alloId: string) => {
  const url = `https://www.allocine.fr/personne/fichepersonne-${alloId}/filmographie/`;
  const response = await fetch(url);
  const rawContent = await response.text();
  const $ = cheerio.load(rawContent);
  const nodes = $("td a");
  const result: Movie[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    result.push({ title: element.attribs.title, url: element.attribs.href });
  }

  return result;
};

const toFilmographyUrl = (alloId: string) => `https://www.allocine.fr/personne/fichepersonne-${alloId}/filmographie/`

const fetchFilmoFromUrl = (url: string) => TE.tryCatch(() => fetch((url)), () => `can't fetch filmo`)
const getText = (response: unknow) => TE.tryCatch(() => response.text(), () => `can't extract document`)


export const retrieveFilmographyFromId2 = async (alloId: string) => {
    const task = pipe(
        alloId,
        toFilmographyUrl,
        fetchFilmoFromUrl,
        TE.chain(getText)
        // fetchFilmoFromUrl,
        // TE.map((response) => response.text()),
        )

        task()
};


export const retrieveCastingFromId = async (movieId: string) => {
  const url = `https://www.allocine.fr/film/fichefilm-${movieId}/casting/`;
  const response = await fetch(url);
  const rawContent = await response.text();
  const $ = cheerio.load(rawContent);
  const nodes = $("a.meta-title-link");
  const mockCastings = {};
  const result: string[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    result.push(element.attribs.href);
    mockCastings[movieId] = element.attribs.href;
  }
  return result;
};


export const retrieveNameFromActorUrl = async (url: string) => {
  const response = await fetch(url);
  const rawContent = await response.text();
  writeFileSync(
    `./src/actors/${url
      .replace(
        "https://www.allocine.fr/personne/fichepersonne_gen_cpersonne=",
        ""
      )
      .replace(".html", "")}`,
    rawContent
  );
  const $ = cheerio.load(rawContent);
  const nodes = $("div.titlebar-title.titlebar-title-lg");
  return { name: nodes.text() };
};  

const doGetCoCastMembers =
  (
    getFilmo: (alloId: string) => Promise<Movie[]>,
    getCasting: (filmId: string) => Promise<string[]>,
    getName: (alloId: string) => Promise<{ name: string }>
  ) =>
  async (alloId: string) => {
    const filmography = await getFilmo(alloId);
    const filmIds = filmography.map((film) =>
      film.url.replace("/film/fichefilm_gen_cfilm=", "").replace(".html", "")
    );
    const castings = await Promise.all(
      filmIds.map((filmId) => getCasting(filmId))
    );
    const mockCasting = {};
    filmIds.forEach((id: string, index: number) => {
      mockCasting[id] = castings[index];
    });

    const uniqueCastings = [...new Set(castings.flatMap((x) => x))];

    const descriptions = await Promise.all(
      uniqueCastings.map((cast) => getName(`https://www.allocine.fr${cast}`))
    );

    return descriptions.map((description) => description.name);
  };

export const getCoCastMembers = doGetCoCastMembers(
  retrieveFilmographyFromId,
  retrieveCastingFromId,
  retrieveNameFromActorUrl
);